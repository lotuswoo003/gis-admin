import type { ApiResponse } from './response';

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

export type PostalCodeListResponse = ApiResponse<PostalCode[]>;
