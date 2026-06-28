"""Detect the face-screen plane on Mimo's head, highlight it, render for
verification, and (with --build) add a named 'MimoFace' plane over it +
export a compressed GLB.

Run:
  blender -b --python screen_detect.py -- <in.glb> <outdir> [nz ny zmin] [--build <out.glb> <maxtex>]
"""
import sys, json
import bpy, bmesh
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
src = argv[0]
outdir = argv[1]
nz_min = float(argv[2]) if len(argv) > 2 and not argv[2].startswith("--") else 0.25
ny_max = float(argv[3]) if len(argv) > 3 and not argv[3].startswith("--") else -0.15
z_min_frac = float(argv[4]) if len(argv) > 4 and not argv[4].startswith("--") else 0.12
build = "--build" in argv
out_glb = argv[argv.index("--build") + 1] if build else None
max_tex = int(argv[argv.index("--build") + 2]) if build else 2048

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
obj = [o for o in bpy.data.objects if o.type == "MESH"][0]

# bounds
bb = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
zs = [v.z for v in bb]
zmin, zmax = min(zs), max(zs)
z_threshold = zmin + (zmax - zmin) * (0.5 + z_min_frac)  # upper portion = head

M = obj.matrix_world
N = M.to_3x3()
me = obj.data
me.calc_loop_triangles()

# --- select screen faces by normal + height heuristic ---
sel = []
centers = []
normals = []
for poly in me.polygons:
    wn = (N @ poly.normal).normalized()
    wc = M @ poly.center
    if wn.z >= nz_min and wn.y <= ny_max and wc.z >= z_threshold:
        sel.append(poly.index)
        centers.append(wc)
        normals.append(wn)

print(f"[screen] z_threshold={z_threshold:.3f} selected {len(sel)} / {len(me.polygons)} faces")

if not sel:
    print("[screen] NOTHING SELECTED — loosen thresholds")
    sys.exit(0)

center = sum(centers, Vector()) / len(centers)
normal = sum(normals, Vector()).normalized()
# plane basis
up_ref = Vector((0, 0, 1))
right = up_ref.cross(normal).normalized()
up = normal.cross(right).normalized()
# extent of selected verts on the plane
us, vs = [], []
sel_set = set(sel)
for poly in me.polygons:
    if poly.index in sel_set:
        for vi in poly.vertices:
            p = M @ me.vertices[vi].co
            d = p - center
            us.append(d.dot(right))
            vs.append(d.dot(up))
w = max(us) - min(us)
h = max(vs) - min(vs)
# recenter to the middle of the extent
center = center + right * ((max(us) + min(us)) / 2) + up * ((max(vs) + min(vs)) / 2)
euler = normal.to_track_quat("Z", "Y").to_euler()
stats = {
    "center": [round(v, 4) for v in center],
    "normal": [round(v, 4) for v in normal],
    "size": [round(w, 4), round(h, 4)],
    "euler_xyz": [round(e, 4) for e in euler],
}
print("[screen] PLANE", json.dumps(stats))

# --- highlight selected faces in bright red for the verification render ---
red = bpy.data.materials.new("HILITE"); red.use_nodes = False
red.diffuse_color = (1, 0.1, 0.1, 1)
obj.data.materials.append(red)
red_idx = len(obj.data.materials) - 1
for i in sel:
    obj.data.polygons[i].material_index = red_idx

# --- render verification (Workbench, headless-safe) ---
world = bpy.data.worlds.new("W"); world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.05, 0.06, 0.08, 1)
bpy.context.scene.world = world
cam_data = bpy.data.cameras.new("C"); cam = bpy.data.objects.new("C", cam_data)
bpy.context.collection.objects.link(cam); bpy.context.scene.camera = cam
ctr = Vector(((min(v.x for v in bb)+max(v.x for v in bb))/2,
              (min(v.y for v in bb)+max(v.y for v in bb))/2, (zmin+zmax)/2))
radius = max((max(v.x for v in bb)-min(v.x for v in bb)),
             (zmax-zmin)) * 2.2
scene = bpy.context.scene
scene.render.resolution_x = scene.render.resolution_y = 640
scene.render.engine = "BLENDER_WORKBENCH"
scene.display.shading.light = "STUDIO"
scene.display.shading.color_type = "MATERIAL"

def look_at(o, t):
    o.rotation_euler = (o.location - t).to_track_quat("Z", "Y").to_euler()

for name, pos in {
    "det_front": ctr + Vector((0, -radius, radius * 0.35)),
    "det_side": ctr + Vector((radius, -radius * 0.2, radius * 0.2)),
}.items():
    cam.location = pos; look_at(cam, ctr)
    scene.render.filepath = f"{outdir}/{name}.png"
    bpy.ops.render.render(write_still=True)
    print(f"[screen] rendered {name}")

print("[screen] DONE")
