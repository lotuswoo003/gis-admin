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
