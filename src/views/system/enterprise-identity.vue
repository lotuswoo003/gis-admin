<template>
  <div>
    <div class="container">
      <TableCustom
        :columns="columns"
        :tableData="tableData"
        :hasToolbar="false"
        :hasPagination="false"
        rowKey="code"
      >
        <template #operator="{ rows }">
          <el-button type="primary" size="small" @click="openEditPackages(rows)">编辑权限包</el-button>
        </template>
      </TableCustom>
    </div>

    <el-dialog title="编辑权限包" v-model="pkgDialogVisible" width="560px" destroy-on-close>
      <div style="margin-bottom:10px">为企业身份：{{ currentTypeName }} 选择权限包</div>
      <el-checkbox-group v-model="checkedPackageIds">
        <el-checkbox v-for="pkg in allPackages" :key="pkg.id" :label="pkg.id">
          <span style="font-weight:600">{{ pkg.code }}</span>
          <span style="margin-left:8px;color:#666">{{ pkg.name }}</span>
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="pkgDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingPkg" @click="saveOrgTypePackages">保存</el-button>
      </template>
    </el-dialog>
  </div>
  
</template>

<script setup lang="ts" name="system-enterprise-identity">
import { ref, onMounted, computed } from 'vue';
import TableCustom from '@/components/table-custom.vue';
import { useDictStore } from '@/store/dict';
import type { PermissionPackage } from '@/types/permission-package';
import { listPermissionPackages, listPermissionPackagesByOrgType, bindPackagesToOrganizationType } from '@/api/permission-package';
import { ElMessage } from 'element-plus';

const dictStore = useDictStore();

const columns = ref([
  { type: 'index', label: '序号', width: 55, align: 'center' },
  { prop: 'name', label: '名称' },
  { prop: 'code', label: '编码值' },
  { prop: 'operator', label: '操作', width: 200 },
]);

type Row = { name: string; code: string };
const tableData = ref<Row[]>([]);

const loadData = () => {
  // 取字典 organization_type 的值
  const opts = dictStore.getOptions('organization_type');
  tableData.value = opts.map(o => ({ name: o.label, code: String(o.value) }));
};

onMounted(async () => {
  if (!dictStore.loaded) {
    await dictStore.loadAll();
  }
  loadData();
});

// 权限包编辑弹窗
const pkgDialogVisible = ref(false);
const currentTypeCode = ref('');
const currentTypeName = ref('');
const allPackages = ref<PermissionPackage[]>([]);
const checkedPackageIds = ref<string[]>([]);
const savingPkg = ref(false);

const openEditPackages = async (row: Row) => {
  currentTypeCode.value = row.code;
  currentTypeName.value = row.name;
  const [allRes, typeRes] = await Promise.all([
    listPermissionPackages(),
    listPermissionPackagesByOrgType(row.code),
  ]);
  allPackages.value = allRes.data || [];
  checkedPackageIds.value = (typeRes.data || []).map((p: any) => p.id);
  pkgDialogVisible.value = true;
};

const saveOrgTypePackages = async () => {
  savingPkg.value = true;
  try {
    await bindPackagesToOrganizationType({ organizationType: currentTypeCode.value, packageIds: checkedPackageIds.value });
    ElMessage.success('保存成功');
    pkgDialogVisible.value = false;
  } finally {
    savingPkg.value = false;
  }
};
</script>

<style scoped>
.container { background: #fff; padding: 12px; border: 1px solid #ddd; border-radius: 5px; }
</style>

