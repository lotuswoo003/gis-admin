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
        :viewFunc="handleView"
        :editFunc="handleEdit"
        :delFunc="handleDelete"
      >
        <template #toolbarBtn>
          <el-button type="primary" :icon="Edit" @click="openAdd">新增检查</el-button>
        </template>
      </TableCustom>
    </div>

    <el-dialog :title="isEdit ? '编辑' : '新增'" v-model="visible" width="900px" destroy-on-close :close-on-click-modal="false" @close="closeDialog">
      <TableEdit :form-data="row" :options="formOptions" :edit="isEdit" :update="saveRow">
        <template #imageList>
          <el-upload
            :file-list="fileList"
            :limit="10"
            :auto-upload="true"
            :http-request="handleUpload"
            :on-remove="onRemove"
            :on-success="onSuccess"
            :on-error="onError"
            :on-preview="onPreview"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </template>
      </TableEdit>
    </el-dialog>

    <el-dialog v-model="imgPreviewVisible" title="图片预览" width="720px" destroy-on-close>
      <img :src="imgPreviewUrl" style="max-width:100%" />
    </el-dialog>

    <el-dialog title="详情" v-model="viewVisible" width="760px" destroy-on-close>
      <TableDetail :data="detailData">
        <template #imageList>
          <div style="display:flex; gap:8px; flex-wrap:wrap">
            <el-image v-for="u in viewImages" :key="u" :src="u" :preview-src-list="viewImages" style="width:100px;height:100px" fit="cover" />
          </div>
        </template>
      </TableDetail>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="security-check">
