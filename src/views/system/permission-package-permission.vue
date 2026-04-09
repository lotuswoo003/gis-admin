<template>
  <div>
    <div class="tree-wrap">
      <el-tree
        class="mgb10"
        ref="tree"
        :data="treeData"
        node-key="id"
        default-expand-all
        show-checkbox
        :default-checked-keys="checkedKeys"
        :props="treeProps"
        :expand-on-click-node="false"
        :check-strictly="true"
        @check-change="onCheckChange"
      >
        <template #default="{ node }">
          <span class="tree-node">
            <span class="label">{{ node.label }}</span>
            <el-link v-if="(node.children && node.children.length)" type="primary" :underline="false" @click.stop="toggleNode(node)">
              {{ node.expanded ? '折叠' : '展开' }}
            </el-link>
          </span>
        </template>
      </el-tree>
    </div>
    <el-button type="primary" @click="onSubmit">保存权限</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ElTree, ElMessage } from 'element-plus';
import { getPermissionTree } from '@/api/permission';
import { bindPermissionPackagePermissions, getPermissionPackage } from '@/api/permission-package';
import type { Permission } from '@/types/permission';
import type { PermissionPackage } from '@/types/permission-package';

const props = defineProps<{ packageId: string }>();
const emit = defineEmits(['saved']);

interface PermissionTreeNode {
  id: string;
  label: string;
  children?: PermissionTreeNode[];
}

interface ToggleableNode {
  expanded?: boolean;
  collapse?: () => void;
  expand?: () => void;
}

const treeData = ref<PermissionTreeNode[]>([]);
const checkedKeys = ref<string[]>([]);
const tree = ref<InstanceType<typeof ElTree>>();
const treeProps = { label: 'label', children: 'children' } as const;
const ENABLED_PERMISSION_FLAG = 0;

const filterEnabledPermissions = (data: Permission[]): Permission[] => {
  return (data || []).flatMap((item) => {
    if (item.disableFlag !== ENABLED_PERMISSION_FLAG) {
      return [];
    }
    return [{
      ...item,
      children: filterEnabledPermissions(item.children || []),
    }];
  });
};

const buildTree = (data: Permission[]): PermissionTreeNode[] => {
  return (data || []).map(item => {
    const node: PermissionTreeNode = { id: item.id, label: item.name };
    if (Array.isArray(item.children) && item.children.length) {
      node.children = buildTree(item.children);
    }
    return node;
  });
};

const collectPermissionIds = (permissions: Permission[]): string[] => {
  return (permissions || []).flatMap((permission) => {
    const currentIds = permission.id ? [String(permission.id)] : [];
    const childIds = Array.isArray(permission.children) ? collectPermissionIds(permission.children) : [];
    return [...currentIds, ...childIds];
  });
};

const collectVisibleTreeIds = (nodes: PermissionTreeNode[]): Set<string> => {
  return (nodes || []).reduce((ids, node) => {
    ids.add(node.id);
    if (Array.isArray(node.children) && node.children.length) {
      collectVisibleTreeIds(node.children).forEach((childId) => ids.add(childId));
    }
    return ids;
  }, new Set<string>());
};

const resolveCheckedIds = (permissionPackage: PermissionPackage | undefined): string[] => {
  if (!permissionPackage) {
    return [];
  }
  if (Array.isArray(permissionPackage.permissionIds) && permissionPackage.permissionIds.length) {
    return permissionPackage.permissionIds.map((id) => String(id));
  }
  if (Array.isArray(permissionPackage.permissions)) {
    return collectPermissionIds(permissionPackage.permissions);
  }
  return [];
};

onMounted(async () => {
  const permRes = await getPermissionTree({});
  const enabledPermissions = filterEnabledPermissions(permRes.data || []);
  treeData.value = buildTree(enabledPermissions);
  const visibleIds = collectVisibleTreeIds(treeData.value);
  const pkgRes = await getPermissionPackage(props.packageId);
  const ids = resolveCheckedIds(pkgRes.data).filter((id) => visibleIds.has(id));
  checkedKeys.value = ids;
  await nextTick();
  if (tree.value && Array.isArray(ids)) {
    tree.value.setCheckedKeys(ids);
  }
});

const onSubmit = async () => {
  const keys = [
    ...tree.value!.getCheckedKeys(false),
    ...tree.value!.getHalfCheckedKeys(),
  ] as string[];
  await bindPermissionPackagePermissions({ packageId: props.packageId, permissionIds: keys });
  ElMessage.success('保存成功');
  emit('saved');
};

const toggleNode = (node: ToggleableNode) => {
  if (node.expanded && typeof node.collapse === 'function') node.collapse();
  else if (!node.expanded && typeof node.expand === 'function') node.expand();
  else node.expanded = !node.expanded;
};

// Parent check cascades children; child does not affect parent
const onCheckChange = (data: PermissionTreeNode, checked: boolean) => {
  if (!tree.value) return;
  if (data && Array.isArray(data.children) && data.children.length) {
    tree.value.setChecked(data.id, checked, true);
  }
};
</script>

<style scoped>
.tree-wrap { height: 420px; overflow: auto; padding-right: 4px; }
.tree-node { display: inline-flex; gap: 8px; align-items: center; }
.tree-node .label { line-height: 1.6; }
</style>

