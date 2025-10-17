export interface Project {
    id: string;
    name: string;
    partyAName: string;
    partyBName: string;
    startTime: string;
    endTime: string;
    center?: string | null;
    collect?: unknown;
}

export interface RawProject {
    id: string;
    name: string;
    partyAOrganizationId: string;
    partyBOrganizationId: string | null;
    partyAOrganizationName?: string | null;
    partyBOrganizationName?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    notes?: string | null;
    price?: number | null;
    centerPoint?: string | null;
    province?: string | null;
    city?: string | null;
    county?: string | null;
    provinceId?: string | null;
    cityId?: string | null;
    countyId?: string | null;
    status?: number | null;
    abbreviation?: string | null;
    serialNumber?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    deletedAt?: string | null;
    collect?: unknown;
}

export interface ExternalProject {
    id: number | string;
    bizProjectId?: number;
    name: string;
    status?: number | null;
    manager?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    createTime?: string | null;
    updateTime?: string | null;
    [key: string]: unknown;
}

export interface ExternalProjectList {
    total: number;
    list: ExternalProject[];
}

export interface ProjectPageQuery {
    rows: number;
    page: number;
    name?: string;
}

export interface ProjectSave {
    name: string;
    partyAName: string;
    partyBName: string;
    startTime: string;
    endTime: string;
    center: string;
}

export interface ProjectUpdate extends ProjectSave {
    id: string;
}
