<template>
  <div>
    <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
    <div class="container">
      <TableCustom
        :columns="columns"
        :tableData="tableData"
        row-key="id"
        :total="page.total"
        :current-page="page.index"
        :page-size="page.rows"
        :change-page="changePage"
        :editFunc="handleEdit"
        :delFunc="handleDelete"
      >
        <template #toolbarBtn>
          <el-button type="primary" :icon="Edit" @click="openAdd">新增</el-button>
        </template>
        <template #operator="{ rows }">
          <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(rows)">编辑</el-button>
          <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(rows)">删除</el-button>
        </template>
      </TableCustom>
    </div>

    <el-dialog :title="isEdit ? '编辑' : '新增'" v-model="visible" width="960px" destroy-on-close :close-on-click-modal="false" @close="closeDialog">
      <TableEdit :form-data="row" :options="formOptions" :edit="isEdit" :update="saveRow" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="data-rjc">
import { ref, reactive } from 'vue';
import { Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import TableCustom from '@/components/table-custom.vue';
import TableSearch from '@/components/table-search.vue';
import type { FormOption, FormOptionList } from '@/types/form-option';
import { fetchOrganizationPage } from '@/api/organization';

type RJCType = 'human' | 'machine' | 'material';
type RJCRow = {
  id: string;
  kind: RJCType; // 人/机/材
  name: string;
  model?: string; // 规格/型号/岗位
  unit?: string;
  quantity?: number;
  price?: number;
  supplier?: string;
  boughtAt?: string;
  organizationId?: string | null;
  organizationName?: string;
  province?: string;
  city?: string;
  county?: string;
  provinceId?: string | null;
  cityId?: string | null;
  countyId?: string | null;
  description?: string;
};

// 查询
const query = reactive({
  kind: '',
  name: '',
  organizationId: null as string | null,
});

const orgOpts = ref<any[]>([]);
const handleOrgRemote = async (kw: string) => {
  const res = await fetchOrganizationPage({ page: 1, rows: 10, name: kw || '' });
  const records = (res.data?.records || []) as any[];
  orgOpts.value = records.map(r => ({ label: r.name, value: String(r.id) }));
  const opt = searchOpt.value.find(o => o.prop === 'organizationId');
  if (opt) opt.opts = orgOpts.value;
};

const searchOpt = ref<FormOptionList[]>([
  { type: 'select', label: '类别：', prop: 'kind', opts: [
    { label: '全部', value: '' },
    { label: '人', value: 'human' },
    { label: '机', value: 'machine' },
    { label: '材', value: 'material' },
  ] },
  { type: 'input', label: '名称：', prop: 'name', placeholder: '输入名称' },
  { type: 'select', label: '甲方单位：', prop: 'organizationId', placeholder: '搜索甲方单位', opts: orgOpts.value, remote: true, remoteMethod: handleOrgRemote, inputStyle: { width: '320px' } },
]);

const handleSearch = () => { page.index = 1; loadData(); };

// 列表
const columns = ref([
  { type: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'kindText', label: '类别' },
  { prop: 'name', label: '名称', align: 'left' },
  { prop: 'model', label: '规格/型号/岗位' },
  { prop: 'unit', label: '单位', width: 80 },
  { prop: 'quantity', label: '数量', width: 80 },
  { prop: 'price', label: '单价', width: 100 },
  { prop: 'supplier', label: '供应商' },
  { prop: 'organizationName', label: '甲方单位' },
  { prop: 'region', label: '所在位置' },
  { prop: 'operator', label: '操作', width: 200 },
]);

const page = reactive({ index: 1, rows: 10, total: 0 });
const tableData = ref<RJCRow[]>([]);

const loadData = () => {
  // 占位数据，等待接口联调
  const all: RJCRow[] = [
    { id: '1', kind: 'human', name: '绿化工', model: '绿化维护', unit: '人', quantity: 5, organizationName: '园区产业园sis测试', province: '山西省', city: '太原市', county: '小店区' },
    { id: '2', kind: 'machine', name: '洒水车', model: '12T', unit: '辆', quantity: 1, supplier: '某设备公司', organizationName: '园区产业园sis测试', province: '山西省' },
    { id: '3', kind: 'material', name: '草籽', model: '早熟禾', unit: 'kg', quantity: 200, supplier: '某苗圃', organizationName: '园区产业园sis测试', province: '山西省' },
  ];
  const filtered = all.filter(x => (!query.kind || x.kind === query.kind) && (!query.name || x.name.includes(query.name)) && (!query.organizationId || x.organizationId === query.organizationId));
  page.total = filtered.length;
  tableData.value = filtered.slice((page.index - 1) * page.rows, page.index * page.rows).map(x => ({
    ...x,
    kindText: x.kind === 'human' ? '人' : x.kind === 'machine' ? '机' : '材',
    region: [x.province, x.city, x.county].filter(Boolean).join('-') || '—',
  }) as any);
};
loadData();

const changePage = (val: number) => { page.index = val; loadData(); };

// 弹窗表单
const visible = ref(false);
const isEdit = ref(false);
const row = ref<any>({ kind: 'human' });

const orgOptsModal = ref<any[]>([]);
const handleOrgRemoteModal = async (kw: string) => {
  const res = await fetchOrganizationPage({ page: 1, rows: 10, name: kw || '' });
  const records = (res.data?.records || []) as any[];
  orgOptsModal.value.splice(0, orgOptsModal.value.length, ...records.map(r => ({ label: r.name, value: String(r.id) })));
};

const formOptions = ref<FormOption>({
  labelWidth: '110px',
  span: 12,
  list: [
    { type: 'select', label: '类别', prop: 'kind', required: true, opts: [
      { label: '人', value: 'human' }, { label: '机', value: 'machine' }, { label: '材', value: 'material' },
    ] },
    { type: 'input', label: '名称', prop: 'name', required: true, placeholder: '请输入名称' },
    { type: 'input', label: '规格/型号/岗位', prop: 'model', placeholder: '填写规格/型号或岗位' },
    { type: 'input', label: '单位', prop: 'unit', placeholder: '如：人/台/件' },
    { type: 'number', label: '数量', prop: 'quantity' },
    { type: 'number', label: '单价', prop: 'price' },
    { type: 'input', label: '供应商', prop: 'supplier' },
    { type: 'date', label: '购置日期', prop: 'boughtAt', format: 'YYYY-MM-DD' },
    { type: 'select', label: '甲方单位', prop: 'organizationId', required: true, placeholder: '搜索甲方单位', opts: orgOptsModal.value, remote: true, remoteMethod: handleOrgRemoteModal, span: 24 },
    { type: 'region', label: '所在位置', prop: 'region', span: 24 },
    { type: 'input', label: '备注', prop: 'description', span: 24 },
  ],
});

const openAdd = () => {
  isEdit.value = false;
  visible.value = true;
  row.value = { kind: 'human', name: '', model: '', unit: '', quantity: null, price: null, supplier: '', boughtAt: '', organizationId: null, provinceId: null, cityId: null, countyId: null, description: '' };
};

const handleEdit = (r: RJCRow) => {
  isEdit.value = true;
  visible.value = true;
  row.value = { ...r, organizationId: r.organizationId ? String(r.organizationId) : null } as any;
  if (r.organizationId && r.organizationName) {
    const exists = orgOptsModal.value.some(o => o.value === String(r.organizationId));
    if (!exists) orgOptsModal.value.unshift({ label: r.organizationName, value: String(r.organizationId) });
  }
};

const saveRow = async (form: any) => {
  // 甲方单位必须为远程项
  const idStr = form.organizationId ? String(form.organizationId) : '';
  const orgHit = idStr ? orgOptsModal.value.find((o: any) => o.value === idStr) : null;
  if (!orgHit) { ElMessage.error('请选择有效的甲方单位'); return; }

  // 组装新行（此处先本地更新，后续接入后端）
  const payload: RJCRow = {
    id: form.id || String(Date.now()),
    kind: form.kind,
    name: form.name,
    model: form.model,
    unit: form.unit,
    quantity: form.quantity != null ? Number(form.quantity) : undefined,
    price: form.price != null ? Number(form.price) : undefined,
    supplier: form.supplier,
    boughtAt: form.boughtAt,
    organizationId: idStr,
    organizationName: orgHit.label,
    province: form.province,
    city: form.city,
    county: form.county,
    provinceId: form.provinceId,
    cityId: form.cityId,
    countyId: form.countyId,
    description: form.description,
  };

  if (isEdit.value) {
    const idx = tableData.value.findIndex(x => x.id === payload.id);
    if (idx >= 0) tableData.value[idx] = payload;
    ElMessage.success('保存成功');
  } else {
    tableData.value = [payload, ...tableData.value];
    page.total += 1;
    ElMessage.success('新增成功');
  }
  closeDialog();
};

const handleDelete = (r: RJCRow) => {
  tableData.value = tableData.value.filter(x => x.id !== r.id);
  page.total = Math.max(0, page.total - 1);
  ElMessage.success('删除成功');
};

const closeDialog = () => { visible.value = false; isEdit.value = false; };
</script>

<style scoped>
.container { background: #fff; padding: 12px; border: 1px solid #ddd; border-radius: 5px; }
</style>

