
export interface User {
    id: number | string;
    username: string;
    name: string;
    organizationId?: string;
    organizationName?: string;
    password?: string;
    email: string;
    phone: string;
    date: string;
    role?: string;
}

export interface UserPageRequest {
    page: number;
    rows: number;
    name?: string;
    username?: string;
}

export interface UserPageResult {
    total: number;
    list: User[];
}

export interface Register {
    username: string;
    password: string;
    email: string;
}
