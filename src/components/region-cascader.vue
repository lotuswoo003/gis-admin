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
import { onMounted, ref, watch } from 'vue';
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
const syncingFromProps = ref(false);

const emit = defineEmits(['change']);

const loadProvinces = async () => {
  const res = await fetchPostalCodeList({ level: 1, parentId: '-1' });
  provinces.value = res.data || [];
};

const syncModelValue = async (value?: RegionModel) => {
  syncingFromProps.value = true;
  if (!provinces.value.length) {
    await loadProvinces();
  }

  provinceId.value = value?.provinceId ? String(value.provinceId) : null;
  cityId.value = value?.cityId ? String(value.cityId) : null;
  countyId.value = value?.countyId ? String(value.countyId) : null;

  if (provinceId.value) {
    const cityRes = await fetchPostalCodeList({ level: 2, parentId: provinceId.value });
    cities.value = cityRes.data || [];
  } else {
    cities.value = [];
  }

  if (cityId.value) {
    const countyRes = await fetchPostalCodeList({ level: 3, parentId: cityId.value });
    counties.value = countyRes.data || [];
  } else {
    counties.value = [];
  }

  syncingFromProps.value = false;
};

onMounted(async () => {
  await syncModelValue(props.modelValue);
});

const onProvinceChange = async (val: string) => {
  cityId.value = null;
  countyId.value = null;
  cities.value = [];
  counties.value = [];
  const res = await fetchPostalCodeList({ level: 2, parentId: val });
  cities.value = res.data || [];
};

const onCityChange = async (val: string) => {
  countyId.value = null;
  counties.value = [];
  const res = await fetchPostalCodeList({ level: 3, parentId: val });
  counties.value = res.data || [];
};

watch(
  () => props.modelValue,
  async (value) => {
    await syncModelValue(value);
  },
  { deep: true }
);

watch([provinceId, cityId, countyId], () => {
  if (syncingFromProps.value) {
    return;
  }
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
