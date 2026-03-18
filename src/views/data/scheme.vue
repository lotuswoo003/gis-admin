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
          <el-button type="primary" :icon="Edit" @click="openAdd">新增方案</el-button>
        </template>
        <template #operator="{ rows }">
          <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(rows)">编辑</el-button>
          <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(rows)">删除</el-button>
        </template>
      </TableCustom>
    </div>

    <el-dialog :title="isEdit ? '编辑方案' : '新增方案'" v-model="visible" width="1000px" destroy-on-close :close-on-click-modal="false" @close="closeDialog">
      <TableEdit :form-data="schemeRow" :options="formOptions" :edit="isEdit" :update="saveScheme">
        <template #finishStandards>
          <div class="rt-field">
            <Toolbar :editor="finishEditor" style="border-bottom:1px solid #ccc" />
            <Editor v-model="schemeRow.finishStandards" :defaultConfig="editorCfg" style="height:240px; overflow-y:hidden" @onCreated="(ed:any)=>finishEditor=ed" />
          </div>
        </template>
        <template #suggestions>
          <div class="rt-field">
            <Toolbar :editor="suggestEditor" style="border-bottom:1px solid #ccc" />
            <Editor v-model="schemeRow.suggestions" :defaultConfig="editorCfg" style="height:240px; overflow-y:hidden" @onCreated="(ed:any)=>suggestEditor=ed" />
          </div>
        </template>
        <template #intelligentSuggestions>
          <div class="rt-field">
            <Toolbar :editor="intelEditor" style="border-bottom:1px solid #ccc" />
            <Editor v-model="schemeRow.intelligentSuggestions" :defaultConfig="editorCfg" style="height:240px; overflow-y:hidden" @onCreated="(ed:any)=>intelEditor=ed" />
          </div>
        </template>
      </TableEdit>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="data-scheme">
