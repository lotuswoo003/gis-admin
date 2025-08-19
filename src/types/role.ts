export interface Role {
    id: string;
    name: string;
    description?: string;
    type?: string;
    orgId?: string;
}

export interface RoleCreateRequest {
    name: string;
    description?: string;
    type?: string;
    orgId?: string;
}

export interface RoleUpdateRequest {
    id: string;
    name: string;
    description?: string;
    type?: string;
    orgId?: string;
}

export interface RolePageRequest {
    page: number;
    rows: number;
    name?: string;
}
