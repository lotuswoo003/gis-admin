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
        <el-dialog :title="isEdit ? '编辑' : '新增'" v-model="visible" width="800px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <el-form :model="form" label-width="100px">
                <el-form-item label="字典名称" prop="dict_name">
                    <el-input v-model="form.dict_name" />
                </el-form-item>
                <el-form-item label="字典类型" prop="dict_type">
                    <el-input v-model="form.dict_type" />
                </el-form-item>
                <el-form-item label="所属应用" prop="app_code">
                    <el-input v-model="form.app_code" />
                </el-form-item>
                <el-form-item label="字典值">
                    <el-button type="primary" size="small" @click="addValue">新增值</el-button>
                    <el-table :data="form.values" style="width: 100%; margin-top: 10px;">
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
                <template #values="{ rows }">
                    <el-table :data="rows.values" style="width: 100%">
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
import { fetchDictData } from '@/api';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import { FormOptionList } from '@/types/form-option';
import { DictItem, DictValue } from '@/types/dict';

// 查询相关
const query = reactive({
    dict_name: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '字典名称：', prop: 'dict_name' }
]);
const handleSearch = () => {
    changePage(1);
};

// 表格相关
let columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'dict_name', label: '字典名称' },
    { prop: 'dict_type', label: '字典类型' },
    { prop: 'app_code', label: '所属应用' },
    { prop: 'operator', label: '操作', width: 250 },
]);
const page = reactive({
    index: 1,
    size: 10,
    total: 0,
});
const tableData = ref<DictItem[]>([]);
const getData = async () => {
    const res = await fetchDictData();
    let list: DictItem[] = res.data.list;
    if (query.dict_name) {
        list = list.filter(item => item.dict_name.includes(query.dict_name));
    }
    page.total = list.length;
    const start = (page.index - 1) * page.size;
    tableData.value = list.slice(start, start + page.size);
};
getData();

const changePage = (val: number) => {
    page.index = val;
    getData();
};

// 新增/编辑相关
const visible = ref(false);
const isEdit = ref(false);
const form = reactive<DictItem>({
    id: 0,
    dict_name: '',
    dict_type: '',
    app_code: '',
    values: []
});

const openAdd = () => {
    form.id = Date.now();
    form.dict_name = '';
    form.dict_type = '';
    form.app_code = '';
    form.values = [];
    isEdit.value = false;
    visible.value = true;
};

const handleEdit = (row: DictItem) => {
    Object.assign(form, JSON.parse(JSON.stringify(row)));
    isEdit.value = true;
    visible.value = true;
};

const addValue = () => {
    form.values.push({ id: Date.now(), label: '', dict_type: form.dict_type, value: '', description: '', sort: 0 });
};

const removeValue = (index: number) => {
    form.values.splice(index, 1);
};

const saveData = () => {
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

const handleView = (row: DictItem) => {
    viewData.value.row = { ...row };
    viewData.value.list = [
        { prop: 'dict_name', label: '字典名称' },
        { prop: 'dict_type', label: '字典类型' },
        { prop: 'app_code', label: '所属应用' },
        { prop: 'values', label: '字典值' },
    ];
    visible1.value = true;
};

// 删除
const handleDelete = (row: DictItem) => {
    ElMessage.success('删除成功');
};
</script>

<style scoped></style>
