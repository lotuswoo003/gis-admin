<template>
  <div class="region-cascader">
    <el-select v-model="provinceId" placeholder="请选择省" @change="onProvinceChange" class="select">
      <el-option
        v-for="item in provinces"
        :key="item.id"
        :label="item.displayName"
        :value="item.id"
      />
    </el-select>
    <el-select v-model="cityId" placeholder="请选择市" :disabled="!provinceId" @change="onCityChange" class="select">
      <el-option
        v-for="item in cities"
        :key="item.id"
        :label="item.displayName"
        :value="item.id"
      />
    </el-select>
    <el-select v-model="districtId" placeholder="请选择区" :disabled="!cityId" class="select">
      <el-option
        v-for="item in districts"
        :key="item.id"
        :label="item.displayName"
        :value="item.id"
      />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import type { PostalCode } from '@/types/postal-code';
import { fetchPostalCodeList } from '@/api/postal-code';

interface RegionModel {
  provinceId?: number;
  cityId?: number;
  districtId?: number;
}

const props = defineProps<{ modelValue?: RegionModel }>();

const provinces = ref<PostalCode[]>([]);
const cities = ref<PostalCode[]>([]);
const districts = ref<PostalCode[]>([]);

const provinceId = ref<number | null>(null);
const cityId = ref<number | null>(null);
const districtId = ref<number | null>(null);

const emit = defineEmits(['change']);

onMounted(async () => {
  const res = await fetchPostalCodeList({ level: 1, parentId: -1 });
  provinces.value = res.data;
  if (props.modelValue?.provinceId) {
    provinceId.value = props.modelValue.provinceId;
    await onProvinceChange(props.modelValue.provinceId);
    if (props.modelValue.cityId) {
      cityId.value = props.modelValue.cityId;
      await onCityChange(props.modelValue.cityId);
      if (props.modelValue.districtId) {
        districtId.value = props.modelValue.districtId;
      }
    }
  }
});

const onProvinceChange = async (val: number) => {
  cityId.value = null;
  districtId.value = null;
  cities.value = [];
  districts.value = [];
  const res = await fetchPostalCodeList({ level: 2, parentId: val });
  cities.value = res.data;
};

const onCityChange = async (val: number) => {
  districtId.value = null;
  districts.value = [];
  const res = await fetchPostalCodeList({ level: 3, parentId: val });
  districts.value = res.data;
};

watch([provinceId, cityId, districtId], () => {
  emit('change', {
    provinceId: provinceId.value,
    provinceName: provinces.value.find((p) => p.id === provinceId.value)?.displayName,
    cityId: cityId.value,
    cityName: cities.value.find((c) => c.id === cityId.value)?.displayName,
    districtId: districtId.value,
    districtName: districts.value.find((d) => d.id === districtId.value)?.displayName,
  });
});
</script>

<style scoped>
.region-cascader {
  display: flex;
}
.select {
  width: 150px;
  margin-right: 10px;
}
</style>
