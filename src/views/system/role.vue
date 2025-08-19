<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
            <TableCustom
                :columns="columns"
                :tableData="tableData"
                :total="page.total"
                :current-page="page.index"
                :page-size="page.rows"
                :viewFunc="handleView"
                :delFunc="handleDelete"
                :editFunc="handleEdit"
                :change-page="changePage"
            >
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="openAdd">新增</el-button>
                </template>
                <template #permissions="{ rows }">
                    <el-button type="primary" size="small" plain @click="handlePermission(rows)">管理</el-button>
                </template>
            </TableCustom>
        </div>
        <el-dialog :title="isEdit ? '编辑' : '新增'" v-model="visible" width="700px" destroy-on-close :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData" />
        </el-dialog>
        <el-dialog title="查看详情" v-model="visible1" width="700px" destroy-on-close>
            <TableDetail :data="viewData" />
        </el-dialog>
        <el-dialog title="权限管理" v-model="visible2" width="500px" destroy-on-close>
            <RolePermission :role-id="currentRoleId" />
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-role">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableEdit from '@/components/table-edit.vue';
import TableSearch from '@/components/table-search.vue';
import RolePermission from './role-permission.vue';
import type { FormOption, FormOptionList } from '@/types/form-option';
import type { Role } from '@/types/role';
import { fetchRolePage, getRole, createRole, updateRole, deleteRole } from '@/api/role';

const query = reactive({
    name: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '角色名称：', prop: 'name' }
]);
const handleSearch = () => {
    changePage(1);
};

let columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'name', label: '角色名称' },
    { prop: 'description', label: '描述' },
    { prop: 'type', label: '类型' },
    { prop: 'orgId', label: '组织ID' },
    { prop: 'permissions', label: '权限管理' },
    { prop: 'operator', label: '操作', width: 250 },
]);

const page = reactive({
    index: 1,
    rows: 10,
    total: 0,
});
const tableData = ref<Role[]>([]);

const loadData = async () => {
    const res = await fetchRolePage({ page: page.index, rows: page.rows, name: query.name });
    tableData.value = res.data.records || [];
    page.total = res.data.total || 0;
};

onMounted(loadData);

const changePage = (val: number) => {
    page.index = val;
    loadData();
};

const options = ref<FormOption>({
    labelWidth: '100px',
    span: 24,
    list: [
        { type: 'input', label: '角色名称', prop: 'name', required: true },
        { type: 'input', label: '描述', prop: 'description' },
        { type: 'input', label: '类型', prop: 'type' },
        { type: 'input', label: '组织ID', prop: 'orgId' },
    ]
});

const visible = ref(false);
const isEdit = ref(false);
const rowData = ref<Role>({} as Role);

const openAdd = () => {
    rowData.value = {} as Role;
    isEdit.value = false;
    visible.value = true;
};

const handleEdit = async (row: Role) => {
    const res = await getRole(row.id);
    rowData.value = res.data;
    isEdit.value = true;
    visible.value = true;
};

const updateData = async (form: Role) => {
    if (isEdit.value) {
        await updateRole(form);
    } else {
        await createRole(form);
    }
    ElMessage.success('操作成功');
    closeDialog();
    loadData();
};

const closeDialog = () => {
    visible.value = false;
    isEdit.value = false;
};

const visible1 = ref(false);
const viewData = ref({ row: {}, list: [] as any[] });
const handleView = async (row: Role) => {
    const res = await getRole(row.id);
    viewData.value.row = res.data;
    viewData.value.list = [
        { prop: 'id', label: '角色ID' },
        { prop: 'name', label: '角色名称' },
        { prop: 'description', label: '描述' },
        { prop: 'type', label: '类型' },
        { prop: 'orgId', label: '组织ID' },
    ];
    visible1.value = true;
};

const handleDelete = async (row: Role) => {
    await deleteRole(row.id);
    ElMessage.success('删除成功');
    loadData();
};

const visible2 = ref(false);
const currentRoleId = ref('');
const handlePermission = (row: Role) => {
    currentRoleId.value = row.id;
    visible2.value = true;
};
</script>

<style scoped></style>
