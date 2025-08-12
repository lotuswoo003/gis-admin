export interface DictValue {
    id: number;
    label: string;
    dict_type: string;
    value: string;
    description: string;
    sort: number;
}

export interface DictItem {
    id: number;
    dict_name: string;
    dict_type: string;
    app_code: string;
    values: DictValue[];
}
