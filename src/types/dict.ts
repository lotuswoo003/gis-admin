export interface DictData {
  id?: string;
  label: string;
  typeId?: string;
  value: string;
  description?: string;
  sort?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface DictType {
  id?: string;
  dictName: string;
  dictType: string;
  appCode?: string;
  description?: string;
  sort?: number;
  dataList?: DictData[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
