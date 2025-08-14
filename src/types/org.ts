export interface Organization {
    id: number;
    name: string;
    type: string;
    province: string;
    city: string;
    county: string;
    provinceId?: string;
    cityId?: string;
    countyId?: string;
    address: string;
    createdAt: string;
}

export interface OrganizationPageQuery {
    size: number;
    page: number;
    name?: string;
}

export interface OrganizationSave {
    name: string;
    type: string;
    province: string;
    city: string;
    county: string;
    provinceId: string;
    cityId: string;
    countyId: string;
    address: string;
}

export interface OrganizationUpdate extends OrganizationSave {
    id: number;
}
