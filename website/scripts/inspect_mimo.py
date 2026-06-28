"""Inspect the Mimo scan: report bounds + render front/back/side views so we
can locate the screen/face on the head.

Run: blender --background --python inspect_mimo.py -- <input.glb> <outdir>
"""
import sys, math, json
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
src = argv[0]
outdir = argv[1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
meshes = [o for o in bpy.data.objects if o.type == "MESH"]
obj = meshes[0]

# world-space bounds
bb = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
xs = [v.x for v in bb]; ys = [v.y for v in bb]; zs = [v.z for v in bb]
mn = Vector((min(xs), min(ys), min(zs)))
mx = Vector((max(xs), max(ys), max(zs)))
ctr = (mn + mx) / 2
dim = mx - mn
info = {
    "min": [round(v, 4) for v in mn], "max": [round(v, 4) for v in mx],
    "center": [round(v, 4) for v in ctr], "dim": [round(v, 4) for v in dim],
    "verts": len(obj.data.vertices),
}
print("[inspect]", json.dumps(info))

# --- lighting + world ---
world = bpy.data.worlds.new("W"); world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.05, 0.06, 0.08, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 1.0
bpy.context.scene.world = world
light_data = bpy.data.lights.new("L", type="AREA"); light_data.energy = 600
light = bpy.data.objects.new("L", light_data)
bpy.context.collection.objects.link(light)
light.location = (ctr.x + dim.x, ctr.y - dim.y, ctr.z + dim.z)

# --- camera ---
cam_data = bpy.data.cameras.new("C"); cam = bpy.data.objects.new("C", cam_data)
bpy.context.collection.objects.link(cam)
bpy.context.scene.camera = cam
radius = max(dim) * 2.2

scene = bpy.context.scene
scene.render.resolution_x = 640
scene.render.resolution_y = 640
scene.render.film_transparent = False
# Workbench renders reliably in --background mode (EEVEE needs a GL context).
scene.render.engine = "BLENDER_WORKBENCH"
shading = scene.display.shading
shading.light = "STUDIO"
shading.color_type = "TEXTURE"

def look_at(o, target):
    d = (o.location - target)
    o.rotation_euler = d.to_track_quat("Z", "Y").to_euler()

views = {
    "front_+z": Vector((ctr.x, ctr.y, ctr.z + radius)),
    "back_-z": Vector((ctr.x, ctr.y, ctr.z - radius)),
    "right_+x": Vector((ctr.x + radius, ctr.y, ctr.z)),
    "front_+y": Vector((ctr.x, ctr.y + radius, ctr.z)),
}
for name, pos in views.items():
    cam.location = pos
    look_at(cam, ctr)
    scene.render.filepath = f"{outdir}/view_{name}.png"
    bpy.ops.render.render(write_still=True)
    print(f"[inspect] rendered {name}")

print("[inspect] DONE")
