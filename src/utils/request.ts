import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/response';
const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 5000
});

service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        return config;
    },
    (error: AxiosError) => {
        console.log(error);
        return Promise.reject();
    }
);

service.interceptors.response.use(
    (response) => {
        const res = response.data as ApiResponse<any>;
        if (response.status === 200 && res.code === 0) {
            return res as any;
        } else {
            return Promise.reject(res?.message || 'Error');
        }
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
