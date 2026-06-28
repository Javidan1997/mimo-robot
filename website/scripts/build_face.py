"""Build Mimo's production model:
  1. detect the head screen faces (same heuristic as screen_detect)
  2. blacken them (remove the baked-in face)
  3. add a named 'MimoFace' plane just in front of the screen (UV 0..1)
  4. downsize textures + Draco-compress + export GLB

Run: blender -b --python build_face.py -- <in.glb> <out.glb> <maxtex>
"""
import sys, json
import bpy, bmesh
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
src, dst = argv[0], argv[1]
max_tex = int(argv[2]) if len(argv) > 2 else 2048
NZ, NY, ZFRAC = 0.25, -0.15, 0.12

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
obj = [o for o in bpy.data.objects if o.type == "MESH"][0]
coll = bpy.context.collection

# recenter geometry on origin (matches the old compress step)
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
obj.location = (0, 0, 0)
bpy.context.view_layer.update()

M = obj.matrix_world
N = M.to_3x3()
me = obj.data
bb = [M @ Vector(c) for c in obj.bound_box]
zs = [v.z for v in bb]
zmin, zmax = min(zs), max(zs)
z_thr = zmin + (zmax - zmin) * (0.5 + ZFRAC)

sel, centers, normals = [], [], []
for poly in me.polygons:
    wn = (N @ poly.normal).normalized()
    wc = M @ poly.center
    if wn.z >= NZ and wn.y <= NY and wc.z >= z_thr:
        sel.append(poly.index); centers.append(wc); normals.append(wn)
print(f"[build] selected {len(sel)} screen faces")

center = sum(centers, Vector()) / len(centers)
normal = sum(normals, Vector()).normalized()
up_ref = Vector((0, 0, 1))
right = up_ref.cross(normal).normalized()
up = normal.cross(right).normalized()
us, vs = [], []
sset = set(sel)
for poly in me.polygons:
    if poly.index in sset:
        for vi in poly.vertices:
            d = (M @ me.vertices[vi].co) - center
            us.append(d.dot(right)); vs.append(d.dot(up))
w, h = max(us) - min(us), max(vs) - min(vs)
center = center + right * ((max(us) + min(us)) / 2) + up * ((max(vs) + min(vs)) / 2)
euler = normal.to_track_quat("Z", "Y").to_euler()
print("[build] plane center", [round(v, 3) for v in center], "size", round(w, 3), round(h, 3))

# --- 1) blacken the baked face ---
black = bpy.data.materials.new("ScreenBlack")
black.use_nodes = True
bsdf = black.node_tree.nodes.get("Principled BSDF")
bsdf.inputs["Base Color"].default_value = (0.012, 0.013, 0.016, 1)
if "Roughness" in bsdf.inputs:
    bsdf.inputs["Roughness"].default_value = 0.35
me.materials.append(black)
black_idx = len(me.materials) - 1
for i in sel:
    me.polygons[i].material_index = black_idx

# --- 2) add the MimoFace plane (in front of the screen) ---
fmesh = bpy.data.meshes.new("MimoFace")
bm = bmesh.new()
vlist = [bm.verts.new((-0.5, -0.5, 0)), bm.verts.new((0.5, -0.5, 0)),
         bm.verts.new((0.5, 0.5, 0)), bm.verts.new((-0.5, 0.5, 0))]
face = bm.faces.new(vlist)
uvl = bm.loops.layers.uv.new("UVMap")
uvcoords = [(0, 0), (1, 0), (1, 1), (0, 1)]
for loop, uvc in zip(face.loops, uvcoords):
    loop[uvl].uv = uvc
bm.to_mesh(fmesh); bm.free()

fmat = bpy.data.materials.new("MimoFaceMat")
fmat.use_nodes = True
fmesh.materials.append(fmat)

face_obj = bpy.data.objects.new("MimoFace", fmesh)
coll.objects.link(face_obj)
face_obj.location = center + normal * 0.02
face_obj.rotation_euler = euler
face_obj.scale = (w * 1.1, h * 1.16, 1.0)

# --- 3) downsize textures ---
for img in bpy.data.images:
    if not img.has_data:
        continue
    iw, ih = img.size
    if max(iw, ih) > max_tex:
        s = max_tex / float(max(iw, ih))
        img.scale(max(1, int(iw * s)), max(1, int(ih * s)))
        img.pack()

# --- 4) export Draco + WEBP ---
bpy.ops.export_scene.gltf(
    filepath=dst, export_format="GLB",
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_image_format="WEBP", export_yup=True, export_apply=True,
)
print("[build] exported ->", dst)
