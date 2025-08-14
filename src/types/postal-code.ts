export interface PostalCode {
    id: number;
    name: string;
    displayName: string;
    parentId: number;
    shortName: string;
    level: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface PostalCodeListResponse {
    code: number;
    message: string;
    data: PostalCode[];
}
