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
import request from '@/utils/request';
import TableCustom from '@/components/table-custom.vue';
import TableSearch from '@/components/table-search.vue';
import type { FormOption, FormOptionList } from '@/types/form-option';
import { fetchOrganizationPage } from '@/api/organization';
import { fetchProcessUnitPricePage, getProcessUnitPrice, createProcessUnitPrice, updateProcessUnitPrice, deleteProcessUnitPrice } from '@/api/process-unit-price';
import type { ProcessUnitPrice } from '@/types/process-unit-price';

type RJCType = 'human' | 'machine' | 'material';
type OptionItem = { label: string; value: string };
type ConserveItem = { id: string; name: string; mode?: string };
type RJCRow = {
  id: string;
  kind: RJCType; // 人/机/材
  name: string;
  conserveId?: string;
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
  name: '',
  organizationId: null as string | null,
});

const orgOpts = ref<OptionItem[]>([]);
const handleOrgRemote = async (kw: string) => {
  const res = await fetchOrganizationPage({ page: 1, rows: 10, name: kw || '' });
  const records = (res.data?.list || []) as Array<{ id: string | number; name: string }>;
  orgOpts.value = records.map(r => ({ label: r.name, value: String(r.id) }));
  const opt = searchOpt.value.find(o => o.prop === 'organizationId');
  if (opt) opt.opts = orgOpts.value;
};

const searchOpt = ref<FormOptionList[]>([
  { type: 'input', label: '名称：', prop: 'name', placeholder: '输入名称' },
  { type: 'select', label: '乙方单位：', prop: 'organizationId', placeholder: '搜索乙方单位', opts: orgOpts.value, remote: true, remoteMethod: handleOrgRemote, inputStyle: { width: '320px' } },
]);

const handleSearch = () => { page.index = 1; loadData(); };

// 列表
const columns = ref([
  { type: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'kindText', label: '类别' },
  { prop: 'name', label: '名称', align: 'left' },
  { prop: 'unit', label: '单位', width: 80 },
  { prop: 'price', label: '单价', width: 120 },
  { prop: 'organizationName', label: '乙方单位' },
  { prop: 'operator', label: '操作', width: 200 },
]);

const page = reactive({ index: 1, rows: 10, total: 0 });
const tableData = ref<RJCRow[]>([]);

const loadData = async () => {
  const res = await fetchProcessUnitPricePage({
    page: page.index,
    rows: page.rows,
    name: query.name || undefined,
    organizationId: query.organizationId || undefined,
  });
  const total = res.data?.total || 0;
  const records = (res.data?.list || []) as ProcessUnitPrice[];
  page.total = total;
  tableData.value = records.map((pi): any => ({
    id: pi.id || '',
    kind: pi.type as any,
    kindText: pi.type === 'human' ? '人' : pi.type === 'machine' ? '机' : pi.type === 'material' ? '材' : (pi.type || ''),
    name: pi.name || '',
    conserveId: pi.conserveId || '',
    unit: pi.unit || '',
    price: pi.price,
    organizationId: pi.organizationId || null,
    organizationName: pi.organizationName || '',
    province: pi.province || '', city: pi.city || '',
    region: [pi.province, pi.city].filter(Boolean).join('-') || '—',
    description: '',
  }));
};
loadData();

const changePage = (val: number) => { page.index = val; loadData(); };

// 弹窗表单
const visible = ref(false);
const isEdit = ref(false);
const row = ref<Partial<RJCRow>>({ kind: 'human' });
const currentKind = ref<RJCType>('human');

const orgOptsModal = ref<OptionItem[]>([]);
const handleOrgRemoteModal = async (kw: string) => {
  const res = await fetchOrganizationPage({ page: 1, rows: 10, name: kw || '' });
  const records = (res.data?.list || []) as Array<{ id: string | number; name: string }>;
  orgOptsModal.value.splice(0, orgOptsModal.value.length, ...records.map(r => ({ label: r.name, value: String(r.id) })));
};

const conserveOptsModal = ref<OptionItem[]>([]);
const syncConserveOption = () => {
  const field = formOptions.value.list.find(i => i.prop === 'conserveId');
  if (field) field.opts = conserveOptsModal.value;
};
const fetchConserveOptions = async (mode: RJCType, keyword = '') => {
  if (!mode) {
    conserveOptsModal.value = [];
    syncConserveOption();
    return;
  }
  const res = await request<ConserveItem[]>({
    url: 'sys/conserve/list',
    method: 'post',
    data: { mode, name: keyword || undefined },
  });
  const records = res.data || [];
  conserveOptsModal.value = records.map(i => ({ label: i.name, value: String(i.id) }));
  syncConserveOption();
};
const handleConserveRemoteModal = async (kw: string) => {
  await fetchConserveOptions(currentKind.value, kw || '');
};
const normalizeKind = (value: unknown): RJCType => {
  const str = String(value || '');
  if (str === 'machine' || str === 'material' || str === 'human') return str;
  return 'human';
};
const handleKindChange = (value: unknown, form: Record<string, unknown>) => {
  const kind = normalizeKind(value);
  currentKind.value = kind;
  form.conserveId = '';
  form.name = '';
  void fetchConserveOptions(kind);
};

