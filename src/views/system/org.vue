<template>
  <div>
    <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
    <div class="container">
      <TableCustom
        :columns="columns"
        :tableData="tableData"
        :total="page.total"
        :currentPage="page.index"
        :pageSize="page.rows"
        :changePage="changePage"
        :editFunc="handleEdit"
        :delFunc="handleDelete"
      >
        <template #toolbarBtn>
          <el-button type="warning" :icon="CirclePlusFilled" @click="openAdd">新增</el-button>
        </template>
        <template #operator="{ rows }">
          <el-button type="primary" size="small" @click="handleEdit(rows)">编辑</el-button>
          <el-button type="success" size="small" @click="$router.push({ path: '/resource-pool', query: { organizationId: rows.id } })">资源池</el-button>
          <el-button type="primary" size="small" @click="openEditPackages(rows)">权限包</el-button>
          <el-button type="info" size="small" @click="openDownstream(rows)">下游</el-button>
          <el-button type="danger" size="small" @click="handleDelete(rows)">删除</el-button>
        </template>
      </TableCustom>
    </div>
    <el-dialog :title="isEdit ? '编辑' : '新增'" v-model="visible" width="700px" destroy-on-close :close-on-click-modal="false" @close="closeDialog">
      <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData" />
    </el-dialog>
    <el-dialog title="查看详情" v-model="visible1" width="700px" destroy-on-close>
      <TableDetail :data="viewData" />
    </el-dialog>
    <el-dialog title="权限包" v-model="pkgDialogVisible" width="560px" destroy-on-close>
      <div style="margin-bottom:10px">为组织：{{ currentOrgName }} 选择权限包</div>
      <el-checkbox-group v-model="checkedPackageIds">
        <el-checkbox v-for="pkg in allPackages" :key="pkg.id" :label="pkg.id">
          <span style="font-weight:600">{{ pkg.code }}</span>
          <span style="margin-left:8px;color:#666">{{ pkg.name }}</span>
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="pkgDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="savingPkg" @click="saveOrgPackages">保 存</el-button>
      </template>
    </el-dialog>
    <el-dialog title="下游" v-model="downDialogVisible" width="560px" destroy-on-close>
      <el-input v-model="downKeyword" placeholder="搜索企业" clearable @input="loadEnterpriseList" style="margin-bottom:10px" />
      <el-checkbox-group v-model="downSelectedIds">
        <el-checkbox v-for="ent in enterpriseList" :key="ent.id" :label="String(ent.id)">
          <span style="font-weight:600">{{ ent.name }}</span>
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="downDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingDown" @click="saveDownstream">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="system-org">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import type { Organization } from '@/types/org';
import { fetchOrganizationPage, getOrganization, saveOrganization, updateOrganization } from '@/api/organization';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import TableEdit from '@/components/table-edit.vue';
import type { FormOption, FormOptionList } from '@/types/form-option';
import type { PermissionPackage } from '@/types/permission-package';
import { listPermissionPackages, listPermissionPackagesByOrg, bindPackagesToOrganization } from '@/api/permission-package';

const typeOptions = [
  { label: '政府', value: '1' },
  { label: '企业', value: '2' },
];

// 查询
const query = reactive({ name: '' });
const searchOpt = ref<FormOptionList[]>([
  { type: 'input', label: '组织名称', prop: 'name' },
]);
const handleSearch = () => { changePage(1); };

// 表格
let columns = ref([
  { type: 'index', label: '序号', width: 55, align: 'center' },
  { prop: 'name', label: '组织名称' },
  { prop: 'type', label: '组织类型', formatter: (val: string) => typeOptions.find(o => o.value === val)?.label || '' },
  { prop: 'province', label: '省' },
  { prop: 'city', label: '市' },
  { prop: 'county', label: '区县' },
  { prop: 'address', label: '地址' },
  { prop: 'operator', label: '操作', width: 420 },
]);

const page = reactive({ index: 1, rows: 10, total: 0 });
const tableData = ref<Organization[]>([]);
const getData = async () => {
  const res = await fetchOrganizationPage({ page: page.index, rows: page.rows, name: query.name });
  tableData.value = (res.data.records || []) as Organization[];
  page.total = res.data.total || 0;
};
onMounted(getData);

const changePage = (val: number) => { page.index = val; getData(); };

