export interface Project {
    id: string;
    name: string;
    partyAName: string;
    partyBName: string;
    startTime: string;
    endTime: string;
    center?: string | null;
    collect?: unknown;
    externalProjectName?: string;
}

export interface RawProject {
    id: string;
    name: string;
    partyAOrganizationId: string;
    partyBOrganizationId: string | null;
    partyAOrganizationName?: string | null;
    partyBOrganizationName?: string | null;
    startDate?: string | number | null;
    endDate?: string | number | null;
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
    createdAt?: string | number | null;
    updatedAt?: string | number | null;
    deletedAt?: string | null;
    collect?: unknown;
    externalProjectName?: string;
}

export interface ExternalProject {
    id: number | string;
    bizProjectId?: number;
    name: string;
    status?: number | null;
    manager?: number | null;
    startDate?: string | number | null;
    endDate?: string | number | null;
    createTime?: string | number | null;
    updateTime?: string | number | null;
    [key: string]: unknown;
}


export interface InternalProjectBind {
    projectId: string;
    name?: string;
    bizProjectId?: string;
}

export interface FeatureDeleteRequest {
    id?: string | number | null;
    ids: Array<string | number>;
}

export interface ExternalProjectList {
    total: number;
    list: ExternalProject[];
}

export interface ExternalProjectQuery {
    page: number;
    rows: number;
    name?: string;
}

export interface ProjectPageQuery {
    rows: number;
    page: number;
    name?: string;
}

export interface ProjectSave {
    name: string;
    partyAOrganizationId: string;
    partyBOrganizationId: string | null;
    startDate: string;
    endDate: string;
    centerPoint?: string | null;
}

export interface ProjectUpdate extends ProjectSave {
    id: string;
}