const formOptions = ref<FormOption>({
  labelWidth: '110px',
  span: 12,
  list: [
    { type: 'select', label: '类别', prop: 'kind', required: true, opts: [
      { label: '人', value: 'human' }, { label: '机', value: 'machine' }, { label: '材', value: 'material' },
    ], onChange: handleKindChange },
    { type: 'select', label: '名称', prop: 'conserveId', required: true, placeholder: '请选择名称', opts: conserveOptsModal.value, remote: true, remoteMethod: handleConserveRemoteModal, filterable: true },
    { type: 'input', label: '单位', prop: 'unit', placeholder: '如：人/台/件' },
    { type: 'number', label: '单价', prop: 'price' },
    { type: 'select', label: '乙方单位', prop: 'organizationId', required: true, placeholder: '搜索乙方单位', opts: orgOptsModal.value, remote: true, remoteMethod: handleOrgRemoteModal, span: 24 },
  ],
});

const openAdd = async () => {
  isEdit.value = false;
  currentKind.value = 'human';
  await fetchConserveOptions('human');
  row.value = { kind: 'human', conserveId: '', unit: '', price: undefined, organizationId: null };
  visible.value = true;
};

const handleEdit = async (r: RJCRow) => {
  isEdit.value = true;
  let full: Partial<RJCRow> = { ...r };
  if (r.id) {
    const res = await getProcessUnitPrice(r.id);
    const pi = res.data as ProcessUnitPrice;
    full = {
      id: pi.id,
      kind: normalizeKind(pi.type),
      name: pi.name || '',
      conserveId: pi.conserveId || '',
      unit: pi.unit,
      price: pi.price,
      organizationId: pi.organizationId || null,
      organizationName: pi.organizationName || '',
    };
  }
  currentKind.value = normalizeKind(full.kind);
  await fetchConserveOptions(currentKind.value);
  if (full.conserveId && full.name) {
    const exists = conserveOptsModal.value.some(o => o.value === String(full.conserveId));
    if (!exists) conserveOptsModal.value.unshift({ label: full.name, value: String(full.conserveId) });
  }
  row.value = { ...full, organizationId: full.organizationId ? String(full.organizationId) : null };
  visible.value = true;
  if (full.organizationId && full.organizationName) {
    const exists = orgOptsModal.value.some(o => o.value === String(full.organizationId));
    if (!exists) orgOptsModal.value.unshift({ label: full.organizationName, value: String(full.organizationId) });
  }
};

const saveRow = async (form: Record<string, unknown>) => {
  // 乙方单位必须为远程项
  const idStr = form.organizationId ? String(form.organizationId) : '';
  const orgHit = idStr ? orgOptsModal.value.find(o => o.value === idStr) : null;
  if (!orgHit) { ElMessage.error('请选择有效的乙方单位'); return; }

  const conserveId = form.conserveId ? String(form.conserveId) : '';
  const conserveHit = conserveId ? conserveOptsModal.value.find(o => o.value === conserveId) : null;
  if (!conserveHit) { ElMessage.error('请选择有效的名称'); return; }

  const kind = normalizeKind(form.kind);
  // 组装 ProcessInfo 载荷
  const payloadPU: ProcessUnitPrice = {
    id: form.id ? String(form.id) : undefined,
    type: kind,
    name: conserveHit.label,
    conserveId: conserveHit.value,
    unit: form.unit ? String(form.unit) : undefined,
    price: form.price != null ? Number(form.price) : undefined,
    organizationId: idStr,
  };

  if (isEdit.value && payloadPU.id) {
    await updateProcessUnitPrice(payloadPU);
    ElMessage.success('保存成功');
  } else {
    await createProcessUnitPrice(payloadPU);
    ElMessage.success('新增成功');
  }
  closeDialog();
  loadData();
};

const handleDelete = async (r: RJCRow) => {
  if (!r.id) return;
  await deleteProcessUnitPrice(r.id);
  ElMessage.success('删除成功');
  loadData();
};

const closeDialog = () => { visible.value = false; isEdit.value = false; };
</script>

<style scoped>
.container { background: #fff; padding: 12px; border: 1px solid #ddd; border-radius: 5px; }
</style>
