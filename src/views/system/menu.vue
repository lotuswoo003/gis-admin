<template>
    <div>
        <div class="container">
            <TableCustom :columns="columns" :tableData="permissionData" row-key="id" :has-pagination="false"
                :viewFunc="handleView" :delFunc="handleDelete" :editFunc="handleEdit">
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="visible = true">新增</el-button>
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
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import { FormOption } from '@/types/form-option';
import { listPermissions } from '@/api/permission';
import type { Permission } from '@/types/permission';

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

const getOptions = (data: Permission[]): any[] => {
    return data.map(item => {
        const option: any = {
            label: item.name,
            value: item.id,
        };
        if (item.children && item.children.length) {
            option.children = getOptions(item.children);
        }
        return option;
    });
};

const buildParentName = (items: Permission[], parent?: Permission) => {
    items.forEach(item => {
        item.parentName = parent ? parent.name : '';
        if (item.children && item.children.length) {
            buildParentName(item.children, item);
        }
    });
};

const cascaderOptions = ref<any[]>([]);

const loadData = async () => {
    const res = await listPermissions({});
    const data: Permission[] = res.data || [];
    buildParentName(data);
    permissionData.value = data;
    cascaderOptions.value = getOptions(data);
};

onMounted(loadData);

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
const handleEdit = (row: Permission) => {
    rowData.value = { ...row };
    isEdit.value = true;
    visible.value = true;
};
const updateData = () => {
    closeDialog();
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
const handleView = (row: Permission) => {
    viewData.value.row = { ...row };
    viewData.value.list = [
        {
            prop: 'id',
            label: '菜单ID',
        },
        {
            prop: 'parentName',
            label: '父节点',
        },
        {
            prop: 'name',
            label: '菜单名称',
        },
        {
            prop: 'code',
            label: '权限编码',
        },
        {
            prop: 'path',
            label: '路径',
        },
        {
            prop: 'disableFlag',
            label: '是否禁用',
            value: row.disableFlag ? '是' : '否',
        },
    ];
    visible1.value = true;
};

// 删除相关
const handleDelete = (row: Permission) => {
    ElMessage.success('删除成功');
}
</script>

<style scoped></style>