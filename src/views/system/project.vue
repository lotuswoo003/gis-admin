<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
            <TableCustom
                :columns="columns"
                :tableData="tableData"
                :total="page.total"
                :viewFunc="handleView"
                :delFunc="handleDelete"
                :page-change="changePage"
                :editFunc="handleEdit"
            >
                <template #toolbarBtn>
                    <el-button type="primary" :icon="Refresh" :loading="syncing" @click="handleSyncExternal">外业项目同步</el-button>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="visible = true">新增</el-button>
                </template>
                <template #operator="{ rows }">
                    <el-button type="primary" size="small" :icon="Link" @click="handleBind(rows)">
                        关联
                    </el-button>
                    <el-button type="success" size="small" :icon="Search" @click="handleParcel(rows)">
                        查询地块
                    </el-button>
                    <el-button type="warning" size="small" :icon="VideoCameraFilled" @click="handleSyncOrtho(rows)">
                        同步正射
                    </el-button>
                    <el-button type="info" size="small" :icon="MapLocation" @click="handleSyncVector(rows)">
                        同步图斑
                    </el-button>
                    <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(rows)">
                        编辑
                    </el-button>
                </template>
            </TableCustom>
        </div>
        <el-dialog
            :title="isEdit ? '编辑' : '新增'"
            v-model="visible"
            width="700px"
            destroy-on-close
            :close-on-click-modal="false"
            @close="closeDialog"
        >
            <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData" />
        </el-dialog>
        <el-dialog title="查看详情" v-model="visible1" width="700px" destroy-on-close>
            <TableDetail :data="viewData"></TableDetail>
        </el-dialog>
        <el-dialog
            title="关联内外业项目"
            v-model="bindDialog.visible"
            width="1000px"
            destroy-on-close
            @close="closeBindDialog"
        >
            <div class="bind-dialog">
                <div class="bind-dialog__search">
                    <el-input
                        v-model="bindQuery.name"
                        placeholder="请输入内外业项目名称"
                        clearable
                        @keyup.enter="handleBindSearch"
                    />
                    <el-button type="primary" @click="handleBindSearch" :loading="bindDialog.loading">搜索</el-button>
                </div>
                <el-table
                    :data="bindDialog.list"
                    v-loading="bindDialog.loading"
                    height="420px"
                    border
                >
                    <el-table-column prop="id" label="项目ID" width="180" />
                    <el-table-column prop="name" label="项目名称" />
                    <el-table-column prop="status" label="状态" width="120">
                        <template #default="{ row }">
                            <el-tag v-if="row.status === 0" type="info">未开始</el-tag>
                            <el-tag v-else-if="row.status === 1" type="success">进行中</el-tag>
                            <el-tag v-else type="info">-</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="updateTime" label="更新时间" width="100">
                        <template #default="{ row }">
                            {{ formatDate(row.updateTime) || '-' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="320">
                        <template #default="{ row }">
                            <el-button type="primary" size="small" @click="handleSelectBind(row)">选择</el-button>
                            <el-button type="danger" size="small" plain :icon="Delete" @click="handleDeleteOrtho(row)">删除正射</el-button>
                            <el-button type="danger" size="small" :icon="Delete" @click="handleDeleteVector(row)">删除图斑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="bind-dialog__footer">
                    <span>共 {{ bindDialog.total }} 条记录</span>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-project">
import { ref, reactive } from 'vue';
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled, Edit, Search, Refresh, Link, VideoCameraFilled, MapLocation, Delete } from '@element-plus/icons-vue';
import type { Project, RawProject, ExternalProject, ExternalProjectQuery, InternalProjectBind } from '@/types/project';
import { fetchProjectPage, getProject, saveProject, updateProject, syncExternalProjects, fetchInternalProjectList, fetchInternalProjectBinds, deleteProjectFeatures, deleteProjectOrthographic, insertBatchInternalBinding, syncInternalOrthographic, syncInternalFeatures } from '@/api/project';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import TableEdit from '@/components/table-edit.vue';
import { FormOption, FormOptionList } from '@/types/form-option';

// 查询相关
const query = reactive({
    name: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '项目名称：', prop: 'name' },
]);
const handleSearch = () => {
    changePage(1);
};

// 表格相关
let columns = ref([
    { prop: 'id', label: '项目ID', width: 140 },
    { prop: 'name', label: '项目名称' },
    { prop: 'externalProjectName', label: '内外业项目', width: 240 },
    { prop: 'partyAName', label: '甲方名称', width: 140 },
    { prop: 'partyBName', label: '乙方名称', width: 140 },
    { prop: 'startTime', label: '开始时间', width: 120 },
    { prop: 'endTime', label: '结束时间', width: 120 },
    { prop: 'operator', label: '操作', width: 620 },
]);
const page = reactive({
    index: 1,
    rows: 10,
    total: 0,
});
const formatDate = (value?: string | null) => (value ? dayjs(value).format('YYYY-MM-DD') : '');

