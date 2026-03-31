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
      <el-input v-model="downKeyword" placeholder="搜索企业" clearable style="margin-bottom:10px" />
      <div v-loading="downLoading">
        <el-scrollbar style="max-height:300px">
          <template v-if="enterpriseList.length">
            <el-checkbox-group v-model="downSelectedIds">
              <el-checkbox
                v-for="ent in enterpriseList"
                :key="ent.id"
                :label="String(ent.id)"
                :disabled="String(ent.id) === currentDownOrgId"
              >
                <span style="font-weight:600">{{ ent.name }}</span>
              </el-checkbox>
            </el-checkbox-group>
          </template>
          <el-empty v-else description="无匹配企业" />
        </el-scrollbar>
      </div>
      <template #footer>
        <el-button @click="downDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingDown" @click="saveDownstream">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="system-org">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import type { Organization } from '@/types/org';
import { fetchOrganizationPage, getOrganization, saveOrganization, updateOrganization, deleteOrganization, targetOrgs, bindTargets } from '@/api/organization';
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
const query = reactive({
  name: '',
  moveInDateFrom: '',
  moveInDateTo: '',
});
const searchOpt = ref<FormOptionList[]>([
  { type: 'input', label: '组织名称', prop: 'name' },
  { type: 'date', label: '入驻开始', prop: 'moveInDateFrom', format: 'YYYY-MM-DD' },
  { type: 'date', label: '入驻结束', prop: 'moveInDateTo', format: 'YYYY-MM-DD' },
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
  { prop: 'moveInDate', label: '入驻时间' },
  { prop: 'address', label: '地址' },
  { prop: 'operator', label: '操作', width: 420 },
]);

const page = reactive({ index: 1, rows: 10, total: 0 });
const tableData = ref<Organization[]>([]);
const getData = async () => {
  const res = await fetchOrganizationPage({
    page: page.index,
    rows: page.rows,
    name: query.name,
    moveInDateFrom: query.moveInDateFrom,
    moveInDateTo: query.moveInDateTo,
  });
  tableData.value = (res.data.list || []) as Organization[];
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
    { type: 'input', label: '管理员账号', prop: 'adminLoginCode', required: true, span: 24 },
    { type: 'date', label: '入驻时间', prop: 'moveInDate', format: 'YYYY-MM-DD', span: 24 },
    { type: 'region', label: '省市区', prop: 'provinceId', required: true, span: 24 },
    { type: 'input', label: '地址', prop: 'address', required: true, span: 24 },
  ]
});

const ADMIN_ACCOUNT_PROP = 'adminLoginCode';
const setAdminFieldState = (disabled: boolean) => {
  const target = options.value.list.find(item => item.prop === ADMIN_ACCOUNT_PROP);
  if (target) {
    target.disabled = disabled;
    target.required = !disabled;
  }
};

const visible = ref(false);
const isEdit = ref(false);
const rowData = ref<any>({});

const openAdd = () => {
  setAdminFieldState(false);
  rowData.value = { adminLoginCode: '' };
  isEdit.value = false;
  visible.value = true;
};

const handleEdit = async (row: Organization) => {
  const res = await getOrganization(row.id);
  setAdminFieldState(true);
  rowData.value = { ...(res.data as any), adminLoginCode: res.data?.adminLoginCode || '' };
  isEdit.value = true;
  visible.value = true;
};

const updateData = async (form: any) => {
  const { createdAt, updatedAt, ...rest } = form;
  if (isEdit.value) {
    const { adminLoginCode, ...updatePayload } = rest;
    await updateOrganization(updatePayload);
  } else {
    await saveOrganization(rest);
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
    { prop: 'moveInDate', label: '入驻时间' },
    { prop: 'address', label: '地址' },
    { prop: 'createdAt', label: '创建时间' },
  ];
  visible1.value = true;
};

