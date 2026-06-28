"""
Blender background script: import the raw Mimo scan, downsize its textures,
and re-export a Draco-compressed GLB suitable for the web.

Run:
  blender --background --python compress_mimo.py -- <input.glb> <output.glb> <maxtex>
"""
import sys
import bpy

argv = sys.argv
argv = argv[argv.index("--") + 1:] if "--" in argv else []
src = argv[0]
dst = argv[1]
max_tex = int(argv[2]) if len(argv) > 2 else 2048

# --- clean slate ---------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)

# --- import the raw scan -------------------------------------------------
bpy.ops.import_scene.gltf(filepath=src)

mesh_objs = [o for o in bpy.data.objects if o.type == "MESH"]
print(f"[mimo] imported {len(mesh_objs)} mesh object(s)")

# --- recenter geometry on the world origin, sat on the floor -------------
for o in mesh_objs:
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
for o in mesh_objs:
    o.location = (0.0, 0.0, 0.0)

# --- downsize textures ---------------------------------------------------
for img in bpy.data.images:
    if not img.has_data:
        continue
    w, h = img.size
    if max(w, h) > max_tex:
        scale = max_tex / float(max(w, h))
        nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
        print(f"[mimo] resizing image '{img.name}' {w}x{h} -> {nw}x{nh}")
        img.scale(nw, nh)
        img.pack()

# --- report poly count ---------------------------------------------------
tris = sum(len(o.data.loop_triangles) for o in mesh_objs if o.data) if False else None

# --- export Draco-compressed GLB, textures as WEBP -----------------------
bpy.ops.export_scene.gltf(
    filepath=dst,
    export_format="GLB",
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_draco_position_quantization=12,
    export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=11,
    export_image_format="WEBP",
    export_yup=True,
    export_apply=True,
)
print(f"[mimo] exported -> {dst}")