const toBindKey = (value: unknown): string => {
    if (value == null) return '';
    if (typeof value === 'number' || typeof value === 'bigint') {
        return value.toString();
    }
    if (typeof value === 'string') {
        const numeric = Number(value);
        if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
            return numeric.toString();
        }
        return value.trim();
    }
    return String(value);
};

const normalizeProject = (item: Partial<RawProject> & Partial<Project>): Project => {
    const startSource = (item as RawProject).startDate ?? (item.startTime as string) ?? null;
    const endSource = (item as RawProject).endDate ?? (item.endTime as string) ?? null;
    return {
        id: item.id != null ? String(item.id) : '',
        name: item.name ?? '',
        partyAName: (item.partyAName as string) ?? item.partyAOrganizationName ?? '',
        partyBName: (item.partyBName as string) ?? item.partyBOrganizationName ?? '',
        startTime: formatDate(startSource),
        endTime: formatDate(endSource),
        center: item.center ?? (item as RawProject).centerPoint ?? '',
        collect: item.collect,
    };
};

const tableData = ref<Project[]>([]);
const getData = async () => {
    const res = await fetchProjectPage({ page: page.index, rows: page.rows, name: query.name });
    const records = (res.data?.list ?? []) as RawProject[];
    tableData.value = records.map((item) => normalizeProject(item));
    page.total = res.data?.total ?? 0;
    try {
        const ids = tableData.value.map(r => r.id).filter(Boolean);
        if (ids.length) {
            const binds = await fetchInternalProjectBinds(ids);
            const list: InternalProjectBind[] = Array.isArray(binds?.data) ? binds.data : [];
            const nameMap = new Map<string, string>();
            list.forEach(item => {
                const key = toBindKey(item.projectId ?? item.bizProjectId);
                const nextName = item.name?.trim();
                if (!key || !nextName) return;
                const previous = nameMap.get(key);
                nameMap.set(key, previous ? `${previous}、${nextName}` : nextName);
            });
            tableData.value = tableData.value.map(r => {
                const key = toBindKey(r.id);
                return { ...r, externalProjectName: key ? nameMap.get(key) ?? '' : '' };
            });
        }
    } catch (e) {
        // ignore mapping errors
    }
};
getData();

const changePage = (val: number) => {
    page.index = val;
    getData();
};

const syncing = ref(false);
const handleSyncExternal = async () => {
    if (syncing.value) return;
    syncing.value = true;
    try {
        await syncExternalProjects();
        ElMessage.success('同步成功');
        getData();
    } catch (error) {
        const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : '');
        ElMessage.error(message || '同步失败');
    } finally {
        syncing.value = false;
    }
};

const bindDialog = reactive({
    visible: false,
    loading: false,
    list: [] as ExternalProject[],
    total: 0,
});
const bindQuery = reactive({
    page: 1,
    rows: 20,
    name: '',
});
const currentBindProject = ref<Project | null>(null);

const loadInternalProjects = async (resetPage = false) => {
    if (resetPage) bindQuery.page = 1;
    bindDialog.loading = true;
    try {
        const payload: ExternalProjectQuery = {
            page: bindQuery.page,
            rows: bindQuery.rows,
        };
        if (bindQuery.name.trim()) {
            payload.name = bindQuery.name.trim();
        }
        const res = await fetchInternalProjectList(payload);
        bindDialog.list = res.data?.list ?? [];
        bindDialog.total = res.data?.total ?? bindDialog.list.length;
        return true;
    } catch (error) {
        const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : '');
        ElMessage.error(message || '获取内外业项目列表失败');
        return false;
    } finally {
        bindDialog.loading = false;
    }
};

const handleBind = async (row: Project) => {
    currentBindProject.value = row;
    bindDialog.visible = true;
    bindQuery.page = 1;
    bindQuery.name = '';
    const success = await loadInternalProjects(true);
    if (!success) {
        bindDialog.visible = false;
    }
};

const handleBindSearch = async () => {
    await loadInternalProjects(true);
};

const handleSelectBind = async (item: ExternalProject) => {
    if (!currentBindProject.value) return;
    try {
        await insertBatchInternalBinding(String(currentBindProject.value.id), [String(item.id)]);
        ElMessage.success(`已关联项目 “${currentBindProject.value.name}” 与 “${item.name}”`);
        bindDialog.visible = false;
        // 可按需刷新外业项目绑定列
        await getData();
    } catch (error) {
        const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : '');
        ElMessage.error(message || '关联失败');
    }
};

