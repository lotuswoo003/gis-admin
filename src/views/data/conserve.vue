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
        :refresh="loadData"
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

<script setup lang="ts" name="data-conserve">
import { reactive, ref } from 'vue';
import { Delete, Edit } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import TableCustom from '@/components/table-custom.vue';
import TableEdit from '@/components/table-edit.vue';
import TableSearch from '@/components/table-search.vue';
import { createConserve, deleteConserve, fetchConservePage, getConserve, updateConserve } from '@/api/conserve';
import type { FormOption, FormOptionList } from '@/types/form-option';
import type { Conserve, ConserveMode } from '@/types/conserve';

type QueryParams = {
  name: string;
  mode: '' | ConserveMode;
};

type ConserveTableRow = {
  id: string;
  mode: ConserveMode;
  modeText: string;
  code: string;
  name: string;
};

const modeOptions: Array<{ label: string; value: ConserveMode }> = [
  { label: '人', value: 'people' },
  { label: '机', value: 'machine' },
  { label: '材', value: 'material' },
];

const modeLabelMap: Record<ConserveMode, string> = {
  people: '人',
  machine: '机',
  material: '材',
};

const normalizeMode = (mode?: string): ConserveMode | null => {
  if (mode === 'people' || mode === 'human') {
    return 'people';
  }
  if (mode === 'machine' || mode === 'material') {
    return mode;
  }
  return null;
};

const getModeText = (mode?: string): string => {
  const normalizedMode = normalizeMode(mode);
  return normalizedMode ? modeLabelMap[normalizedMode] : '';
};

const getRequestMode = (mode: '' | ConserveMode): ConserveMode | undefined => {
  if (mode === 'machine' || mode === 'material') {
    return mode;
  }
  return undefined;
};

const query = reactive<QueryParams>({
  name: '',
  mode: '',
});

const searchOpt = ref<FormOptionList[]>([
  { type: 'input', label: '名称：', prop: 'name', placeholder: '输入名称', inputStyle: { width: '320px' } },
  { type: 'select', label: '类别：', prop: 'mode', placeholder: '请选择类别', opts: modeOptions, inputStyle: { width: '180px' } },
]);

const columns = ref([
  { type: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'modeText', label: '类别', width: 100 },
  { prop: 'code', label: '编码', minWidth: 180, align: 'left' },
  { prop: 'name', label: '名称', minWidth: 180, align: 'left' },
  { prop: 'operator', label: '操作', width: 220 },
]);

const page = reactive({ index: 1, rows: 10, total: 0 });
const tableData = ref<ConserveTableRow[]>([]);

const loadData = async () => {
  const res = await fetchConservePage({
    page: page.index,
    rows: page.rows,
    name: query.name || undefined,
    mode: getRequestMode(query.mode),
  });
  const records = (res.data?.list || res.data?.records || []) as Conserve[];
  page.total = res.data?.total || 0;
  tableData.value = records
    .map((item) => {
      const normalizedMode = normalizeMode(item.mode);
      if (!normalizedMode) {
        return null;
      }
      if (query.mode && normalizedMode !== query.mode) {
        return null;
      }
      return {
        id: item.id || '',
        mode: normalizedMode,
        modeText: modeLabelMap[normalizedMode],
        code: item.code || '',
        name: item.name || '',
      } satisfies ConserveTableRow;
    })
    .filter((item): item is ConserveTableRow => item !== null);
};

const handleSearch = () => {
  page.index = 1;
  void loadData();
};

const changePage = (val: number) => {
  page.index = val;
  void loadData();
};

const visible = ref(false);
const isEdit = ref(false);
const row = ref<Partial<Conserve>>({
  mode: 'people',
});

const formOptions: FormOption = {
  labelWidth: '110px',
  span: 12,
  list: [
    { type: 'select', label: '类别', prop: 'mode', required: true, opts: modeOptions },
    { type: 'input', label: '编码', prop: 'code', required: true, placeholder: '请输入编码' },
    { type: 'input', label: '名称', prop: 'name', required: true, placeholder: '请输入名称' },
    { type: 'number', label: '排序', prop: 'dispalyOrder' },
  ],
};

const openAdd = () => {
  isEdit.value = false;
  row.value = {
    mode: 'people',
    code: '',
    name: '',
    dispalyOrder: undefined,
  };
  visible.value = true;
};

const handleEdit = async (currentRow: ConserveTableRow) => {
  if (!currentRow.id) {
    return;
  }
  isEdit.value = true;
  const res = await getConserve(currentRow.id);
  row.value = {
    ...res.data,
    mode: normalizeMode(res.data?.mode) || 'people',
  };
  visible.value = true;
};

const saveRow = async (form: Record<string, unknown>) => {
  const payload: Conserve = {
    id: form.id ? String(form.id) : undefined,
    mode: normalizeMode(String(form.mode || 'people')),
    code: String(form.code || '').trim(),
    name: String(form.name || '').trim(),
    dispalyOrder: form.dispalyOrder == null || form.dispalyOrder === '' ? undefined : Number(form.dispalyOrder),
  };

  if (isEdit.value && payload.id) {
    await updateConserve(payload);
    ElMessage.success('保存成功');
  } else {
    await createConserve(payload);
    ElMessage.success('新增成功');
  }

  closeDialog();
  await loadData();
};

const handleDelete = async (currentRow: ConserveTableRow) => {
  if (!currentRow.id) {
    return;
  }
  await deleteConserve(currentRow.id);
  ElMessage.success('删除成功');
  await loadData();
};

const closeDialog = () => {
  visible.value = false;
  isEdit.value = false;
};

void loadData();
</script>

<style scoped>
.container {
  background: #fff;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
</style>
