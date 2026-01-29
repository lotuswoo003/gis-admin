<template>
  <div class="pool-layout" @contextmenu.prevent>
    <div class="left-panel" :class="{ collapsed }" :style="{ width: collapsed ? '18px' : '570px' }">
      <div class="collapse-handle" @click="collapsed = !collapsed">
        <span>{{ collapsed ? '>' : '<' }}</span>
      </div>
      <div v-show="!collapsed">
      <div class="title">资源池管理</div>
      <TableSearch :query="query" :options="searchOpt" :search="handleSearch" />
      <div class="list-toolbar">
        <el-button size="small" type="primary" :icon="Upload" @click="onImport">导入</el-button>
      </div>
      <TableCustom
        ref="tableRef"
        :columns="columns"
        :tableData="tableData"
        :total="page.total"
        :current-page="page.index"
        :page-size="page.rows"
        :change-page="changePage"
        :hide-on-single-page="true"
        max-height="calc(100vh - 350px)"
      >
        <template #operator="{ rows }">
          <el-button type="primary" size="small" @click="onLocate(rows)">定位</el-button>
          <el-button type="warning" size="small" @click="onSync(rows)">同步</el-button>
          <el-button type="danger" size="small" @click="onDelete(rows)">删除</el-button>
        </template>
      </TableCustom>
      </div>
    </div>
    <div class="right-panel">
      <Map
        ref="mapRef"
        :polygons="tableData"
        @polygon-click="onPolygonClick"
        @polygon-dblclick="onPolygonDblClick"
        @right-click="onRightClick"
        @selection-change="onSelectionChange"
        @map-ready="onMapReady"
      />
      <ContextMenu
        ref="contextMenuRef"
        :items="contextMenuItems"
        :commandMap="commandMap"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { Upload } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { fetchResourcePoolPage, deleteResourcePool, importResourcePoolShp } from '@/api/resource-pool';
import type { GisResourcePool, ResourcePoolPageRequest } from '@/types/resource-pool';
import TableSearch from '@/components/table-search.vue';
import TableCustom from '@/components/table-custom.vue';
import Map from '@/components/Map.vue';
import ContextMenu from '@/components/context-menu/index.vue';
import { useResourcePoolContextMenu, commandMap } from './context-menu-items';
import type { FormOptionList } from '@/types/form-option';

const query = reactive({ keyword: '' });
const searchOpt = ref<FormOptionList[]>([
  { type: 'input', label: '名称：', prop: 'keyword', placeholder: '输入名称关键词', inputStyle: { width: '160px' } },
]);

const handleSearch = () => { page.index = 1; loadData(); };

const columns = ref([
  { type: 'index', label: '序号', width: 60, align: 'center' },
  { prop: 'name', label: '地块名称' },
  { prop: 'operator', label: '操作', width: 260 },
]);

const page = reactive({ index: 1, rows: 10000, total: 0 });
type Row = GisResourcePool;
const tableData = ref<Row[]>([]);
const collapsed = ref(false);
const route = useRoute();
const organizationId = ref<string>('');
const mapRef = ref<InstanceType<typeof Map>>();
const tableRef = ref<InstanceType<typeof TableCustom>>();
const contextMenuRef = ref<InstanceType<typeof ContextMenu>>();

// 使用组合式函数
const { rightClickContext, selectedCount, menuActions, contextMenuItems } = useResourcePoolContextMenu({
  get organizationId() {
    return organizationId.value;
  },
  onRefresh: () => loadData()
});

const loadData = async () => {
  const payload: ResourcePoolPageRequest = {
    page: page.index,
    rows: page.rows,
    name: (query.keyword || ''),
    organizationId: organizationId.value || undefined,
  };
  try {
    const res = await fetchResourcePoolPage(payload);
    page.total = res.data?.total || 0;
    tableData.value = (res.data?.list || []) as Row[];
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败');
  }
};
onMounted(() => {
  const oid = route.query.organizationId as string | undefined;
  organizationId.value = oid || '';

  loadData();

  // 注册右键菜单操作回调
  menuActions.onLocate = (data) => onPolygonDblClick(data);
  menuActions.onRename = (data) => handleRename(data);
  menuActions.onSync = (data) => onSync(data);
  menuActions.onDelete = (data) => onDelete(data);
});

const changePage = (val: number) => { page.index = val; loadData(); };

const onLocate = (row: Row) => {
  if (!row.id || !mapRef.value) {
    ElMessage.warning('地图未加载完成');
    return;
  }
  mapRef.value.locatePolygon(row.id);
  ElMessage.success(`正在定位到: ${row.name}`);
};

const onSync = (_row: Row) => {
  // 同步：后续对接后端同步接口
  ElMessage.info('同步功能待实现');
};

const onPolygonClick = (_data: GisResourcePool) => {
  // TODO: 处理多边形点击事件
};

const onPolygonDblClick = (data: GisResourcePool) => {
  if (!data.id || !tableRef.value) return;

  // 选中表格中对应的行并滚动到该行
  tableRef.value.selectRowById(data.id);

  // 如果左侧面板是折叠状态，展开它
  if (collapsed.value) {
    collapsed.value = false;
  }
};

const onSelectionChange = (data: any[]) => {
  selectedCount.value = data.length;
};

const onRightClick = (event: any) => {
  if (!contextMenuRef.value) return;

  // 更新右键上下文状态
  rightClickContext.value = event.data;

  // 显示右键菜单
  contextMenuRef.value.show(event.x, event.y, event);
};

const onMapReady = () => {
  console.log('地图加载完成');
};


// 地块命名
const handleRename = async (data: GisResourcePool) => {
  try {
    const { value: newName } = await ElMessageBox.prompt('请输入新的地块名称', '地块命名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: data.name || '',
      inputPattern: /.+/,
      inputErrorMessage: '名称不能为空',
    });

    if (newName && data.id) {
      // TODO: 调用API更新地块名称
      ElMessage.success(`地块 "${data.name}" 已重命名为 "${newName}"`);
      console.log('重命名:', { id: data.id, oldName: data.name, newName });
      loadData(); // 重新加载数据
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重命名失败:', error);
    }
  }
};

const onDelete = async (row: Row) => {
  if (!row.id) return;
  await ElMessageBox.confirm('确认删除该地块吗？', '提示', { type: 'warning' });
  try {
    await deleteResourcePool(row.id);
    ElMessage.success('删除成功');
    loadData();
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败');
  }
};

const onImport = () => {
  // 导入：调用后端上传SHP接口
  if (!organizationId.value) { ElMessage.warning('缺少组织ID，无法导入'); return; }
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.zip';
  input.onchange = async () => {
    const file = (input.files && input.files[0]) as File;
    if (!file) return;
    try {
      await importResourcePoolShp(organizationId.value, file);
      ElMessage.success('导入成功');
      loadData();
    } catch (e: any) {
      ElMessage.error(e?.message || '导入失败');
    }
  };
  input.click();
};
</script>

<style scoped>
.pool-layout { display: flex; height: calc(100vh - 140px); }
.left-panel { position: relative; min-width: 18px; background: #fff; border-right: 1px solid #e8e8e8; padding: 12px; box-sizing: border-box; transition: width .2s ease; }
.left-panel.collapsed { padding: 0; }
.collapse-handle { position: absolute; top: 50%; right: -10px; transform: translateY(-50%); width: 20px; height: 40px; background: #fff; border: 1px solid #e8e8e8; border-left: none; border-radius: 0 6px 6px 0; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.left-panel .title { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.list-toolbar { margin: 6px 0 8px; }
.right-panel { flex: 1; background: #f7f8fa; position: relative; overflow: hidden; }
</style>
