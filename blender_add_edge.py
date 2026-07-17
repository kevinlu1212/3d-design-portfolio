"""
Blender Python 脚本：给字母模型添加厚度 + 黑色边缘
使用方法：
1. 打开 Blender
2. 切换到 Scripting 工作区
3. 新建脚本，粘贴此代码
4. 修改底部 FILE_PATH 为你的 GLB 文件路径
5. 点击运行
"""
import bpy

# ========== 配置 ==========
FILE_PATH = r"D:\作品集\toy-lab-os\L.glb"
EXPORT_PATH = r"D:\作品集\toy-lab-os\L.glb"
THICKNESS = 0.05
# ==========================

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def import_glb(filepath):
    bpy.ops.import_scene.gltf(filepath=filepath)
    return [obj for obj in bpy.context.selected_objects if obj.type == 'MESH']

def get_principled_bsdf(mat):
    """自动查找 Principled BSDF 节点，兼容不同 Blender 版本"""
    for node in mat.node_tree.nodes:
        if node.type == 'BSDF_PRINCIPLED':
            return node
    return None

def create_materials(obj):
    obj.data.materials.clear()
    
    # 白色主体
    mat_white = bpy.data.materials.new(name="White Body")
    mat_white.use_nodes = True
    bsdf_white = get_principled_bsdf(mat_white)
    if bsdf_white:
        bsdf_white.inputs["Base Color"].default_value = (0.95, 0.95, 0.95, 1)
        bsdf_white.inputs["Metallic"].default_value = 0.0
        bsdf_white.inputs["Roughness"].default_value = 0.15
        if "Specular" in bsdf_white.inputs:
            bsdf_white.inputs["Specular"].default_value = 0.8
    
    # 黑色边缘
    mat_black = bpy.data.materials.new(name="Black Edge")
    mat_black.use_nodes = True
    bsdf_black = get_principled_bsdf(mat_black)
    if bsdf_black:
        bsdf_black.inputs["Base Color"].default_value = (0.02, 0.02, 0.02, 1)
        bsdf_black.inputs["Metallic"].default_value = 0.1
        bsdf_black.inputs["Roughness"].default_value = 0.3
        if "Specular" in bsdf_black.inputs:
            bsdf_black.inputs["Specular"].default_value = 0.5
    
    # 分配材质槽
    obj.data.materials.append(mat_white)  # 槽 0：白色
    obj.data.materials.append(mat_black)  # 槽 1：黑色
    
    # 给所有面分配白色材质
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.object.material_slot_assign(slot_index=0)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # 添加 Solidify 修改器给内表面黑色边缘
    mod = obj.modifiers.new(name="Solidify", type='SOLIDIFY')
    mod.thickness = THICKNESS
    mod.offset = -1
    mod.use_flip_normals = True
    mod.use_rim = True
    mod.material_offset = 1
    bpy.ops.object.modifier_apply(modifier="Solidify")

def export_glb(filepath):
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_materials='EXPORT'
    )

def main():
    print(f"\n{'='*50}")
    print(f"开始处理: {FILE_PATH}")
    print(f"{'='*50}")
    
    clear_scene()
    print("✓ 清空场景")
    
    objects = import_glb(FILE_PATH)
    if not objects:
        print("✗ 未找到模型")
        return
    
    obj = objects[0]
    print(f"✓ 导入模型: {obj.name}")
    
    create_materials(obj)
    print("✓ 创建白色主体 + 黑色边缘材质")
    
    export_glb(EXPORT_PATH)
    print(f"✓ 导出完成: {EXPORT_PATH}")
    
    print(f"\n{'='*50}")
    print("完成！")
    print(f"{'='*50}\n")

if __name__ == "__main__":
    main()