// 新增/编辑
let options = ref<FormOption>({
  labelWidth: '100px',
  span: 12,
  list: [
    { type: 'input', label: '组织名称', prop: 'name', required: true },
    { type: 'select', label: '组织类型', prop: 'type', required: true, opts: typeOptions },
    { type: 'region', label: '省市区', prop: 'provinceId', required: true, span: 24 },
    { type: 'input', label: '地址', prop: 'address', required: true, span: 24 },
  ]
});

const visible = ref(false);
const isEdit = ref(false);
const rowData = ref<any>({});

const openAdd = () => {
  rowData.value = {};
  isEdit.value = false;
  visible.value = true;
};

const handleEdit = async (row: Organization) => {
  const res = await getOrganization(row.id);
  rowData.value = res.data as any;
  isEdit.value = true;
  visible.value = true;
};

const updateData = async (form: any) => {
  const { createdAt, updatedAt, ...payload } = form;
  if (isEdit.value) {
    await updateOrganization(payload);
  } else {
    await saveOrganization(payload);
  }
  ElMessage.success('操作成功');
  closeDialog();
  getData();
};

const closeDialog = () => { visible.value = false; isEdit.value = false; };

// 查看详情
const visible1 = ref(false);
const viewData = ref({ row: {}, list: [] as any[] });
const handleView = async (row: Organization) => {
  const res = await getOrganization(row.id);
  viewData.value.row = {
    ...res.data,
    type: typeOptions.find(o => o.value === res.data.type)?.label || res.data.type,
    createdAt: res.data.createdAt ? res.data.createdAt.split('T')[0] : '',
  } as any;
  viewData.value.list = [
    { prop: 'name', label: '组织名称' },
    { prop: 'type', label: '组织类型' },
    { prop: 'province', label: '省' },
    { prop: 'city', label: '市' },
    { prop: 'county', label: '区县' },
    { prop: 'address', label: '地址' },
    { prop: 'createdAt', label: '创建时间' },
  ];
  visible1.value = true;
};

// 删除（示例）
const handleDelete = (row: Organization) => {
  ElMessage.success('删除成功');
};

// 编辑权限包
const pkgDialogVisible = ref(false);
const currentOrgId = ref('');
const currentOrgName = ref('');
const allPackages = ref<PermissionPackage[]>([]);
const checkedPackageIds = ref<string[]>([]);
const savingPkg = ref(false);

const openEditPackages = async (row: Organization) => {
  currentOrgId.value = String(row.id);
  currentOrgName.value = row.name as any;
  const [allRes, orgRes] = await Promise.all([
    listPermissionPackages(),
    listPermissionPackagesByOrg(String(row.id)),
  ]);
  allPackages.value = allRes.data || [];
  checkedPackageIds.value = (orgRes.data || []).map((p: any) => p.id);
  pkgDialogVisible.value = true;
};

const saveOrgPackages = async () => {
  savingPkg.value = true;
  try {
    await bindPackagesToOrganization({ organizationId: currentOrgId.value, packageIds: checkedPackageIds.value });
    ElMessage.success('保存成功');
    pkgDialogVisible.value = false;
  } finally {
    savingPkg.value = false;
  }
};

// 下游管理
const downDialogVisible = ref(false);
const downKeyword = ref('');
const enterpriseList = ref<Organization[]>([]);
const downSelectedIds = ref<string[]>([]);
const savingDown = ref(false);
const currentDownOrgId = ref('');

const openDownstream = async (row: Organization) => {
  currentDownOrgId.value = String(row.id);
  downKeyword.value = '';
  await loadEnterpriseList();
  // TODO: 加载已关联的下游企业，待接口对接
  downSelectedIds.value = [];
  downDialogVisible.value = true;
};

const loadEnterpriseList = async () => {
  const res = await fetchOrganizationPage({ page: 1, rows: 200, name: downKeyword.value });
  enterpriseList.value = (res.data.records || []).filter((o: any) => o.type === '2');
};

const saveDownstream = async () => {
  savingDown.value = true;
  try {
    // TODO: 保存下游企业关联，接口后续对接
    ElMessage.success('已保存（待对接接口）');
    downDialogVisible.value = false;
  } finally {
    savingDown.value = false;
  }
};
</script>

<style scoped>
.container { background: #fff; padding: 12px; border: 1px solid #ddd; border-radius: 5px; }
</style>