const handleDelete = async (row: Organization) => {
  await ElMessageBox.confirm(`确认删除组织“${row.name}”吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  });

  const res = await deleteOrganization(row.id);
  if (!res.data) {
    await getData();
    ElMessage.error('删除失败，组织不存在、已删除或未成功更新');
    return;
  }

  await getData();
  const deletedOrgId = String(row.id);
  const stillExists = tableData.value.some(item => String(item.id) === deletedOrgId);
  if (stillExists) {
    ElMessage.error('删除未生效，列表刷新后该组织仍存在');
    return;
  }

  const duplicatedNameExists = tableData.value.some(item => item.name === row.name);
  if (duplicatedNameExists) {
    ElMessage.warning('当前记录已删除，但列表中仍有同名组织');
    return;
  }

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
const downLoading = ref(false);
let enterpriseRequestToken = 0;

const isEnterpriseOrg = (org: Organization | Record<string, any>) => String(org.type ?? '').trim() === '2';

// Pull all organization pages so the downstream dialog always has a full list.
const fetchAllEnterpriseRecords = async (keyword: string) => {
  const pageSize = 200;
  const maxPages = 50;
  // Hard cap prevents runaway loops if the backend returns unexpected data.
  const collected = new Map<string, Organization>();
  const name = keyword.trim();
  let pageIndex = 1;
  let total = 0;
  let hasTotal = false;

  while (pageIndex <= maxPages) {
    const res = await fetchOrganizationPage({ page: pageIndex, rows: pageSize, name });
    const records = res.data.list || [];
    if (!records.length) {
      break;
    }

    records.forEach((record: Organization) => {
      collected.set(String(record.id), record);
    });

    if (!hasTotal && res.data.total != null) {
      const parsedTotal = Number(res.data.total);
      if (!Number.isNaN(parsedTotal) && parsedTotal > 0) {
        total = parsedTotal;
        hasTotal = true;
      }
    }

    const expectedTotal = hasTotal ? total : collected.size;
    const reachedExpectedTotal = hasTotal && collected.size >= expectedTotal;
    const totalPages = hasTotal ? Math.max(1, Math.ceil(expectedTotal / pageSize)) : Infinity;
    const reachedExpectedPage = hasTotal && pageIndex >= totalPages;
    const isTailPage = records.length < pageSize;

    if (reachedExpectedTotal || reachedExpectedPage || isTailPage) {
      break;
    }

    pageIndex += 1;
  }

  return Array.from(collected.values());
};

const openDownstream = async (row: Organization) => {
  currentDownOrgId.value = String(row.id);
  downKeyword.value = '';
  downDialogVisible.value = true;
  const requestToken = ++enterpriseRequestToken;
  downLoading.value = true;
  try {
    const [records, targetRes] = await Promise.all([
      fetchAllEnterpriseRecords(''),
      targetOrgs(currentDownOrgId.value),
    ]);
    downSelectedIds.value = (targetRes.data || []).map((o: any) => String(o.id));
    if (requestToken !== enterpriseRequestToken) return;
    enterpriseList.value = records
      .filter(isEnterpriseOrg)
      .filter((o: any) => String(o.id) !== currentDownOrgId.value);
  } finally {
    if (requestToken === enterpriseRequestToken) {
      downLoading.value = false;
    }
  }
};

const loadEnterpriseList = async () => {
  if (!downDialogVisible.value) return;
  const keyword = downKeyword.value.trim();
  const requestToken = ++enterpriseRequestToken;
  downLoading.value = true;
  try {
    const records = await fetchAllEnterpriseRecords(keyword);
    if (requestToken !== enterpriseRequestToken) return;
    enterpriseList.value = records
      .filter(isEnterpriseOrg)
      .filter((o: any) => String(o.id) !== currentDownOrgId.value);
  } finally {
    if (requestToken === enterpriseRequestToken) {
      downLoading.value = false;
    }
  }
};

const saveDownstream = async () => {
  savingDown.value = true;
  try {
    await bindTargets({ sourceOrgId: currentDownOrgId.value, targetOrgIds: downSelectedIds.value });
    ElMessage.success('保存成功');
    downDialogVisible.value = false;
  } finally {
    savingDown.value = false;
  }
};

// 根据关键字实时加载（弹窗打开时）
watch(downKeyword, () => {
  if (downDialogVisible.value) loadEnterpriseList();
});
</script>

<style scoped>
.container { background: #fff; padding: 12px; border: 1px solid #ddd; border-radius: 5px; }
</style>