import { ref, reactive, computed, watchEffect } from 'vue';
import { Edit, Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import TableCustom from '@/components/table-custom.vue';
import TableSearch from '@/components/table-search.vue';
import TableEdit from '@/components/table-edit.vue';
import TableDetail from '@/components/table-detail.vue';
import type { FormOption, FormOptionList } from '@/types/form-option';
import { useDictStore } from '@/store/dict';
import { uploadToOss } from '@/utils/oss';
import { fetchSecurityCheckPage, getSecurityCheck, createSecurityCheck, updateSecurityCheck, deleteSecurityCheck } from '@/api/security-check';
import type { SecurityCheck } from '@/types/security-check';
import type { UploadRequestOptions, UploadUserFile } from 'element-plus';

// 查询
const query = reactive({
  type: '', // security_mode
  keyword: '', // 搜索项目
});

const searchOpt = ref<FormOptionList[]>([
  { type: 'select', label: '类别', prop: 'type', inputStyle: { width: '230px' }, opts: [ { label: '全部', value: '' } ] },
  { type: 'input', label: '关键字：', prop: 'keyword', placeholder: '项目名关键词', inputStyle: { width: '220px' } },
]);

const handleSearch = () => { page.index = 1; loadData(); };

// 表格
const columns = ref([
  { type: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'name', label: '安全检查项', align: 'left' },
  { prop: 'typeText', label: '类别', width: 120 },
  { prop: 'description', label: '安全检查说明', align: 'left' },
  { prop: 'operator', label: '操作', width: 260 },
]);

// 分页 & 数据
const page = reactive({ index: 1, rows: 10, total: 0 });
type Row = SecurityCheck & { typeText?: string; attachUrls?: string[] };
const tableData = ref<Row[]>([]);

// 弹窗与详情（提前声明，供 watchEffect 使用）
const visible = ref(false);
const viewVisible = ref(false);
const isEdit = ref(false);
const row = ref<Row>({});
const viewRow = ref<Row>({});
const viewImages = ref<string[]>([]);
const fileList = ref<UploadUserFile[]>([]);

// 表单选项
const formOptions = ref<FormOption>({
  labelWidth: '110px',
  span: 12,
  list: [
    { type: 'input', label: '安全检查项', prop: 'name', required: true, placeholder: '请输入检查项' },
    { type: 'select', label: '类别', prop: 'mode', required: true, opts: [] },
    { type: 'slot', label: '安全检查说明图片', prop: 'imageList', span: 24 },
    { type: 'textarea', label: '安全检查说明', prop: 'description', span: 24, placeholder: '请输入检查说明' },
  ],
});

// 字典：类别 security_mode
const dictStore = useDictStore();
dictStore.loadAll();
const secTypeOpts = computed(() => dictStore.getOptions('security_mode'));
watchEffect(() => {
  // 搜索下拉
  const idx = searchOpt.value.findIndex(it => it.prop === 'type');
  if (idx >= 0) searchOpt.value[idx] = { ...searchOpt.value[idx], opts: [ { label: '全部', value: '' }, ...secTypeOpts.value ] } as any;
  // 表单里的类别下拉
  const list: any[] = (formOptions.value as any).list || [];
  const i = list.findIndex((it: any) => it.prop === 'mode');
  if (i >= 0) list[i] = { ...list[i], opts: secTypeOpts.value };
  if (!row.value.mode && secTypeOpts.value.length) row.value.mode = secTypeOpts.value[0].value as any;
});

const loadData = async () => {
  const res = await fetchSecurityCheckPage({ page: page.index, rows: page.rows, name: (query.keyword || ''), mode: (query.type || '') });
  const total = res.data?.total || 0;
  const records = (res.data?.records || []) as SecurityCheck[];
  tableData.value = records.map((r) => ({
    ...r,
    typeText: dictStore.getLabel('security_mode', r.mode),
  } as Row));
  page.total = total;
};
loadData();

const changePage = (val: number) => { page.index = val; loadData(); };

const openAdd = () => {
  isEdit.value = false;
  visible.value = true;
  row.value = { name: '', mode: '', attachUrls: [], description: '' } as any;
  fileList.value = [];
};

const handleEdit = async (r: Row) => {
  isEdit.value = true;
  visible.value = true;
  const res = await getSecurityCheck(r.id!);
  const sc = res.data as SecurityCheck;
  row.value = { ...(sc || {}) } as Row;
  // 解析图片列表
  let urls: string[] = [];
  try {
    if (row.value.imageList) {
      const raw = row.value.imageList as any;
      if (typeof raw === 'string') {
        try { urls = JSON.parse(raw); } catch { urls = (raw as string).split(',').filter(Boolean); }
      } else if (Array.isArray(raw)) {
        urls = raw as string[];
      }
    }
  } catch {}
  fileList.value = (urls || []).map(u => ({ name: (u.split('/').pop() || '附件'), url: u }));
  row.value.attachUrls = urls || [];
};

const detailData = computed(() => ({
  row: viewRow.value,
  title: '安全检查详情',
  column: 2,
  list: [
    { label: '安全检查项', prop: 'name', span: 2 },
    { label: '类别', prop: 'typeText', span: 1 },
    { label: '描述', prop: 'description', span: 2 },
    { label: '图片', prop: 'imageList', span: 2 },
  ],
}))

const handleView = async (r: Row) => {
  if (!r.id) return;
  const res = await getSecurityCheck(r.id);
  const sc = res.data as SecurityCheck;
  const full = { ...sc, typeText: dictStore.getLabel('security_mode', sc.mode) } as Row;
  viewRow.value = full;
  let urls: string[] = [];
  const raw = full.imageList as any;
  if (typeof raw === 'string' && raw) {
    try { urls = JSON.parse(raw); } catch { urls = raw.split(',').filter(Boolean); }
  } else if (Array.isArray(raw)) {
    urls = raw as string[];
  }
  viewImages.value = urls || [];
  viewVisible.value = true;
};

const saveRow = async (form: any) => {
  const imageList = JSON.stringify(row.value.attachUrls || []);
  const description = (form.description ?? row.value.description) || '';
  if (isEdit.value && (row.value.id || form.id)) {
    await updateSecurityCheck({ id: (row.value.id || form.id), name: (form.name || row.value.name), mode: (form.mode || row.value.mode), imageList, description } as any);
    ElMessage.success('保存成功');
  } else {
    const idRes = await createSecurityCheck({ name: form.name, mode: form.mode, imageList, description } as any);
    row.value.id = (idRes.data as any) || row.value.id;
    ElMessage.success('新增成功');
  }
  closeDialog();
  loadData();
};

const handleDelete = async (r: Row) => {
  if (!r.id) return;
  await ElMessageBox.confirm('确认删除该记录吗？', '提示', { type: 'warning' });
  await deleteSecurityCheck(r.id);
  ElMessage.success('删除成功');
  loadData();
};

const closeDialog = () => { visible.value = false; isEdit.value = false; };

// 上传逻辑（阿里云 OSS）
const imgPreviewVisible = ref(false);
const imgPreviewUrl = ref('');
const ensureAttachArr = () => { if (!Array.isArray(row.value.attachUrls)) row.value.attachUrls = []; };

const handleUpload = async (opt: UploadRequestOptions) => {
  try {
    const f = opt.file as File;
    const res = await uploadToOss('security/check', f);
    ensureAttachArr();
    row.value.attachUrls!.push(res.url);
    fileList.value.push({ name: f.name, url: res.url } as UploadUserFile);
    opt.onSuccess && opt.onSuccess({}, f as any);
  } catch (e: any) {
    opt.onError && opt.onError(e);
  }
};

const onRemove = (file: UploadUserFile) => {
  ensureAttachArr();
  const url = file.url || '';
  row.value.attachUrls = (row.value.attachUrls || []).filter(u => u !== url);
};

const onSuccess = () => {};
const onError = (err: any) => { ElMessage.error(err?.message || '上传失败'); };
const onPreview = (file: UploadUserFile) => { imgPreviewUrl.value = file.url || ''; imgPreviewVisible.value = true; };
</script>

<style scoped>
.container { background: #fff; padding: 12px; border: 1px solid #ddd; border-radius: 5px; }
</style>

