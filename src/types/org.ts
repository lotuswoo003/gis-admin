export interface Organization {
    id: string;
    name: string;
    type: string;
    province: string;
    city: string;
    county: string;
    provinceId?: string;
    cityId?: string;
    countyId?: string;
    address: string;
    moveInDate?: string;
    createdAt: string;
    adminLoginCode?: string;
}

export interface OrganizationPageQuery {
    rows: number;
    page: number;
    name?: string;
    moveInDateFrom?: string;
    moveInDateTo?: string;
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
    moveInDate?: string;
    adminLoginCode?: string;
}

export interface OrganizationUpdate extends OrganizationSave {
    id: string;
}
