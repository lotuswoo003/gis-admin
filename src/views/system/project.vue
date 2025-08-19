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
                    <el-button type="warning" :icon="CirclePlusFilled" @click="visible = true">新增</el-button>
                </template>
                <template #operator="{ rows }">
                    <el-button type="success" size="small" :icon="Search" @click="handleParcel(rows)">
                        查询地块
                    </el-button>
                    <el-button type="warning" size="small" :icon="View" @click="handleView(rows)">
                        查看
                    </el-button>
                    <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(rows)">
                        编辑
                    </el-button>
                    <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(rows)">
                        删除
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
    </div>
</template>

<script setup lang="ts" name="system-project">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled, View, Edit, Delete, Search } from '@element-plus/icons-vue';
import { Project } from '@/types/project';
import { fetchProjectPage, getProject, saveProject, updateProject } from '@/api/project';
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
    { prop: 'id', label: '项目ID' },
    { prop: 'name', label: '项目名称' },
    { prop: 'partyAName', label: '甲方名称' },
    { prop: 'partyBName', label: '乙方名称' },
    { prop: 'startTime', label: '开始时间' },
    { prop: 'endTime', label: '结束时间' },
    { prop: 'center', label: '中心点' },
    { prop: 'operator', label: '操作', width: 300 },
]);
const page = reactive({
    index: 1,
    rows: 10,
    total: 0,
});
const tableData = ref<Project[]>([]);
const getData = async () => {
    const res = await fetchProjectPage({ page: page.index, rows: page.rows, name: query.name });
    tableData.value = (res.data.records || []) as Project[];
    page.total = res.data.total || 0;
};
getData();

const changePage = (val: number) => {
    page.index = val;
    getData();
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
    rowData.value = res.data;
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
    viewData.value.row = res.data;
    viewData.value.list = [
        { prop: 'id', label: '项目ID' },
        { prop: 'name', label: '项目名称' },
        { prop: 'partyAName', label: '甲方名称' },
        { prop: 'partyBName', label: '乙方名称' },
        { prop: 'startTime', label: '开始时间' },
        { prop: 'endTime', label: '结束时间' },
        { prop: 'center', label: '中心点' },
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

<style scoped></style>
