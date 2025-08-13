export interface Organization {
    id: number;
    name: string;
    type: string;
    province: string;
    city: string;
    district: string;
    provinceId?: number;
    cityId?: number;
    districtId?: number;
    address: string;
    createTime: string;
}
