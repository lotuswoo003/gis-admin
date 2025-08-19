<template>
    <div>
        <div class="container">
            <TableCustom
                :columns="columns"
                :tableData="permissionData"
                row-key="id"
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
        <el-dialog title="查看详情" v-model="visible1" width="700px" destroy-on-close>
            <TableDetail :data="viewData">
            </TableDetail>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-menu">
import { onMounted, ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import { FormOption } from '@/types/form-option';
import { listPermissions, fetchPermissionPage, getPermission, createPermission, updatePermission, deletePermission } from '@/api/permission';
import type { Permission, PermissionCreateRequest, PermissionUpdateRequest } from '@/types/permission';

// 表格相关
let columns = ref([
    { prop: 'name', label: '菜单名称', align: 'left' },
    { prop: 'code', label: '权限编码' },
    { prop: 'parentName', label: '父节点' },
    { prop: 'disableFlag', label: '是否禁用', formatter: (val: number) => (val ? '是' : '否') },
    { prop: 'path', label: '路径' },
    { prop: 'operator', label: '操作', width: 250 },
])

const permissionData = ref<Permission[]>([]);
const page = reactive({
    index: 1,
    rows: 10,
    total: 0,
});

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

    const pageRes = await fetchPermissionPage({ page: page.index, rows: page.rows });
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

// 查看详情弹窗相关
const visible1 = ref(false);
const viewData = ref({
    row: {},
    list: [] as any[],
});
const handleView = async (row: Permission) => {
    const res = await getPermission(row.id);
    viewData.value.row = { ...res.data, parentName: row.parentName };
    viewData.value.list = [
        { prop: 'id', label: '菜单ID' },
        { prop: 'parentName', label: '父节点' },
        { prop: 'name', label: '菜单名称' },
        { prop: 'code', label: '权限编码' },
        { prop: 'path', label: '路径' },
        { prop: 'disableFlag', label: '是否禁用', value: res.data.disableFlag ? '是' : '否' },
    ];
    visible1.value = true;
};

// 删除相关
const handleDelete = async (row: Permission) => {
    await deletePermission(row.id);
    ElMessage.success('删除成功');
    loadData();
}
</script>

<style scoped></style>
