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
      >
        <template #default="{ node, data }">
          <span class="tree-node">
            <el-tooltip v-if="data.desc" :content="data.desc" placement="top">
              <span class="label">{{ node.label }}</span>
            </el-tooltip>
            <span v-else class="label">{{ node.label }}</span>
            <el-link type="primary" :underline="false" @click.stop="openEditMenu(data)" class="edit-link">修改</el-link>
          </span>
        </template>
      </el-tree>
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
        <template #name="{ rows }">
          <el-tooltip v-if="rows.description" :content="rows.description" placement="top">
            <span>{{ rows.name }}</span>
          </el-tooltip>
          <span v-else>{{ rows.name }}</span>
        </template>
        <template #operator="{ rows }">
          <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(rows)">编辑</el-button>
          <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(rows)">删除</el-button>
        </template>
      </TableCustom>
    </div>
    <el-dialog :title="isEdit ? '编辑权限' : '新增权限'" v-model="visible" width="700px" destroy-on-close :close-on-click-modal="false" @close="closeDialog">
      <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData" />
    </el-dialog>
    <el-dialog :title="menuIsEdit ? '编辑菜单' : '新增菜单'" v-model="menuVisible" width="700px" destroy-on-close :close-on-click-modal="false">
      <TableEdit :form-data="menuRowData" :options="menuOptions" :edit="menuIsEdit" :update="saveMenu">
        <template #parentId>
          <el-cascader
            v-model="menuRowData.parentId"
            :options="cascaderOptions"
            :props="{ checkStrictly: true }"
            filterable
            clearable
          />
        </template>
        <template #icon="{ form }">
          <div class="menu-icon-field">
            <el-upload
              class="menu-icon-uploader"
              action="#"
              accept="image/*"
              :show-file-list="false"
              :http-request="handleMenuIconUpload"
            >
              <img v-if="form.icon" :src="form.icon" class="menu-icon-preview" />
              <div v-else class="menu-icon-placeholder">上传图标</div>
            </el-upload>
            <div class="menu-icon-meta">
              <el-input v-model="form.icon" placeholder="上传后自动回填图标地址" clearable />
              <div class="menu-icon-tip">支持 png、jpg、jpeg、svg、webp，建议使用方形图片。</div>
            </div>
          </div>
        </template>
      </TableEdit>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="system-menu">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled, Edit, Delete } from '@element-plus/icons-vue';
import type { UploadRequestOptions } from 'element-plus';
import TableCustom from '@/components/table-custom.vue';
import TableEdit from '@/components/table-edit.vue';
import { FormOption } from '@/types/form-option';
import { getPermissionChildren, getPermission, createPermission, updatePermission, deletePermission, getPermissionTree } from '@/api/permission';
import type { Permission, PermissionCreateRequest, PermissionUpdateRequest } from '@/types/permission';
import { uploadToOss } from '@/utils/oss';

// 左侧菜单树数据（仅 type=1）
const menuTree = ref<any[]>([]);
const menuTreeRaw = ref<any[]>([]);
const menuKeyword = ref('');
const selectedMenuId = ref<string>('');
const cascaderOptions = ref<any[]>([]);

// 右侧按钮权限表格数据（type=2）
const permissionData = ref<Permission[]>([]);

// 适配后端树结构到 el-tree 需要的 label 字段
const adornTree = (nodes: any[]): any[] => (nodes || []).map((n: any) => ({
  ...n,
  label: n.label || n.name,
  raw: n.raw || n,
  children: n.children ? adornTree(n.children) : [],
}));

const loadMenuTree = async () => {
  const res = await getPermissionTree({ type: '1' });
  const all = adornTree((res.data || []) as any[]);
  // 左侧只展示菜单（type=1）
  const stripButtons = (nodes: any[]): any[] => nodes.map((n: any) => ({
    id: n.id,
    label: n.label,
    desc: n.description,
    children: stripButtons((n.children || []).filter((c: any) => c.type === '1')),
  }));
  menuTreeRaw.value = stripButtons(all);
  applyMenuFilter();
  cascaderOptions.value = buildCascaderOptions(menuTreeRaw.value);
  // 左侧用 tree，右侧按钮列表按需加载
};

const applyMenuFilter = () => {
  const kw = menuKeyword.value.trim();
  if (!kw) { menuTree.value = menuTreeRaw.value; return; }
  const filter = (nodes: any[]): any[] => nodes
    .map((n: any) => ({ ...n, children: n.children ? filter(n.children) : [] }))
    .filter((n: any) => n.label.includes(kw) || (n.children && n.children.length));
  menuTree.value = filter(menuTreeRaw.value);
};

const buildCascaderOptions = (nodes: any[]): any[] => {
  return (nodes || []).map((n: any) => ({
    label: n.label,
    value: n.id,
    children: n.children ? buildCascaderOptions(n.children) : undefined,
  }));
};

const onSelectMenu = async (node: any) => {
  selectedMenuId.value = node.id;
  await loadButtons();
};

