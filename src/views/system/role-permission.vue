<template>
    <div>
        <el-tree
            class="mgb10"
            ref="tree"
            :data="treeData"
            node-key="id"
            default-expand-all
            show-checkbox
            :default-checked-keys="checkedKeys"
        />
        <el-button type="primary" @click="onSubmit">保存权限</el-button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElTree, ElMessage } from 'element-plus';
import { listPermissions } from '@/api/permission';
import { getRolePermissionIds, updateRolePermissions } from '@/api/role';
import type { Permission } from '@/types/permission';

const props = defineProps<{ roleId: string }>();

const treeData = ref<any[]>([]);
const checkedKeys = ref<string[]>([]);
const tree = ref<InstanceType<typeof ElTree>>();

const buildTree = (data: Permission[]): any[] => {
    return data.map(item => {
        const node: any = { id: item.id, label: item.name };
        if (Array.isArray(item.children) && item.children.length) {
            node.children = buildTree(item.children);
        }
        return node;
    });
};

onMounted(async () => {
    const permRes = await listPermissions({});
    treeData.value = buildTree(permRes.data || []);
    const checkedRes = await getRolePermissionIds(props.roleId);
    checkedKeys.value = checkedRes.data || [];
});

const onSubmit = async () => {
    const keys = [
        ...tree.value!.getCheckedKeys(false),
        ...tree.value!.getHalfCheckedKeys(),
    ] as string[];
    await updateRolePermissions(props.roleId, { permissionIds: keys });
    ElMessage.success('保存成功');
};
</script>

<style scoped></style>
