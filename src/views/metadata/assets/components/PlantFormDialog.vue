<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'add' ? '新增植物' : '编辑植物'"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="localFormData"
      :rules="formRules"
      label-width="120px"
    >
      <el-row :gutter="16">
        <!-- 植物名称 -->
        <el-col :span="12">
          <el-form-item label="植物名称" prop="name">
            <el-input
              v-model="localFormData.name"
              placeholder="请输入植物名称"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
        </el-col>

        <!-- 植物分类 -->
        <el-col :span="12">
          <el-form-item label="植物分类" prop="categoryId">
            <el-tree-select
              v-model="localFormData.categoryId"
              :data="categoryOptions"
              placeholder="请选择分类"
              check-strictly
              :render-after-expand="false"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <!-- 拉丁学名 -->
        <el-col :span="12">
          <el-form-item label="拉丁学名" prop="latinName">
            <el-input
              v-model="localFormData.latinName"
              placeholder="请输入拉丁学名"
              maxlength="100"
            />
          </el-form-item>
        </el-col>

        <!-- 英文名 -->
        <el-col :span="12">
          <el-form-item label="英文名" prop="englishName">
            <el-input
              v-model="localFormData.englishName"
              placeholder="请输入英文名"
              maxlength="100"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <!-- 中国植物志编码 -->
        <el-col :span="12">
          <el-form-item label="植物志编码" prop="chinaCode">
            <el-input
              v-model="localFormData.chinaCode"
              placeholder="请输入编码"
              maxlength="20"
            />
          </el-form-item>
        </el-col>

        <!-- 别名 -->
        <el-col :span="12">
          <el-form-item label="别名" prop="alias">
            <el-input
              v-model="localFormData.alias"
              placeholder="请输入别名"
              maxlength="100"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <!-- 是否常见植物 -->
        <el-col :span="12">
          <el-form-item label="是否常见" prop="commonFlag">
            <el-radio-group v-model="localFormData.commonFlag">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <!-- 状态 -->
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="localFormData.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 生物学分类 - 可折叠区域 -->
      <el-collapse v-model="activePanels" style="margin-top: 16px">
        <el-collapse-item title="生物学分类（选填）" name="biology">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="界" label-width="80px">
                <el-input v-model="localFormData.plantae" placeholder="如：植物界" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="门" label-width="80px">
                <el-input v-model="localFormData.phyta" placeholder="如：被子植物门" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="纲" label-width="80px">
                <el-input v-model="localFormData.subclass" placeholder="如：双子叶植物纲" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="目" label-width="80px">
                <el-input v-model="localFormData.subject" placeholder="如：樟目" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="科" label-width="80px">
                <el-input v-model="localFormData.family" placeholder="如：樟科" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="亚科" label-width="80px">
                <el-input v-model="localFormData.subfamily" placeholder="可选" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="族" label-width="80px">
                <el-input v-model="localFormData.clan" placeholder="可选" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="属" label-width="80px">
                <el-input v-model="localFormData.category" placeholder="如：樟属" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="种" label-width="80px">
                <el-input v-model="localFormData.kind" placeholder="如：樟" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>
      </el-collapse>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type {
  PlantCategory,
  PlantInsertRequest,
  PlantUpdateRequest
} from '@/types/metadata/plant'

interface Props {
  /** 对话框可见性 */
  visible: boolean
  /** 表单模式 */
  mode: 'add' | 'edit'
  /** 表单数据 */
  formData: PlantInsertRequest | PlantUpdateRequest
  /** 分类选项 */
  categoryOptions: PlantCategory[]
  /** 加载中 */
  loading?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', formData: PlantInsertRequest | PlantUpdateRequest): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// 本地表单数据
const localFormData = reactive<PlantInsertRequest | PlantUpdateRequest>({ ...props.formData })

// 折叠���板状态
const activePanels = ref<string[]>([])

// 监听外部 formData 变化，同步到本地
watch(
  () => props.formData,
  (newVal) => {
    Object.assign(localFormData, newVal)
  },
  { deep: true }
)

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入植物名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择植物分类', trigger: 'change' }
  ],
  latinName: [
    { max: 100, message: '长度不超过 100 个字符', trigger: 'blur' }
  ],
  englishName: [
    { max: 100, message: '长度不超过 100 个字符', trigger: 'blur' }
  ],
  chinaCode: [
    { max: 20, message: '长度不超过 20 个字符', trigger: 'blur' }
  ],
  alias: [
    { max: 100, message: '长度不超过 100 个字符', trigger: 'blur' }
  ]
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', localFormData)
    }
  })
}

/**
 * 关闭对话框
 */
const handleClose = () => {
  formRef.value?.resetFields()
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style scoped lang="scss">
// 样式可根据需要调整
</style>
