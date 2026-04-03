import axios, { AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig, AxiosHeaders } from 'axios';
import type { ApiResponse } from '@/types/response';

export const ACCESS_TOKEN_KEY = 'accessToken';
export const LOGIN_NAME_KEY = 'vuems_name';
export const USER_INFO_KEY = 'userInfo';

export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY);

export const clearAuthStorage = (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(LOGIN_NAME_KEY);
    localStorage.removeItem(USER_INFO_KEY);
};

const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 5000,
});

service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Normalize URL to avoid double slashes when combining with baseURL
        if (typeof config.url === 'string') {
            config.url = config.url.replace(/^\/+/, '');
        }
        const headers = config.headers instanceof AxiosHeaders
            ? config.headers
            : new AxiosHeaders(config.headers as any);

        const fixedBearer: string | undefined = (import.meta as any).env?.VITE_FIXED_BEARER_TOKEN;
        if (fixedBearer && String(fixedBearer).trim()) {
            headers.set('Authorization', fixedBearer);
        } else {
            const token = getAccessToken();
            if (token) headers.set('Authorization', `Bearer ${token}`);
        }
        config.headers = headers;
        return config;
    },
    (error: AxiosError) => {
        console.log(error);
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    (response) => {
        const data = response.data as any;
        if (response.status === 200) {
            if (data && typeof data === 'object' && 'code' in data) {
                const res = data as ApiResponse<any>;
                if (res.code === 0) return res as any;
                return Promise.reject(res?.message || 'Error');
            }
            // Wrap raw payload (e.g., Token) to ApiResponse shape
            return { code: 0, message: 'success', data } as any;
        }
        return Promise.reject('Error');
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            clearAuthStorage();
            if (window.location.hash !== '#/login') {
                window.location.hash = '#/login';
            }
        }
        console.log(error);
        return Promise.reject(error);
    }
);

const request = <T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return service(config);
};

export default request;
