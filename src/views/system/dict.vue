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
                :editFunc="handleEdit"
                :page-change="changePage"
            >
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="openAdd">新增</el-button>
                </template>
            </TableCustom>
        </div>
        <el-dialog
            :title="isEdit ? '编辑' : '新增'"
            v-model="visible"
            width="800px"
            destroy-on-close
            :close-on-click-modal="false"
            @close="closeDialog"
        >
            <el-form :model="form" label-width="100px">
                <el-form-item label="字典名称" prop="dictName">
                    <el-input v-model="form.dictName" />
                </el-form-item>
                <el-form-item label="字典类型" prop="dictType">
                    <el-input v-model="form.dictType" />
                </el-form-item>
                <el-form-item label="所属应用" prop="appCode">
                    <el-input v-model="form.appCode" />
                </el-form-item>
                <el-form-item label="字典值">
                    <el-button type="primary" size="small" @click="addValue">新增值</el-button>
                    <el-table :data="form.dataList" style="width: 100%; margin-top: 10px;">
                        <el-table-column prop="label" label="标签">
                            <template #default="scope">
                                <el-input v-model="scope.row.label" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="value" label="值">
                            <template #default="scope">
                                <el-input v-model="scope.row.value" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="description" label="描述">
                            <template #default="scope">
                                <el-input v-model="scope.row.description" />
                            </template>
                        </el-table-column>
                        <el-table-column prop="sort" label="排序" width="80">
                            <template #default="scope">
                                <el-input-number v-model="scope.row.sort" :min="0" />
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80">
                            <template #default="scope">
                                <el-button type="text" @click="removeValue(scope.$index)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="saveData">保 存</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="查看详情" v-model="visible1" width="700px" destroy-on-close>
            <TableDetail :data="viewData">
                <template #dataList="{ rows }">
                    <el-table :data="rows.dataList" style="width: 100%">
                        <el-table-column prop="label" label="标签" />
                        <el-table-column prop="value" label="值" />
                        <el-table-column prop="description" label="描述" />
                        <el-table-column prop="sort" label="排序" />
                    </el-table>
                </template>
            </TableDetail>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-dict">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import { listDict, getDict, createDict, updateDict, deleteDict } from '@/api/dict';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import { FormOptionList } from '@/types/form-option';
import type { DictType } from '@/types/dict';

// 查询相关
const query = reactive({
    dictName: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '字典名称：', prop: 'dictName' }
]);
const handleSearch = () => {
    changePage(1);
};

// 表格相关
let columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'dictName', label: '字典名称' },
    { prop: 'dictType', label: '字典类型' },
    { prop: 'appCode', label: '所属应用' },
    { prop: 'operator', label: '操作', width: 250 },
]);
const page = reactive({
    index: 1,
    rows: 10,
    total: 0,
});
const tableData = ref<DictType[]>([]);
const getData = async () => {
    const res = await listDict();
    let list: DictType[] = res.data.data || [];
    if (query.dictName) {
        list = list.filter(item => item.dictName.includes(query.dictName));
    }
    page.total = list.length;
    const start = (page.index - 1) * page.rows;
    tableData.value = list.slice(start, start + page.rows);
};
getData();

const changePage = (val: number) => {
    page.index = val;
    getData();
};

// 新增/编辑相关
const visible = ref(false);
const isEdit = ref(false);
const form = reactive<DictType>({
    id: '',
    dictName: '',
    dictType: '',
    appCode: '',
    dataList: [],
});

const openAdd = () => {
    form.id = '';
    form.dictName = '';
    form.dictType = '';
    form.appCode = '';
    form.dataList = [];
    isEdit.value = false;
    visible.value = true;
};

const handleEdit = async (row: DictType) => {
    const res = await getDict(row.id!);
    Object.assign(form, res.data);
    isEdit.value = true;
    visible.value = true;
};

const addValue = () => {
    (form.dataList || []).push({ label: '', value: '', description: '', sort: 0 });
};

const removeValue = (index: number) => {
    form.dataList?.splice(index, 1);
};

const saveData = async () => {
    if (isEdit.value && form.id) {
        await updateDict(form.id, form);
    } else {
        await createDict(form);
    }
    ElMessage.success('操作成功');
    closeDialog();
    getData();
};

const closeDialog = () => {
    visible.value = false;
    isEdit.value = false;
};

// 查看详情
const visible1 = ref(false);
const viewData = ref({
    row: {},
    list: [] as any[],
});

const handleView = async (row: DictType) => {
    const res = await getDict(row.id!);
    viewData.value.row = { ...res.data };
    viewData.value.list = [
        { prop: 'dictName', label: '字典名称' },
        { prop: 'dictType', label: '字典类型' },
        { prop: 'appCode', label: '所属应用' },
        { prop: 'dataList', label: '字典值' },
    ];
    visible1.value = true;
};

// 删除
const handleDelete = async (row: DictType) => {
    await deleteDict(row.id!);
    ElMessage.success('删除成功');
    getData();
};
</script>

<style scoped></style>