// 加载右侧按钮权限（type=2）
const columns = ref([
  { prop: 'name', label: '按钮名称', align: 'left' },
  { prop: 'code', label: '权限编码' },
  { prop: 'disableFlag', label: '是否禁用', formatter: (val: number) => (val ? '禁用' : '启用') },
  { prop: 'operator', label: '操作', width: 200 },
]);

const loadButtons = async () => {
  if (!selectedMenuId.value) { permissionData.value = []; return; }
  const res = await getPermissionChildren({ parentId: selectedMenuId.value, type: '2' });
  permissionData.value = (res.data || []) as Permission[];
};

// 权限弹窗
const visible = ref(false);
const isEdit = ref(false);
const rowData = ref<Permission>({ type: '2' } as Permission);

let options = ref<FormOption>({
  labelWidth: '100px',
  span: 12,
  list: [
    { type: 'input', label: '名称', prop: 'name', required: true },
    { type: 'input', label: '权限编码', prop: 'code', required: true },
    { type: 'input', label: '描述', prop: 'description' },
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
  await loadButtons();
};

const closeDialog = () => {
  visible.value = false;
  isEdit.value = false;
};

const handleDelete = async (row: Permission) => {
  await deletePermission(row.id);
  ElMessage.success('删除成功');
  await loadButtons();
};

onMounted(async () => {
  await loadMenuTree();
});

// 菜单新增/编辑
const menuVisible = ref(false);
const menuIsEdit = ref(false);
const menuRowData = ref<Permission>({ type: '1' } as Permission);
let menuOptions = ref<FormOption>({
  labelWidth: '100px',
  span: 12,
  list: [
    { type: 'input', label: '菜单名称', prop: 'name', required: true },
    { type: 'input', label: '权限编码', prop: 'code', required: true },
    { type: 'input', label: '路径', prop: 'path', required: false },
    { type: 'slot', label: '菜单图标', prop: 'icon' },
    { type: 'input', label: '描述', prop: 'description' },
    { type: 'parent', label: '父级菜单', prop: 'parentId' },
    { type: 'switch', label: '是否禁用', prop: 'disableFlag', activeValue: 1, inactiveValue: 0, activeText: '禁用', inactiveText: '启用' },
  ]
});

const openAddMenu = () => {
  menuRowData.value = { type: '1', parentId: selectedMenuId.value || '', icon: '' } as Permission;
  menuIsEdit.value = false;
  menuVisible.value = true;
};

const openEditMenu = async (data: any) => {
  const res = await getPermission(data.id);
  menuRowData.value = res.data as Permission;
  menuIsEdit.value = true;
  menuVisible.value = true;
};

const saveMenu = async (form: Permission) => {
  const payload: Permission = {
    ...form,
    type: '1',
    parentId: ((): string => {
      if (Array.isArray(menuRowData.value.parentId)) {
        const arr = menuRowData.value.parentId as any[];
        return arr.length ? String(arr[arr.length - 1]) : '-1';
      }
      const v = (menuRowData.value.parentId as any) as string | undefined;
      return v && String(v).trim() ? String(v) : '-1';
    })(),
  } as Permission;
  if (menuIsEdit.value) {
    await updatePermission(payload as PermissionUpdateRequest);
    ElMessage.success('编辑菜单成功');
  } else {
    await createPermission(payload as PermissionCreateRequest);
    ElMessage.success('新增菜单成功');
  }
  menuVisible.value = false;
  await loadMenuTree();
};

const handleMenuIconUpload = async (opt: UploadRequestOptions) => {
  try {
    const file = opt.file as File;
    const suffix = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '';
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${suffix}`;
    const res = await uploadToOss('system/menu/icon', file, fileName);
    menuRowData.value.icon = res.url;
    opt.onSuccess && opt.onSuccess({});
    ElMessage.success('图标上传成功');
  } catch (error: any) {
    opt.onError && opt.onError(error);
    ElMessage.error(error?.message || '图标上传失败');
  }
};
</script>

<style scoped>
.menu-page { display: flex; gap: 16px; }
.left { width: 280px; border: 1px solid #eee; border-radius: 4px; padding: 12px; background: #fff; }
.left-header { display: flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 8px; }
.menu-tree { max-height: calc(100vh - 260px); overflow: auto; }
.right { flex: 1; border: 1px solid #eee; border-radius: 4px; padding: 12px; background: #fff; }
.right-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-weight: 600; }
.tree-node { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.tree-node .edit-link { margin-left: 8px; }
.menu-icon-field { display: flex; align-items: flex-start; gap: 12px; width: 100%; }
.menu-icon-uploader :deep(.el-upload) {
  width: 88px;
  height: 88px;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s ease;
}
.menu-icon-uploader :deep(.el-upload:hover) { border-color: var(--el-color-primary); }
.menu-icon-preview { width: 88px; height: 88px; object-fit: cover; display: block; }
.menu-icon-placeholder {
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  background: var(--el-fill-color-light);
}
.menu-icon-meta { flex: 1; }
.menu-icon-tip { margin-top: 6px; font-size: 12px; color: var(--el-text-color-secondary); }
</style>
