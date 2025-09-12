<template>
  <div>
    <div class="container">
      <TableCustom :columns="columns" :tableData="tableData">
        <template #toolbarBtn>
          <el-button type="warning" :icon="CirclePlusFilled" @click="openAdd">新增</el-button>
        </template>
        <template #operator="{ rows }">
          <el-button type="primary" size="small" :icon="Setting" @click="handlePermission(rows)">编辑权限</el-button>
          <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(rows)">删除</el-button>
        </template>
      </TableCustom>
    </div>
    <el-dialog title="权限管理" v-model="visible" width="500px" destroy-on-close>
      <PermissionPackagePermission :package-id="currentId" @saved="onSavedPermissions" />
    </el-dialog>
    <el-dialog title="新增权限包" v-model="addVisible" width="560px" destroy-on-close :close-on-click-modal="false">
      <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="system-permission-package">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CirclePlusFilled, Setting, Delete } from '@element-plus/icons-vue';
import TableCustom from '@/components/table-custom.vue';
import TableEdit from '@/components/table-edit.vue';
import PermissionPackagePermission from './permission-package-permission.vue';
import type { PermissionPackage, PermissionPackageCreateRequest } from '@/types/permission-package';
import { listPermissionPackages, createPermissionPackage, deletePermissionPackage } from '@/api/permission-package';
import type { FormOption } from '@/types/form-option';

const columns = ref([
  { type: 'index', label: '序号', width: 55, align: 'center' },
  { prop: 'code', label: '权限包编码', width: 150 },
  { prop: 'name', label: '权限包名称' },
  { prop: 'operator', label: '操作', width: 240 },
]);

const tableData = ref<PermissionPackage[]>([]);

const loadData = async () => {
  const res = await listPermissionPackages();
  tableData.value = res.data || [];
};

onMounted(loadData);

const visible = ref(false);
const currentId = ref('');
const handlePermission = (row: PermissionPackage) => {
  currentId.value = row.id;
  visible.value = true;
};

const addVisible = ref(false);
const isEdit = ref(false);
const rowData = ref<PermissionPackageCreateRequest>({} as PermissionPackageCreateRequest);

let options = ref<FormOption>({
  labelWidth: '100px',
  span: 24,
  list: [
    { type: 'input', label: '权限包名称', prop: 'name', required: true },
    { type: 'input', label: '权限包编码', prop: 'code', required: true },
    { type: 'input', label: '权限编码备注', prop: 'permissionCode' },
  ]
});

const openAdd = () => {
  rowData.value = {} as PermissionPackageCreateRequest;
  isEdit.value = false;
  addVisible.value = true;
};

const updateData = async (form: PermissionPackageCreateRequest) => {
  await createPermissionPackage(form);
  ElMessage.success('新增成功');
  addVisible.value = false;
  await loadData();
};

const handleDelete = async (row: PermissionPackage) => {
  await ElMessageBox.confirm('确认删除该权限包？', '提示', { type: 'warning' });
  await deletePermissionPackage(row.id);
  ElMessage.success('删除成功');
  await loadData();
};

const onSavedPermissions = async () => {
  visible.value = false;
};
</script>

<style scoped></style>
