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
            width="800px"
            destroy-on-close
            @close="closeBindDialog"
        >
            <div class="bind-dialog">
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
                    <el-table-column prop="updateTime" label="更新时间" width="200">
                        <template #default="{ row }">
                            {{ formatDate(row.updateTime) || '-' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120">
                        <template #default="{ row }">
                            <el-button type="primary" size="small" @click="handleSelectBind(row)">选择</el-button>
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
import { CirclePlusFilled, Edit, Search, Refresh, Link, VideoCameraFilled, MapLocation } from '@element-plus/icons-vue';
import type { Project, RawProject, ExternalProject } from '@/types/project';
import { fetchProjectPage, getProject, saveProject, updateProject, syncExternalProjects, fetchInternalProjectList } from '@/api/project';
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
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'id', label: '项目ID', width: 160 },
    { prop: 'name', label: '项目名称' },
    { prop: 'partyAName', label: '甲方名称' },
    { prop: 'partyBName', label: '乙方名称' },
    { prop: 'startTime', label: '开始时间' },
    { prop: 'endTime', label: '结束时间' },
    { prop: 'operator', label: '操作', width: 340 },
]);
const page = reactive({
    index: 1,
    rows: 10,
    total: 0,
});
const formatDate = (value?: string | null) => (value ? dayjs(value).format('YYYY-MM-DD') : '');

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
    const records = (res.data?.records ?? []) as RawProject[];
    tableData.value = records.map((item) => normalizeProject(item));
    page.total = res.data?.total ?? 0;
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
const currentBindProject = ref<Project | null>(null);

const handleBind = async (row: Project) => {
    currentBindProject.value = row;
    bindDialog.visible = true;
    bindDialog.loading = true;
    try {
        const res = await fetchInternalProjectList();
        bindDialog.list = res.data?.list ?? [];
        bindDialog.total = res.data?.total ?? bindDialog.list.length;
    } catch (error) {
        const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : '');
        ElMessage.error(message || '获取内外业项目列表失败');
        bindDialog.visible = false;
    } finally {
        bindDialog.loading = false;
    }
};

const handleSelectBind = (item: ExternalProject) => {
    bindDialog.visible = false;
    if (!currentBindProject.value) return;
    ElMessage.success(`已关联项目 “${currentBindProject.value.name}” 与 “${item.name}”`);
};

const closeBindDialog = () => {
    bindDialog.visible = false;
    bindDialog.list = [];
    bindDialog.total = 0;
};

const handleSyncOrtho = (row: Project) => {
    void row;
    ElMessage.info('同步正射功能开发中');
};

const handleSyncVector = (row: Project) => {
    void row;
    ElMessage.info('同步图斑功能开发中');
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

.bind-dialog__footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    color: #666;
}
</style>
