import { defineStore } from 'pinia';
import { listDict } from '@/api/dict';
import type { DictData } from '@/types/dict';

export const useDictStore = defineStore('dict', {
  state: () => ({
    loaded: false as boolean,
    map: {} as Record<string, DictData[]>,
  }),
  getters: {
    getOptions: (state) => (dictType: string) => {
      const list = state.map[dictType] || [];
      return list.map(d => ({ label: d.label, value: d.value }));
    },
    getLabel: (state) => (dictType: string, value?: string) => {
      if (!value) return '';
      const list = state.map[dictType] || [];
      const item = list.find(d => String(d.value) === String(value));
      return item?.label || String(value);
    },
  },
  actions: {
    async loadAll() {
      if (this.loaded) return;
      try {
        const res = await listDict();
        const items = (res.data || []) as Array<{ dictType?: string; dataList?: DictData[] }>;
        const m: Record<string, DictData[]> = {};
        for (const t of items) {
          if (t?.dictType) {
            m[t.dictType] = (t.dataList || []).slice().sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
          }
        }
        this.map = m;
        this.loaded = true;
      } catch (e) {
        console.error('Failed to load dicts', e);
      }
    },
  },
});

