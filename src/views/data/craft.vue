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
          <el-button @click="handleDownloadTpl">下载模板</el-button>
          <el-button type="success" @click="triggerImport">导入Excel</el-button>
          <input ref="fileInputRef" type="file" accept=".xls,.xlsx" style="display:none" @change="onFileChange" />
        </template>
        <template #typeText="{ rows }">
          <el-tag>{{ rows.typeText || '-' }}</el-tag>
        </template>
        <template #processes="{ rows }">
          <el-tooltip :content="(rows.processes || '').slice(0, 200)" placement="top" v-if="rows.processes">
            <span class="ellipsis">{{ rows.processes }}</span>
          </el-tooltip>
          <span v-else>—</span>
        </template>
        <template #operator="{ rows }">
          <el-button size="small" :icon="View" @click="openPreview(rows)">查看</el-button>
          <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(rows)">编辑</el-button>
          <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(rows)">删除</el-button>
        </template>
      </TableCustom>
    </div>

    <el-dialog :title="isEdit ? '编辑智能工艺' : '新增智能工艺'" v-model="visible" width="1000px" destroy-on-close :close-on-click-modal="false" @close="closeDialog">
      <TableEdit :form-data="row" :options="formOptions" :edit="isEdit" :update="saveRow">
        <template #processes>
          <div class="rt-field">
            <Toolbar :editor="procEditor" style="border-bottom:1px solid #ccc" />
            <Editor v-model="row.processes" :defaultConfig="editorCfg" style="height:260px; overflow-y:hidden" @onCreated="(ed:any)=>procEditor=ed" />
          </div>
        </template>
      </TableEdit>
    </el-dialog>
    <el-drawer v-model="previewVisible" title="查看工艺" size="60%" :close-on-click-modal="true">
      <div class="preview">
        <div class="preview-header">
          <el-tag class="mgr8">{{ dictStore.getLabel('green_space_type', previewRow?.type) || '-' }}</el-tag>
          <span class="preview-title">{{ previewRow?.question || '未命名工艺' }}</span>
        </div>
        <el-descriptions :column="3" border class="mgb12">
          <el-descriptions-item label="甲方单位">{{ previewRow?.organizationName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="排序">{{ previewRow?.sort ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ previewRow?.createdAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="人员">{{ previewRow?.human || '-' }}</el-descriptions-item>
          <el-descriptions-item label="工具设备">{{ previewRow?.tool || '-' }}</el-descriptions-item>
          <el-descriptions-item label="材料">{{ previewRow?.material || '-' }}</el-descriptions-item>
        </el-descriptions>
        <div class="preview-content" v-html="previewRow?.processes || '<div style=\'color:#999\'>暂无工艺流程</div>'"></div>
      </div>
    </el-drawer>
  </div>
  
</template>

<script setup lang="ts" name="data-craft">
import { ref, reactive, shallowRef, onBeforeUnmount } from 'vue';
import { Edit, Delete, View } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import TableCustom from '@/components/table-custom.vue';
import TableSearch from '@/components/table-search.vue';
import type { FormOption, FormOptionList } from '@/types/form-option';
import { fetchOrganizationPage } from '@/api/organization';
import { fetchProcessInfoPage, getProcessInfo, createProcessInfo, updateProcessInfo, deleteProcessInfo, downloadProcessInfoTemplate, importProcessInfoExcel } from '@/api/process-info';
import type { ProcessInfo } from '@/types/process-info';
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { computed, watchEffect } from 'vue';
import { useDictStore } from '@/store/dict';

// 查询
const query = reactive({
  type: '',
  question: '',
  organizationId: null as string | null,
});

// 动态填充表单“类别”为字典项
watchEffect(() => {
  try {
    const list: any[] = (formOptions.value as any).list || [];
    const i = list.findIndex((it: any) => it.prop === 'type');
    if (i >= 0) list[i] = { ...list[i], opts: greenTypeOpts.value };
  } catch {}
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
  { type: 'select', label: '类别：', prop: 'type', opts: [
    { label: '全部', value: '' },
    { label: '人', value: 'human' },
    { label: '机', value: 'machine' },
    { label: '材', value: 'material' },
  ] },
  { type: 'input', label: '问题：', prop: 'question', placeholder: '输入问题关键词' },
  { type: 'select', label: '甲方单位：', prop: 'organizationId', placeholder: '搜索甲方单位', opts: orgOpts.value, remote: true, remoteMethod: handleOrgRemote, inputStyle: { width: '320px' } },
]);

const handleSearch = () => { page.index = 1; loadData(); };

// 字典：智能工艺类型 green_space_type
const dictStore = useDictStore();
dictStore.loadAll();
const greenTypeOpts = computed(() => dictStore.getOptions('green_space_type'));

// 用字典覆盖“类别”搜索项的选项
watchEffect(() => {
  try {
    const base = [{ label: '全部', value: '' }];
    const idx = searchOpt.value.findIndex((it: any) => it.prop === 'type');
    if (idx >= 0) searchOpt.value[idx] = { ...searchOpt.value[idx], inputStyle: { width: '230px' }, opts: [...base, ...greenTypeOpts.value] } as any;
  } catch {}
});

// 列
const columns = ref([
  { type: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'typeText', label: '类别', width: 90 },
  { prop: 'question', label: '工艺问题', width: 100, align: 'left' },
  { prop: 'processes', label: '工艺流程', align: 'left' },
  { prop: 'sort', label: '排序', width: 80 },
  { prop: 'organizationName', label: '甲方单位', width: 140 },
  { prop: 'operator', label: '操作', width: 260 },
]);

// 分页列表
const page = reactive({ index: 1, rows: 10, total: 0 });
type CraftRow = ProcessInfo & { typeText?: string; organizationName?: string };
const tableData = ref<CraftRow[]>([]);

const loadData = async () => {
  const res = await fetchProcessInfoPage({ page: page.index, rows: page.rows, type: (query.type || undefined), question: (query.question || undefined), organizationId: (query.organizationId || undefined) });
  const total = res.data?.total || 0;
  const records = (res.data?.records || []) as ProcessInfo[];
  tableData.value = records.map(r => ({
    ...r,
    typeText: r.type === 'human' ? '人' : r.type === 'machine' ? '机' : r.type === 'material' ? '材' : (r.type || ''),
  }));
  page.total = total;
  // 使用字典标签覆盖类别文本
  try {
    tableData.value = tableData.value.map(r => ({ ...r, typeText: (dictStore.getLabel('green_space_type', (r as any).type) || (r as any).typeText) }));
  } catch {}
};
loadData();

const changePage = (val: number) => { page.index = val; loadData(); };

// 弹窗表单
const visible = ref(false);
const isEdit = ref(false);
const row = ref<any>({ type: '', question: '', processes: '', human: '', tool: '', material: '', sort: 0, organizationId: null });

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
    { type: 'select', label: '类别', prop: 'type', required: true, opts: [ { label: '人', value: 'human' }, { label: '机', value: 'machine' }, { label: '材', value: 'material' } ] },
    { type: 'input', label: '工艺问题', prop: 'question', required: true, placeholder: '请输入工艺问题' },
    { type: 'select', label: '甲方单位', prop: 'organizationId', placeholder: '搜索甲方单位', opts: orgOptsModal.value, remote: true, remoteMethod: handleOrgRemoteModal },
    { type: 'number', label: '排序', prop: 'sort' },
    { type: 'input', label: '人', prop: 'human' },
    { type: 'input', label: '机', prop: 'tool' },
    { type: 'input', label: '材', prop: 'material' },
    { type: 'richtext', label: '工艺流程', prop: 'processes', span: 24 },
  ],
});

const openAdd = () => {
  isEdit.value = false;
  visible.value = true;
  row.value = { type: (greenTypeOpts.value[0]?.value || 'human'), question: '', processes: '', human: '', tool: '', material: '', sort: 0, organizationId: null };
};

const handleEdit = async (r: CraftRow) => {
  isEdit.value = true;
  visible.value = true;
  if (r.id) {
    const res = await getProcessInfo(r.id);
    const pi = (res.data || {}) as ProcessInfo;
    row.value = {
      id: pi.id,
      type: pi.type || 'human',
      question: pi.question || '',
      processes: pi.processes || '',
      human: pi.human || '',
      tool: pi.tool || '',
      material: pi.material || '',
      sort: pi.sort || 0,
      organizationId: pi.organizationId || null,
    } as any;
  }
};

const saveRow = async (form: any) => {
  const payload: ProcessInfo = {
    id: form.id,
    type: form.type,
    question: form.question,
    processes: form.processes,
    human: form.human,
    tool: form.tool,
    material: form.material,
    sort: form.sort != null ? Number(form.sort) : undefined,
    organizationId: form.organizationId || undefined,
  };
  if (isEdit.value && payload.id) {
    await updateProcessInfo(payload);
    ElMessage.success('保存成功');
  } else {
    await createProcessInfo(payload);
    ElMessage.success('新增成功');
  }
  closeDialog();
  loadData();
};

const handleDelete = async (r: CraftRow) => {
  if (!r.id) return;
  await ElMessageBox.confirm('确认删除该记录吗？', '提示', { type: 'warning' });
  await deleteProcessInfo(r.id);
  ElMessage.success('删除成功');
  loadData();
};

const closeDialog = () => { visible.value = false; isEdit.value = false; };

// 编辑器资源销毁
let procEditor: any = shallowRef();
const editorCfg: any = { placeholder: '请输入内容...' };
onBeforeUnmount(() => { const ed = (procEditor as any)?.value || procEditor; if (ed?.destroy) ed.destroy(); });

// 模板下载 & 导入
const handleDownloadTpl = async () => {
  const res = await downloadProcessInfoTemplate();
  const blob = res.data as unknown as Blob;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '工艺信息导入模板.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const fileInputRef = ref<HTMLInputElement | null>(null);
const triggerImport = () => fileInputRef.value?.click();
const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    await importProcessInfoExcel(file);
    ElMessage.success('导入成功');
    loadData();
  } catch (err: any) {
    ElMessage.error(err?.message || '导入失败');
  } finally {
    // reset input value to allow uploading the same file again
    if (input) input.value = '';
  }
};

// 预览
const previewVisible = ref(false);
const previewRow = ref<any>(null);
const openPreview = async (r: any) => {
  let full = r;
  if (r?.id) {
    const res = await getProcessInfo(r.id);
    full = (res.data || {}) as ProcessInfo & { organizationName?: string };
  }
  previewRow.value = full;
  previewVisible.value = true;
};
</script>

<style scoped>
.container { background: #fff; padding: 12px; border: 1px solid #ddd; border-radius: 5px; }
.ellipsis { max-width: 420px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.preview-header { display:flex; align-items:center; margin-bottom: 8px; }
.preview-title { font-size: 18px; font-weight: 600; color: #333; }
.mgb12 { margin-bottom: 12px; }
.mgr8 { margin-right: 8px; }
.preview-content { padding: 12px; border: 1px solid #eee; border-radius: 6px; min-height: 120px; }
</style>
