<template>
  <div class="menu-page">
    <div class="left">
      <div class="left-header">
        <el-input v-model="menuKeyword" placeholder="搜索菜单" clearable @input="applyMenuFilter" style="margin-right:8px;width: 160px;" />
        <el-button type="primary" :icon="CirclePlusFilled" @click="openAddMenu">新增菜单</el-button>
      </div>
      <el-tree
        class="menu-tree"
        :data="menuTree"
        node-key="id"
        default-expand-all
        highlight-current
        @node-click="onSelectMenu"
      />
    </div>
    <div class="right">
      <div class="right-header">
        <div>操作权限</div>
        <el-button type="primary" :icon="CirclePlusFilled" @click="openAdd" :disabled="!selectedMenuId">新增权限</el-button>
      </div>
      <TableCustom
        :columns="columns"
        :tableData="permissionData"
        row-key="id"
        :delFunc="handleDelete"
        :editFunc="handleEdit"
      >
        <template #operator="{ rows }">
          <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(rows)">编辑</el-button>
          <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(rows)">删除</el-button>
        </template>
      </TableCustom>
    </div>
    <el-dialog :title="isEdit ? '编辑权限' : '新增权限'" v-model="visible" width="700px" destroy-on-close :close-on-click-modal="false" @close="closeDialog">
      <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData" />
    </el-dialog>
    <el-dialog title="新增菜单" v-model="menuVisible" width="700px" destroy-on-close :close-on-click-modal="false">
      <TableEdit :form-data="menuRowData" :options="menuOptions" :edit="false" :update="saveMenu" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="system-menu">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled, Edit, Delete } from '@element-plus/icons-vue';
import TableCustom from '@/components/table-custom.vue';
import TableEdit from '@/components/table-edit.vue';
import { FormOption } from '@/types/form-option';
import { listPermissions, getPermissionChildren, getPermission, createPermission, updatePermission, deletePermission } from '@/api/permission';
import type { Permission, PermissionCreateRequest, PermissionUpdateRequest } from '@/types/permission';

// 左侧树：仅展示 type=1 的菜单
const menuTree = ref<any[]>([]);
const menuTreeRaw = ref<any[]>([]);
const menuKeyword = ref('');
const selectedMenuId = ref<string>('');

const buildMenuTree = (data: Permission[] | undefined | null): any[] => {
  if (!Array.isArray(data)) return [];
  return data
    .filter(item => item.type === '1')
    .map(item => ({
      id: item.id,
      label: item.name,
      children: buildMenuTree(item.children || [])
    }));
};

const loadMenuTree = async () => {
  const res = await listPermissions({});
  menuTreeRaw.value = buildMenuTree(res.data || []);
  applyMenuFilter();
};

const applyMenuFilter = () => {
  const kw = menuKeyword.value.trim();
  if (!kw) { menuTree.value = menuTreeRaw.value; return; }
  const filter = (nodes: any[]): any[] => nodes
    .map(n => ({ ...n, children: n.children ? filter(n.children) : [] }))
    .filter(n => n.label.includes(kw) || (n.children && n.children.length));
  menuTree.value = filter(menuTreeRaw.value);
};

// 右侧按钮权限列表：parentId = 左侧选中，且 type=2
const permissionData = ref<Permission[]>([]);
const loadButtons = async () => {
  if (!selectedMenuId.value) { permissionData.value = []; return; }
  const res = await getPermissionChildren({ parentId: selectedMenuId.value, type: '2' });
  permissionData.value = res.data || [];
};

const onSelectMenu = (node: any) => {
  selectedMenuId.value = node.id;
  loadButtons();
};

// 列
const columns = ref([
  { prop: 'name', label: '按钮名称', align: 'left' },
  { prop: 'code', label: '权限编码' },
  { prop: 'disableFlag', label: '是否禁用', formatter: (val: number) => (val ? '禁用' : '启用') },
  { prop: 'operator', label: '操作', width: 200 },
]);

// 弹窗与表单（按钮权限）
const visible = ref(false);
const isEdit = ref(false);
const rowData = ref<Permission>({ type: '2' } as Permission);

let options = ref<FormOption>({
  labelWidth: '100px',
  span: 12,
  list: [
    { type: 'input', label: '名称', prop: 'name', required: true },
    { type: 'input', label: '权限编码', prop: 'code', required: true },
    { type: 'switch', label: '是否禁用', prop: 'disableFlag', activeValue: 1, inactiveValue: 0, activeText: '禁用', inactiveText: '启用' },
  ]
});

const openAdd = () => {
  if (!selectedMenuId.value) return;
  rowData.value = { type: '2', parentId: selectedMenuId.value } as Permission;
  isEdit.value = false;
  visible.value = true;
};

const handleEdit = async (row: Permission) => {
  const res = await getPermission(row.id);
  rowData.value = res.data;
  isEdit.value = true;
  visible.value = true;
};

const updateData = async (form: Permission) => {
  const payload: Permission = {
    ...form,
    type: '2',
    path: '',
    parentId: selectedMenuId.value,
  } as Permission;
  if (isEdit.value) {
    await updatePermission(payload as PermissionUpdateRequest);
  } else {
    await createPermission(payload as PermissionCreateRequest);
  }
  ElMessage.success('操作成功');
  closeDialog();
  loadButtons();
};

const closeDialog = () => {
  visible.value = false;
  isEdit.value = false;
};

const handleDelete = async (row: Permission) => {
  await deletePermission(row.id);
  ElMessage.success('删除成功');
  loadButtons();
};

onMounted(async () => {
  await loadMenuTree();
});

// 菜单新增弹窗与保存
const menuVisible = ref(false);
const menuRowData = ref<Permission>({ type: '1' } as Permission);
let menuOptions = ref<FormOption>({
  labelWidth: '100px',
  span: 12,
  list: [
    { type: 'input', label: '菜单名称', prop: 'name', required: true },
    { type: 'input', label: '权限编码', prop: 'code', required: true },
    { type: 'input', label: '路径', prop: 'path', required: false },
    { type: 'switch', label: '是否禁用', prop: 'disableFlag', activeValue: 1, inactiveValue: 0, activeText: '禁用', inactiveText: '启用' },
  ]
});

const openAddMenu = () => {
  menuRowData.value = { type: '1', parentId: selectedMenuId.value || '' } as Permission;
  menuVisible.value = true;
};

const saveMenu = async (form: Permission) => {
  const payload: Permission = {
    ...form,
    type: '1',
    parentId: selectedMenuId.value || '',
  } as Permission;
  await createPermission(payload as PermissionCreateRequest);
  ElMessage.success('新增菜单成功');
  menuVisible.value = false;
  await loadMenuTree();
};
</script>

<style scoped>
.menu-page { display: flex; gap: 16px; }
.left { width: 280px; border: 1px solid #eee; border-radius: 4px; padding: 12px; background: #fff; }
.left-header { display: flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 8px; }
.menu-tree { max-height: calc(100vh - 260px); overflow: auto; }
.right { flex: 1; border: 1px solid #eee; border-radius: 4px; padding: 12px; background: #fff; }
.right-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-weight: 600; }
</style>
