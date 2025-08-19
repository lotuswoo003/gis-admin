export interface Permission {
    id: string;
    name: string;
    code: string;
    description: string;
    path: string;
    parentId: string;
    type: string;
    sort: number;
    disableFlag: number;
    parentName?: string;
    treePath?: string;
    children?: Permission[];
}

export interface PermissionPageQuery {
    page: number;
    rows: number;
    name?: string;
}

export interface PermissionCreateRequest {
    name: string;
    code: string;
    description: string;
    path: string;
    parentId: string;
    type: string;
    sort: number;
    disableFlag: number;
}

export interface PermissionUpdateRequest extends PermissionCreateRequest {
    id: string;
}
