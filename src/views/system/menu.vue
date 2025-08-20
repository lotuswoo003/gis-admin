<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
        <div class="container">
            <TableCustom
                :columns="columns"
                :tableData="permissionData"
                row-key="id"
                :total="page.total"
                :current-page="page.index"
                :page-size="page.rows"
                :delFunc="handleDelete"
                :editFunc="handleEdit"
                :change-page="changePage"
            >
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="openAdd">新增</el-button>
                </template>
                <template #operator="{ rows }">
                    <el-button type="primary" size="small" :icon="Edit" @click="handleEdit(rows)">编辑</el-button>
                    <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(rows)">删除</el-button>
                </template>
            </TableCustom>
        </div>
        <el-dialog :title="isEdit ? '编辑' : '新增'" v-model="visible" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="updateData">
                <template #parentId>
                    <el-cascader v-model="rowData.parentId" :options="cascaderOptions" :props="{ checkStrictly: true }"
                        clearable />
                </template>
            </TableEdit>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-menu">
import { onMounted, ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled, Edit, Delete } from '@element-plus/icons-vue';
import TableCustom from '@/components/table-custom.vue';
import TableSearch from '@/components/table-search.vue';
import { FormOption, FormOptionList } from '@/types/form-option';
import { listPermissions, fetchPermissionPage, getPermission, createPermission, updatePermission, deletePermission } from '@/api/permission';
import type { Permission, PermissionCreateRequest, PermissionUpdateRequest } from '@/types/permission';

// 表格相关
let columns = ref([
    { prop: 'name', label: '菜单名称', align: 'left' },
    { prop: 'code', label: '权限编码' },
    { prop: 'parentName', label: '父节点' },
    { prop: 'type', label: '类型', formatter: (val: string) => (val === '1' ? '菜单' : '按钮') },
    { prop: 'disableFlag', label: '是否禁用', formatter: (val: number) => (val ? '是' : '否') },
    { prop: 'path', label: '路径' },
    { prop: 'operator', label: '操作', width: 200 },
])

const permissionData = ref<Permission[]>([]);
const page = reactive({
    index: 1,
    rows: 10,
    total: 0,
});

// 查询相关
const query = reactive({
    name: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '菜单名称：', prop: 'name' },
]);
const handleSearch = () => {
    page.index = 1;
    loadData();
};

const parentMap = new Map<string, string>();
const getOptions = (data: Permission[] | undefined | null): any[] => {
    if (!Array.isArray(data)) return [];
    return data.map(item => {
        parentMap.set(item.id, item.name);
        const option: any = {
            label: item.name,
            value: item.id,
        };
        if (Array.isArray(item.children) && item.children.length) {
            option.children = getOptions(item.children);
        }
        return option;
    });
};

const cascaderOptions = ref<any[]>([]);

const loadData = async () => {
    parentMap.clear();
    const treeRes = await listPermissions({});
    const treeData: Permission[] = treeRes.data || [];
    cascaderOptions.value = getOptions(treeData);

    const pageRes = await fetchPermissionPage({ page: page.index, rows: page.rows, name: query.name });
    const list: Permission[] = pageRes.data.records || [];
    list.forEach(item => {
        item.parentName = parentMap.get(item.parentId) || '';
    });
    permissionData.value = list;
    page.total = pageRes.data.total || 0;
};

onMounted(loadData);

const changePage = (val: number) => {
    page.index = val;
    loadData();
};

// 新增/编辑弹窗相关
let options = ref<FormOption>({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'input', label: '菜单名称', prop: 'name', required: true },
        { type: 'input', label: '权限编码', prop: 'code', required: true },
        { type: 'input', label: '路径', prop: 'path', required: true },
        { type: 'parent', label: '父节点', prop: 'parentId' },
        {
            type: 'switch',
            label: '是否禁用',
            prop: 'disableFlag',
            activeValue: 1,
            inactiveValue: 0,
            activeText: '禁用',
            inactiveText: '启用'
        },
    ]
})
const visible = ref(false);
const isEdit = ref(false);
const rowData = ref<Permission>({} as Permission);
const openAdd = () => {
    rowData.value = {} as Permission;
    isEdit.value = false;
    visible.value = true;
};
const handleEdit = async (row: Permission) => {
    const res = await getPermission(row.id);
    rowData.value = res.data;
    isEdit.value = true;
    visible.value = true;
};
const updateData = async (form: Permission) => {
    const payload: Permission = {
        ...form,
        parentId: Array.isArray(rowData.value.parentId)
            ? (rowData.value.parentId as any[])[rowData.value.parentId.length - 1]
            : rowData.value.parentId,
    } as Permission;
    if (isEdit.value) {
        await updatePermission(payload as PermissionUpdateRequest);
    } else {
        await createPermission(payload as PermissionCreateRequest);
    }
    ElMessage.success('操作成功');
    closeDialog();
    loadData();
};

const closeDialog = () => {
    visible.value = false;
    isEdit.value = false;
};

// 删除相关
const handleDelete = async (row: Permission) => {
    await deletePermission(row.id);
    ElMessage.success('删除成功');
    loadData();
}
</script>

<style scoped></style>
