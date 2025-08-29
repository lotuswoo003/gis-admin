import axios, { AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/response';

const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 5000,
});

service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers = config.headers || {};
            (config.headers as any)['Authorization'] = `Bearer ${token}`;
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
            // Fallback: some endpoints may return raw payload (e.g., Token)
            return data as any;
        }
        return Promise.reject('Error');
    },
    (error: AxiosError) => {
        console.log(error);
        return Promise.reject(error);
    }
);

const request = <T>(config: AxiosRequestConfig): Promise<ApiResponse<T> | T> => {
    return service(config);
};

export default request;
