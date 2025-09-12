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

const props = defineProps<{ packageId: string }>();
const emit = defineEmits(['saved']);

const treeData = ref<any[]>([]);
const checkedKeys = ref<string[]>([]);
const tree = ref<InstanceType<typeof ElTree>>();
const treeProps = { label: 'label', children: 'children' } as const;

const buildTree = (data: Permission[]): any[] => {
  return (data || []).map(item => {
    const node: any = { id: item.id, label: item.name };
    if (Array.isArray(item.children) && item.children.length) {
      node.children = buildTree(item.children);
    }
    return node;
  });
};

onMounted(async () => {
  const permRes = await getPermissionTree({});
  treeData.value = buildTree(permRes.data || []);
  const pkgRes = await getPermissionPackage(props.packageId);
  const ids = (() => {
    const permList = (pkgRes.data as any)?.permissions as any[] | undefined;
    if (!Array.isArray(permList)) return [] as string[];
    const collect = (arr: any[]): string[] => arr.flatMap((p: any) => {
      const selfId = p?.id ? [String(p.id)] : [];
      const childIds = Array.isArray(p?.children) ? collect(p.children) : [];
      return [...selfId, ...childIds];
    });
    return collect(permList);
  })();
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

const toggleNode = (node: any) => {
  if (node.expanded && typeof node.collapse === 'function') node.collapse();
  else if (!node.expanded && typeof node.expand === 'function') node.expand();
  else node.expanded = !node.expanded;
};

// Parent check cascades children; child does not affect parent
const onCheckChange = (data: any, checked: boolean) => {
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

