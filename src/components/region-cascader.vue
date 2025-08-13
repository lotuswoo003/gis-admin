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
  provinceName?: string;
  cityName?: string;
  districtName?: string;
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
  if (props.modelValue?.provinceName) {
    const p = provinces.value.find(
      (item) => item.displayName === props.modelValue!.provinceName
    );
    if (p) {
      provinceId.value = p.id;
      await onProvinceChange(p.id);
      if (props.modelValue?.cityName) {
        const c = cities.value.find(
          (item) => item.displayName === props.modelValue!.cityName
        );
        if (c) {
          cityId.value = c.id;
          await onCityChange(c.id);
          if (props.modelValue?.districtName) {
            const d = districts.value.find(
              (item) => item.displayName === props.modelValue!.districtName
            );
            if (d) {
              districtId.value = d.id;
            }
          }
        }
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
