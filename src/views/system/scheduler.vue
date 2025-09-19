<template>
  <div class="scheduler-page">
    <div class="table-wrapper" v-loading="loading">
      <TableCustom
        :columns="columns"
        :tableData="jobs"
        row-key="id"
        :hasPagination="false"
        :refresh="loadJobs"
      >
        <template #toolbarBtn>
          <el-button type="primary" :icon="Plus" @click="openCreate">新增任务</el-button>
        </template>
        <template #status="{ rows }">
          <el-tag :type="statusMeta[rows.status || 'ACTIVE']?.type || 'info'">
            {{ statusMeta[rows.status || 'ACTIVE']?.text || rows.status || '-' }}
          </el-tag>
        </template>
        <template #requestUrl="{ rows }">
          <el-tooltip v-if="rows.requestUrl" :content="rows.requestUrl" placement="top">
            <span class="mono">{{ rows.requestUrl }}</span>
          </el-tooltip>
          <span v-else>-</span>
        </template>
        <template #lastTriggeredAt="{ rows }">
          {{ formatDateTime(rows.lastTriggeredAt) }}
        </template>
        <template #nextFireTime="{ rows }">
          {{ formatDateTime(rows.nextFireTime) }}
        </template>
        <template #operator="{ rows }">
          <el-button size="small" :icon="View" @click="handleView(rows)">查看</el-button>
          <el-button type="primary" size="small" plain :icon="Edit" @click="handleEdit(rows)" :disabled="rows.status === 'DELETED'">
            编辑
          </el-button>
          <el-button size="small" :icon="VideoPlay" @click="handleTrigger(rows)" :disabled="rows.status === 'DELETED'" :loading="isActionLoading(rows.id, 'trigger')">
            触发一次
          </el-button>
          <el-button
            size="small"
            type="warning"
            :icon="VideoPause"
            v-if="rows.status === 'ACTIVE'"
            @click="handlePause(rows)"
            :loading="isActionLoading(rows.id, 'pause')"
          >
            暂停
          </el-button>
          <el-button
            size="small"
            type="success"
            :icon="Refresh"
            v-else-if="rows.status === 'PAUSED'"
            @click="handleResume(rows)"
            :loading="isActionLoading(rows.id, 'resume')"
          >
            恢复
          </el-button>
          <el-button
            type="danger"
            size="small"
            :icon="Delete"
            @click="handleDelete(rows)"
            :disabled="rows.status === 'DELETED'"
            :loading="isActionLoading(rows.id, 'delete')"
          >
            删除
          </el-button>
        </template>
      </TableCustom>
    </div>

    <el-dialog
      :title="isEdit ? '编辑定时任务' : '新增定时任务'"
      v-model="formVisible"
      width="720px"
      destroy-on-close
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" maxlength="100" show-word-limit placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="Cron表达式" prop="cronExpression">
          <el-input v-model="form.cronExpression" placeholder="例如：0 0/5 * * * ?" />
        </el-form-item>
        <el-form-item label="请求地址" prop="requestUrl">
          <el-input v-model="form.requestUrl" placeholder="https://example.com/api" />
        </el-form-item>
        <el-form-item label="HTTP方法" prop="httpMethod">
          <el-select v-model="form.httpMethod" placeholder="请选择方法">
            <el-option v-for="method in httpMethods" :key="method" :label="method" :value="method" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input type="textarea" v-model="form.description" :rows="2" maxlength="200" show-word-limit placeholder="任务用途说明" />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="form.active" active-text="启用" inactive-text="禁用" />
        </el-form-item>
        <el-form-item label="请求头(JSON)">
          <el-input
            type="textarea"
            v-model="form.headersText"
            :rows="3"
            placeholder='{"Authorization":"Bearer ..."}'
          />
        </el-form-item>
        <el-form-item label="查询参数(JSON)">
          <el-input
            type="textarea"
            v-model="form.queryParamsText"
            :rows="3"
            placeholder='{"tenantId":"10001"}'
          />
        </el-form-item>
        <el-form-item label="请求体(JSON)">
          <el-input
            type="textarea"
            v-model="form.bodyText"
            :rows="4"
            placeholder='{"payload":"value"}'
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="formVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitForm">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="任务详情" v-model="detailVisible" width="720px" destroy-on-close>
      <el-descriptions :column="1" border v-if="detailJob">
        <el-descriptions-item label="任务名称">{{ detailJob.name }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusMeta[detailJob.status || 'ACTIVE']?.type || 'info'">
            {{ statusMeta[detailJob.status || 'ACTIVE']?.text || detailJob.status || '-' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Cron表达式">{{ detailJob.cronExpression }}</el-descriptions-item>
        <el-descriptions-item label="HTTP方法">{{ detailJob.httpMethod }}</el-descriptions-item>
        <el-descriptions-item label="请求地址">
          <span class="mono">{{ detailJob.requestUrl }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="是否启用">{{ detailJob.active === false ? '禁用' : '启用' }}</el-descriptions-item>
        <el-descriptions-item label="任务描述">{{ detailJob.description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上次触发时间">{{ formatDateTime(detailJob.lastTriggeredAt) }}</el-descriptions-item>
        <el-descriptions-item label="下次计划时间">{{ formatDateTime(detailJob.nextFireTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailJob.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(detailJob.updatedAt) }}</el-descriptions-item>
        <el-descriptions-item label="请求头">
          <pre class="json-block">{{ formatJson(detailJob.headers) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="查询参数">
          <pre class="json-block">{{ formatJson(detailJob.queryParams) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="请求体">
          <pre class="json-block">{{ formatJson(detailJob.body) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
      <div v-else class="empty-holder">暂无数据</div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="system-scheduler">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import { Plus, Edit, Delete, View, VideoPlay, VideoPause, Refresh } from '@element-plus/icons-vue';
import TableCustom from '@/components/table-custom.vue';
import {
  listSchedulerJobs,
  getSchedulerJob,
  createSchedulerJob,
  updateSchedulerJob,
  deleteSchedulerJob,
  triggerSchedulerJob,
  pauseSchedulerJob,
  resumeSchedulerJob,
} from '@/api/scheduler';
import type { SchedulerJob, SchedulerJobPayload, SchedulerJobStatus } from '@/types/scheduler';

type SchedulerJobRow = SchedulerJob;

interface SchedulerJobFormState {
  name: string;
  description: string;
  cronExpression: string;
  requestUrl: string;
  httpMethod: string;
  headersText: string;
  queryParamsText: string;
  bodyText: string;
  active: boolean;
}

const statusMeta: Record<SchedulerJobStatus, { text: string; type: 'success' | 'warning' | 'info' | 'danger' }> = {
  ACTIVE: { text: '运行中', type: 'success' },
  PAUSED: { text: '已暂停', type: 'warning' },
  DELETED: { text: '已删除', type: 'info' },
};

const httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const columns = ref([
  { type: 'index', label: '序号', width: 60 },
  { prop: 'name', label: '任务名称', align: 'left', minWidth: 150 },
  { prop: 'cronExpression', label: 'Cron表达式', minWidth: 140 },
  { prop: 'httpMethod', label: 'HTTP方法', width: 110 },
  { prop: 'requestUrl', label: '请求地址', minWidth: 220 },
  { prop: 'status', label: '状态', width: 110 },
  { prop: 'lastTriggeredAt', label: '上次触发', minWidth: 160 },
  { prop: 'nextFireTime', label: '下次计划', minWidth: 160 },
  { prop: 'operator', label: '操作', minWidth: 380 },
]);

const jobs = ref<SchedulerJobRow[]>([]);
const loading = ref(false);
const detailVisible = ref(false);
const detailJob = ref<SchedulerJobRow | null>(null);

const formVisible = ref(false);
const formRef = ref<FormInstance>();
const submitting = ref(false);
const isEdit = ref(false);
const editingId = ref<string | null>(null);

const createDefaultFormState = (): SchedulerJobFormState => ({
  name: '',
  description: '',
  cronExpression: '',
  requestUrl: '',
  httpMethod: 'GET',
  headersText: '',
  queryParamsText: '',
  bodyText: '',
  active: true,
});

const form = reactive<SchedulerJobFormState>(createDefaultFormState());

const rules: FormRules = {
  name: [
    { required: true, message: '任务名称不能为空', trigger: 'blur' },
  ],
  cronExpression: [
    { required: true, message: 'Cron表达式不能为空', trigger: 'blur' },
  ],
  requestUrl: [
    { required: true, message: '请求地址不能为空', trigger: 'blur' },
  ],
  httpMethod: [
    { required: true, message: '请选择HTTP方法', trigger: 'change' },
  ],
};

const actioning = reactive<{ id: string | null; type: string | null }>({ id: null, type: null });
const isActionLoading = (id: string, type: string) => actioning.id === id && actioning.type === type;

const setActionLoading = (id: string, type: string) => {
  actioning.id = id;
  actioning.type = type;
};
const clearActionLoading = () => {
  actioning.id = null;
  actioning.type = null;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const formatJson = (val: any) => {
  if (val === null || val === undefined) return '-';
  try {
    return JSON.stringify(val, null, 2);
  } catch (e) {
    return String(val);
  }
};

const resetForm = () => {
  Object.assign(form, createDefaultFormState());
  editingId.value = null;
  formRef.value?.clearValidate();
};

const applyJobToForm = (job: SchedulerJobRow) => {
  form.name = job.name;
  form.description = job.description || '';
  form.cronExpression = job.cronExpression;
  form.requestUrl = job.requestUrl;
  form.httpMethod = job.httpMethod || 'GET';
  form.headersText = job.headers ? JSON.stringify(job.headers, null, 2) : '';
  form.queryParamsText = job.queryParams ? JSON.stringify(job.queryParams, null, 2) : '';
  form.bodyText = job.body ? JSON.stringify(job.body, null, 2) : '';
  if (typeof job.active === 'boolean') {
    form.active = job.active;
  } else {
    form.active = job.status !== 'PAUSED' && job.status !== 'DELETED';
  }
};

const parseJsonObject = (raw: string, label: string): Record<string, any> | undefined => {
  if (!raw.trim()) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      ElMessage.error(`${label} 必须是JSON对象`);
      throw new Error('invalid-json');
    }
    return parsed as Record<string, any>;
  } catch (error: any) {
    if (error?.message === 'invalid-json') throw error;
    ElMessage.error(`${label} 解析失败：${error?.message || error}`);
    throw new Error('invalid-json');
  }
};

const parseJsonValue = (raw: string, label: string): any => {
  if (!raw.trim()) return undefined;
  try {
    return JSON.parse(raw);
  } catch (error: any) {
    ElMessage.error(`${label} 解析失败：${error?.message || error}`);
    throw new Error('invalid-json');
  }
};

const normalizeHeaders = (input?: Record<string, any>) => {
  if (!input) return undefined;
  const result: Record<string, string> = {};
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    result[key] = String(value);
  });
  return Object.keys(result).length ? result : undefined;
};

const buildPayload = (): SchedulerJobPayload => {
  const payload: SchedulerJobPayload = {
    name: form.name.trim(),
    description: form.description?.trim() || undefined,
    cronExpression: form.cronExpression.trim(),
    requestUrl: form.requestUrl.trim(),
    httpMethod: form.httpMethod,
    active: form.active,
  };
  const headersObj = parseJsonObject(form.headersText, '请求头');
  if (headersObj) payload.headers = normalizeHeaders(headersObj) || undefined;
  const queryObj = parseJsonObject(form.queryParamsText, '查询参数');
  if (queryObj) payload.queryParams = queryObj;
  const bodyVal = parseJsonValue(form.bodyText, '请求体');
  if (bodyVal !== undefined) {
    if (!bodyVal || typeof bodyVal !== 'object' || Array.isArray(bodyVal)) {
      ElMessage.error('请求体必须是JSON对象');
      throw new Error('invalid-json');
    }
    payload.body = bodyVal as Record<string, any>;
  }
};

const loadJobs = async () => {
  loading.value = true;
  try {
    const res = await listSchedulerJobs();
    const list = Array.isArray(res.data) ? res.data : [];
    jobs.value = list;
  } catch (err: any) {
    ElMessage.error(err?.message || '加载定时任务失败');
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  resetForm();
  isEdit.value = false;
  formVisible.value = true;
};

const handleEdit = async (row: SchedulerJobRow) => {
  if (!row.id) return;
  try {
    loading.value = true;
    const res = await getSchedulerJob(row.id);
    const data = res.data;
    if (!data) {
      ElMessage.error('未找到任务详情');
      return;
    }
    resetForm();
    applyJobToForm(data);
    editingId.value = data.id;
    isEdit.value = true;
    formVisible.value = true;
  } catch (err: any) {
    ElMessage.error(err?.message || '加载任务详情失败');
  } finally {
    loading.value = false;
  }
};

const handleView = async (row: SchedulerJobRow) => {
  if (!row.id) return;
  try {
    loading.value = true;
    const res = await getSchedulerJob(row.id);
    detailJob.value = res.data || null;
    detailVisible.value = true;
  } catch (err: any) {
    ElMessage.error(err?.message || '获取任务详情失败');
  } finally {
    loading.value = false;
  }
};

const submitForm = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      const payload = buildPayload();
      submitting.value = true;
      if (isEdit.value && editingId.value) {
        await updateSchedulerJob(editingId.value, payload);
        ElMessage.success('任务更新成功');
      } else {
        await createSchedulerJob(payload);
        ElMessage.success('任务创建成功');
      }
      formVisible.value = false;
      await loadJobs();
    } catch (err: any) {
      if (err?.message && !String(err.message).includes('invalid-json')) {
        ElMessage.error(err?.message || '保存失败');
      }
    } finally {
      submitting.value = false;
    }
  });
};

const confirmAction = async (_row: SchedulerJobRow, message: string) => {
  await ElMessageBox.confirm(message, '提示', { type: 'warning' });
};

const handleTrigger = async (row: SchedulerJobRow) => {
  if (!row.id) return;
  try {
    await confirmAction(row, '确认立即触发该任务一次吗？');
  } catch {
    return;
  }
  try {
    setActionLoading(row.id, 'trigger');
    await triggerSchedulerJob(row.id);
    ElMessage.success('任务触发成功');
    await loadJobs();
  } catch (err: any) {
    ElMessage.error(err?.message || '任务触发失败');
  } finally {
    clearActionLoading();
  }
};

const handlePause = async (row: SchedulerJobRow) => {
  if (!row.id) return;
  try {
    await confirmAction(row, '确认暂停该任务吗？');
  } catch {
    return;
  }
  try {
    setActionLoading(row.id, 'pause');
    await pauseSchedulerJob(row.id);
    ElMessage.success('任务已暂停');
    await loadJobs();
  } catch (err: any) {
    ElMessage.error(err?.message || '暂停任务失败');
  } finally {
    clearActionLoading();
  }
};

const handleResume = async (row: SchedulerJobRow) => {
  if (!row.id) return;
  try {
    await confirmAction(row, '确认恢复该任务吗？');
  } catch {
    return;
  }
  try {
    setActionLoading(row.id, 'resume');
    await resumeSchedulerJob(row.id);
    ElMessage.success('任务已恢复');
    await loadJobs();
  } catch (err: any) {
    ElMessage.error(err?.message || '恢复任务失败');
  } finally {
    clearActionLoading();
  }
};

const handleDelete = async (row: SchedulerJobRow) => {
  if (!row.id) return;
  try {
    await confirmAction(row, '确认删除该任务吗？删除后将无法恢复');
  } catch {
    return;
  }
  try {
    setActionLoading(row.id, 'delete');
    await deleteSchedulerJob(row.id);
    ElMessage.success('任务已删除');
    await loadJobs();
  } catch (err: any) {
    ElMessage.error(err?.message || '删除任务失败');
  } finally {
    clearActionLoading();
  }
};

loadJobs();
</script>

<style scoped>
.scheduler-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-wrapper {
  padding: 16px;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
}

.mono {
  font-family: 'Fira Code', Consolas, 'Courier New', monospace;
}

.json-block {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.empty-holder {
  text-align: center;
  color: #888;
  padding: 24px 0;
}
</style>

