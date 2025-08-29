import axios, { AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig, AxiosHeaders } from 'axios';
import type { ApiResponse } from '@/types/response';

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
        const token = localStorage.getItem('accessToken');
        if (token) {
            const headers = config.headers instanceof AxiosHeaders
                ? config.headers
                : new AxiosHeaders(config.headers as any);
            headers.set('Authorization', `Bearer ${token}`);
            config.headers = headers;
        }
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
        console.log(error);
        return Promise.reject(error);
    }
);

const request = <T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return service(config);
};

export default request;