import { ref, reactive, shallowRef, onBeforeUnmount } from 'vue';
import { Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import TableCustom from '@/components/table-custom.vue';
import TableSearch from '@/components/table-search.vue';
import type { FormOption, FormOptionList } from '@/types/form-option';
import type { PlanTemplate } from '@/types/plan-template';
import { fetchPlanTemplatePage, createPlanTemplate, updatePlanTemplate, deletePlanTemplate } from '@/api/plan-template';
import { fetchOrganizationPage } from '@/api/organization';
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';

// 查询条件
const query = reactive({
  organizationId: null as string | null,
  provinceId: null as string | null,
  cityId: null as string | null,
  countyId: null as string | null,
});

const orgOpts = ref<any[]>([]);
const handleOrgRemote = async (kw: string) => {
  const res = await fetchOrganizationPage({ page: 1, rows: 10, name: kw || '' });
  const records = (res.data?.list || []) as any[];
  orgOpts.value = records.map(r => ({ label: r.name, value: String(r.id) }));
  const opt = searchOpt.value.find(o => o.prop === 'organizationId');
  if (opt) opt.opts = orgOpts.value;
};

const searchOpt = ref<FormOptionList[]>([
  { type: 'region', label: '所在位置：', prop: 'region' },
  { type: 'select', label: '甲方单位：', prop: 'organizationId', placeholder: '搜索甲方单位', opts: orgOpts.value, remote: true, remoteMethod: handleOrgRemote, inputStyle: { width: '380px' } },
]);

const handleSearch = () => {
  page.index = 1;
  loadData();
};

// 列配置
const columns = ref([
  { type: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'type', label: '模板类型', align: 'left' },
  { prop: 'month', label: '月份' },
  { prop: 'organizationName', label: '甲方单位' },
  { prop: 'region', label: '适用区域' },
  { prop: 'inputLabor', label: '投入人力' },
  { prop: 'workload', label: '工作量' },
  { prop: 'finishStandards', label: '完成标准' },
  { prop: 'operator', label: '操作', width: 200 },
]);

// 表格与分页
const page = reactive({ index: 1, rows: 10, total: 0 });
type SchemeRow = PlanTemplate & { region?: string };
const tableData = ref<SchemeRow[]>([]);

const changePage = (val: number) => {
  page.index = val;
  loadData();
};

const loadData = async () => {
  const res = await fetchPlanTemplatePage({
    page: page.index,
    rows: page.rows,
    organizationId: query.organizationId || undefined,
    provinceId: query.provinceId || undefined,
    cityId: query.cityId || undefined,
    countyId: query.countyId || undefined,
  });
  const total = res.data?.total || 0;
  const records = (res.data?.list || []) as PlanTemplate[];
  tableData.value = records.map(item => ({
    ...item,
    region: [item.province, item.city, item.county].filter(Boolean).join('-') || '—',
  }));
  page.total = total;
};

loadData();

// 操作区
const visible = ref(false);
const isEdit = ref(false);
const schemeRow = ref<any>({
  types: [],
  month: null,
  inputLabor: null,
  workload: null,
  description: '',
  finishStandards: '',
  suggestions: '',
  intelligentSuggestions: '',
  organizationId: null,
  provinceId: null,
  cityId: null,
  countyId: null,
});

const orgOptsModal = ref<any[]>([]);
const handleOrgRemoteModal = async (kw: string) => {
  const res = await fetchOrganizationPage({ page: 1, rows: 10, name: kw || '' });
  const records = (res.data?.list || []) as any[];
  const mapped = records.map(r => ({ label: r.name, value: String(r.id) }));
  // Preserve array reference so formOptions.list[...].opts stays reactive
  orgOptsModal.value.splice(0, orgOptsModal.value.length, ...mapped);
};

const formOptions = ref<FormOption>({
  labelWidth: '100px',
  span: 12,
  list: [
    { type: 'select', label: '模板类型', prop: 'types', required: true, multiple: true, opts: [
      { label: '日常养护', value: '日常养护' },
      { label: '植被养护', value: '植被养护' },
      { label: '专项养护', value: '专项养护' },
    ] },
    { type: 'select', label: '月份', prop: 'month', required: true, opts: [
      { label: '1月', value: 1 }, { label: '2月', value: 2 }, { label: '3月', value: 3 }, { label: '4月', value: 4 },
      { label: '5月', value: 5 }, { label: '6月', value: 6 }, { label: '7月', value: 7 }, { label: '8月', value: 8 },
      { label: '9月', value: 9 }, { label: '10月', value: 10 }, { label: '11月', value: 11 }, { label: '12月', value: 12 },
    ] },
    { type: 'select', label: '甲方单位', prop: 'organizationId', required: true, placeholder: '搜索甲方单位', opts: orgOptsModal.value, remote: true, remoteMethod: handleOrgRemoteModal },
    { type: 'number', label: '投入人力', prop: 'inputLabor' },
    { type: 'number', label: '工作量', prop: 'workload' },
    { type: 'region', label: '适用区域', prop: 'region', span: 24 },
    { type: 'input', label: '描述', prop: 'description', placeholder: '方案描述（可选）', span: 24 },
    { type: 'richtext', label: '完成标准', prop: 'finishStandards', span: 24 },
    { type: 'richtext', label: '养护建议', prop: 'suggestions', span: 24 },
    { type: 'richtext', label: '智能化建议', prop: 'intelligentSuggestions', span: 24 },
  ],
});

const openAdd = () => {
  isEdit.value = false;
  schemeRow.value = {
    types: [], month: null, inputLabor: null, workload: null, description: '', finishStandards: '', suggestions: '', intelligentSuggestions: '', organizationId: null, provinceId: null, cityId: null, countyId: null,
  };
  visible.value = true;
};

const handleEdit = (row: SchemeRow) => {
  isEdit.value = true;
  schemeRow.value = {
    id: row.id,
    types: (row.type ? String(row.type).split(',') : []),
    month: row.month || null,
    inputLabor: row.inputLabor || null,
    workload: row.workload || null,
    description: row.description || '',
    finishStandards: row.finishStandards || '',
    suggestions: row.suggestions || '',
    intelligentSuggestions: row.intelligentSuggestions || '',
    organizationId: row.organizationId ? String(row.organizationId) : null,
    provinceId: row.provinceId || null,
    cityId: row.cityId || null,
    countyId: row.countyId || null,
  } as any;
  if (row.organizationId && row.organizationName) {
    const exists = orgOptsModal.value.some(o => o.value === String(row.organizationId));
    if (!exists) orgOptsModal.value.unshift({ label: row.organizationName, value: String(row.organizationId) });
  }
  visible.value = true;
};

const saveScheme = async (form: any) => {
  // 校验：甲方单位必须为远程返回项
  const idStr = form.organizationId ? String(form.organizationId) : '';
  const orgHit = idStr ? orgOptsModal.value.find((o: any) => o.value === idStr) : null;
  if (!orgHit) {
    ElMessage.error('请选择有效的甲方单位');
    return;
  }

  // 组织请求载荷
  const payload: PlanTemplate = {
    id: form.id,
    type: Array.isArray(form.types) ? form.types.join(',') : (form.type || ''),
    month: form.month ? Number(form.month) : undefined,
    inputLabor: form.inputLabor != null ? Number(form.inputLabor) : undefined,
    workload: form.workload != null ? Number(form.workload) : undefined,
    description: form.description,
    finishStandards: form.finishStandards,
    suggestions: form.suggestions,
    intelligentSuggestions: form.intelligentSuggestions,
    organizationId: idStr || undefined,
    organizationName: orgHit.label,
    province: form.province,
    city: form.city,
    county: form.county,
    provinceId: form.provinceId ? String(form.provinceId) : undefined,
    cityId: form.cityId ? String(form.cityId) : undefined,
    countyId: form.countyId ? String(form.countyId) : undefined,
  };

  if (isEdit.value) {
    await updatePlanTemplate(payload);
    ElMessage.success('已保存');
  } else {
    await createPlanTemplate(payload);
    ElMessage.success('已新增');
  }
  closeDialog();
  await loadData();
};

// 删除
const handleDelete = async (row: SchemeRow) => {
  if (!row || !row.id) return;
  await deletePlanTemplate(row.id as any);
  ElMessage.success('已删除');
  await loadData();
};

const closeDialog = () => {
  visible.value = false;
  isEdit.value = false;
};

// wangEditor instances lifecycle
let finishEditor: any = shallowRef();
let suggestEditor: any = shallowRef();
let intelEditor: any = shallowRef();
const editorCfg: any = { placeholder: '请输入内容...' };
onBeforeUnmount(() => {
  const arr: any[] = [finishEditor, suggestEditor, intelEditor];
  arr.forEach((r: any) => { const ed = r?.value || r; if (ed && ed.destroy) ed.destroy(); });
});
</script>

<style scoped>
.container {
  background: #fff;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.rt-field { border: 1px solid #ccc; margin-top: 4px; }
</style>