const closeBindDialog = () => {
    bindDialog.visible = false;
    bindDialog.list = [];
    bindDialog.total = 0;
    bindQuery.name = '';
};

const handleSyncOrtho = async (row: Project) => {
    const projectId = (row.id ?? '').toString().trim();
    if (!projectId) {
        ElMessage.warning('缺少项目ID，无法同步正射');
        return;
    }
    try {
        await syncInternalOrthographic([projectId]);
        ElMessage.success('同步正射成功');
    } catch (error) {
        const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : '');
        ElMessage.error(message || '同步正射失败');
    }
};

const handleSyncVector = async (row: Project) => {
    const projectId = (row.id ?? '').toString().trim();
    if (!projectId) {
        ElMessage.warning('缺少项目ID，无法同步图斑');
        return;
    }
    try {
        await syncInternalFeatures([projectId]);
        ElMessage.success('同步图斑成功');
    } catch (error) {
        const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : '');
        ElMessage.error(message || '同步图斑失败');
    }
};

const handleDeleteOrtho = async (row: ExternalProject) => {
    const id = row.bizProjectId != null ? String(row.bizProjectId) : '';
    if (!id) return ElMessage.warning('缺少项目ID，无法删除正射');
    try {
        await deleteProjectOrthographic([id]);
        ElMessage.success('删除正射成功');
    } catch (error) {
        const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : '');
        ElMessage.error(message || '删除正射失败');
    }
};

const handleDeleteVector = async (row: ExternalProject) => {
    const id = row.bizProjectId != null ? String(row.bizProjectId) : '';
    if (!id) return ElMessage.warning('缺少项目ID，无法删除图斑');
    try {
        await deleteProjectFeatures({ id, ids: [id] });
        ElMessage.success('删除图斑成功');
    } catch (error) {
        const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : '');
        ElMessage.error(message || '删除图斑失败');
    }
};

// 新增/编辑弹窗相关
let options = ref<FormOption>({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'input', label: '项目名称', prop: 'name', required: true },
        { type: 'input', label: '甲方名称', prop: 'partyAName', required: true },
        { type: 'input', label: '乙方名称', prop: 'partyBName', required: true },
        { type: 'date', label: '开始时间', prop: 'startTime', required: true, format: 'YYYY-MM-DD' },
        { type: 'date', label: '结束时间', prop: 'endTime', required: true, format: 'YYYY-MM-DD' },
        { type: 'input', label: '中心点', prop: 'center', required: true, span: 24 },
    ],
});
const visible = ref(false);
const isEdit = ref(false);
const rowData = ref({});
const handleEdit = async (row: Project) => {
    const res = await getProject(row.id);
    const raw = res.data as Partial<RawProject> & Partial<Project>;
    rowData.value = {
        ...raw,
        partyAName: (raw.partyAName as string) ?? raw.partyAOrganizationName ?? '',
        partyBName: (raw.partyBName as string) ?? raw.partyBOrganizationName ?? '',
        startTime: raw.startTime ?? formatDate(raw.startDate),
        endTime: raw.endTime ?? formatDate(raw.endDate),
    };
    isEdit.value = true;
    visible.value = true;
};
const updateData = async (form: any) => {
    const payload = form;
    if (isEdit.value) {
        await updateProject(payload);
    } else {
        await saveProject(payload);
    }
    ElMessage.success('操作成功');
    closeDialog();
    getData();
};

const closeDialog = () => {
    visible.value = false;
    isEdit.value = false;
};

// 查看详情弹窗相关
const visible1 = ref(false);
const viewData = ref({
    row: {},
    list: [] as any[],
});
const handleView = async (row: Project) => {
    const res = await getProject(row.id);
    const raw = res.data as Partial<RawProject> & Partial<Project>;
    viewData.value.row = normalizeProject(raw);
    viewData.value.list = [
        { prop: 'id', label: '项目ID' },
        { prop: 'name', label: '项目名称' },
        { prop: 'partyAName', label: '甲方名称' },
        { prop: 'partyBName', label: '乙方名称' },
        { prop: 'startTime', label: '开始时间' },
        { prop: 'endTime', label: '结束时间' },
    ];
    visible1.value = true;
};

// 查询地块
const handleParcel = (row: Project) => {
    ElMessage.info(`查询地块：${row.id}`);
};

// 删除相关
const handleDelete = (row: Project) => {
    ElMessage.success('删除成功');
};
</script>

<style scoped>
.bind-dialog {
    display: flex;
    flex-direction: column;
}

.bind-dialog__search {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
}

.bind-dialog__search .el-input {
    max-width: 280px;
}

.bind-dialog__footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    color: #666;
}
</style>
