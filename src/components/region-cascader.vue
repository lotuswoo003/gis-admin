<template>
  <div class="region-cascader">
    <el-select v-model="provinceId" placeholder="请选择省" @change="onProvinceChange" class="select">
      <el-option
        v-for="item in provinces"
        :key="item.id"
        :label="item.displayName"
        :value="String(item.id)"
      />
    </el-select>
    <el-select v-model="cityId" placeholder="请选择市" :disabled="!provinceId" @change="onCityChange" class="select">
      <el-option
        v-for="item in cities"
        :key="item.id"
        :label="item.displayName"
        :value="String(item.id)"
      />
    </el-select>
    <el-select v-model="countyId" placeholder="请选择区" :disabled="!cityId" class="select">
      <el-option
        v-for="item in counties"
        :key="item.id"
        :label="item.displayName"
        :value="String(item.id)"
      />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import type { PostalCode } from '@/types/postal-code';
import { fetchPostalCodeList } from '@/api/postal-code';

interface RegionModel {
  provinceId?: string;
  cityId?: string;
  countyId?: string;
}

const props = defineProps<{ modelValue?: RegionModel }>();

const provinces = ref<PostalCode[]>([]);
const cities = ref<PostalCode[]>([]);
const counties = ref<PostalCode[]>([]);

const provinceId = ref<string | null>(null);
const cityId = ref<string | null>(null);
const countyId = ref<string | null>(null);

const emit = defineEmits(['change']);

onMounted(async () => {
  const res = await fetchPostalCodeList({ level: 1, parentId: '-1' });
  provinces.value = res.data;
  if (props.modelValue?.provinceId) {
    provinceId.value = String(props.modelValue.provinceId);
    await onProvinceChange(provinceId.value);
    if (props.modelValue.cityId) {
      cityId.value = String(props.modelValue.cityId);
      await onCityChange(cityId.value);
      if (props.modelValue.countyId) {
        countyId.value = String(props.modelValue.countyId);
      }
    }
  }
});

const onProvinceChange = async (val: string) => {
  cityId.value = null;
  countyId.value = null;
  cities.value = [];
  counties.value = [];
  const res = await fetchPostalCodeList({ level: 2, parentId: val });
  cities.value = res.data;
};

const onCityChange = async (val: string) => {
  countyId.value = null;
  counties.value = [];
  const res = await fetchPostalCodeList({ level: 3, parentId: val });
  counties.value = res.data;
};

watch([provinceId, cityId, countyId], () => {
  emit('change', {
    provinceId: provinceId.value,
    provinceName: provinces.value.find((p) => String(p.id) === provinceId.value)?.displayName,
    cityId: cityId.value,
    cityName: cities.value.find((c) => String(c.id) === cityId.value)?.displayName,
    countyId: countyId.value,
    countyName: counties.value.find((d) => String(d.id) === countyId.value)?.displayName,
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
