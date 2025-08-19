<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
            <TableCustom :columns="columns" :tableData="tableData" :total="page.total" :viewFunc="handleView"
                :delFunc="handleDelete" :page-change="changePage" :editFunc="handleEdit">
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="visible = true">新增</el-button>
                </template>
            </TableCustom>
        </div>
        <el-dialog :title="isEdit ? '编辑' : '新增'" v-model="visible" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData" />
        </el-dialog>
        <el-dialog title="查看详情" v-model="visible1" width="700px" destroy-on-close>
            <TableDetail :data="viewData"></TableDetail>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-org">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import { Organization } from '@/types/org';
import { fetchOrganizationPage, getOrganization, saveOrganization, updateOrganization } from '@/api/organization';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import TableEdit from '@/components/table-edit.vue';
import { FormOption, FormOptionList } from '@/types/form-option';

const typeOptions = [
    { label: '政府', value: '1' },
    { label: '企业', value: '2' },
];

// 查询相关
const query = reactive({
    name: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '组织名称：', prop: 'name' }
]);
const handleSearch = () => {
    changePage(1);
};

// 表格相关
let columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'name', label: '组织名称' },
    { prop: 'type', label: '组织类型', formatter: (val: string) => typeOptions.find(o => o.value === val)?.label || '' },
    { prop: 'province', label: '省' },
    { prop: 'city', label: '市' },
    { prop: 'county', label: '区' },
    { prop: 'address', label: '地址' },
    { prop: 'createdAt', label: '创建时间', formatter: (val: string) => val ? val.split('T')[0] : '' },
    { prop: 'operator', label: '操作', width: 250 },
]);
const page = reactive({
    index: 1,
    rows: 10,
    total: 0,
});
const tableData = ref<Organization[]>([]);
const getData = async () => {
    const res = await fetchOrganizationPage({ page: page.index, rows: page.rows, name: query.name });
    tableData.value = (res.data.records || []) as Organization[];
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
        { type: 'input', label: '组织名称', prop: 'name', required: true },
        {
            type: 'select',
            label: '组织类型',
            prop: 'type',
            required: true,
            opts: typeOptions,
        },
        { type: 'region', label: '省市区', prop: 'provinceId', required: true, span: 24 },
        { type: 'input', label: '地址', prop: 'address', required: true, span: 24 },
    ]
});
const visible = ref(false);
const isEdit = ref(false);
const rowData = ref({});
const handleEdit = async (row: Organization) => {
    const res = await getOrganization(row.id);
    const { createdAt, ...data } = res.data;
    rowData.value = data;
    isEdit.value = true;
    visible.value = true;
};
const updateData = async (form: any) => {
    const { createdAt, updatedAt, ...payload } = form;
    if (isEdit.value) {
        await updateOrganization(payload);
    } else {
        await saveOrganization(payload);
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
const handleView = async (row: Organization) => {
    const res = await getOrganization(row.id);
    viewData.value.row = {
        ...res.data,
        type: typeOptions.find(o => o.value === res.data.type)?.label || res.data.type,
        createdAt: res.data.createdAt ? res.data.createdAt.split('T')[0] : '',
    };
    viewData.value.list = [
        { prop: 'name', label: '组织名称' },
        { prop: 'type', label: '组织类型' },
        { prop: 'province', label: '省' },
        { prop: 'city', label: '市' },
        { prop: 'county', label: '区' },
        { prop: 'address', label: '地址' },
        { prop: 'createdAt', label: '创建时间' },
    ];
    visible1.value = true;
};

// 删除相关
const handleDelete = (row: Organization) => {
    ElMessage.success('删除成功');
};
</script>

<style scoped></style>
