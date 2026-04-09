import request from '@/utils/request';
import axios from "axios";
import type { ProjectPageQuery, ProjectSave, ProjectUpdate, RawProject, ExternalProjectList, ExternalProjectQuery, FeatureDeleteRequest } from '@/types/project';

const FEATURE_DELETE_TIMEOUT = 60_000;

export const fetchProjectPage = (data: ProjectPageQuery) => {
    return request<{ total: number; list: RawProject[] }>({
        url: 'sys/business-projects/pageAll',
        method: 'post',
        data,
    });
};

export const getProject = (id: string) => {
    return request<RawProject>({
        url: 'sys/business-projects/getProject',
        method: 'post',
        params: { id },
    });
};

export const saveProject = (data: ProjectSave) => {
    return request<boolean>({
        url: 'sys/business-projects/createProject',
        method: 'post',
        data,
    });
};

export const updateProject = (data: ProjectUpdate) => {
    return request<boolean>({
        url: 'sys/business-projects/updateProject',
        method: 'post',
        data,
    });
};

export const fetchInternalProjectList = (data: ExternalProjectQuery) => {
    return request<ExternalProjectList>({
        url: 'internal/internal-project/v1/select-page',
        method: 'post',
        data,
    });
};

export const syncExternalProjects = () => {
    return request<null>({
        url: 'internal/internal-project/v1/select-project-sync',
        method: 'post',
    });
};

export const deleteProjectFeatures = (payload: FeatureDeleteRequest) => {
    return request<null>({
        url: 'internal/internal-feature/v1/delete',
        method: 'post',
        data: payload,
        timeout: FEATURE_DELETE_TIMEOUT,
    });
};

export const deleteProjectOrthographic = (ids: string[]) => {
    return request<null>({
        url: 'internal/internal-orthographic/v1/delete',
        method: 'post',
        data: ids,
    });
};

export const fetchInternalProjectBinds = async (ids: string[]) => {
    const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
    const url = `${base}/internal/project_internal_project/v1/select-by-project-ids`;
    const headers: Record<string, string> = {};
    const fixedBearer: string | undefined = (import.meta as any).env?.VITE_FIXED_BEARER_TOKEN;
    if (fixedBearer && String(fixedBearer).trim()) {
        headers.Authorization = fixedBearer;
    } else {
        const token = localStorage.getItem('accessToken');
        if (token) headers.Authorization = `Bearer ${token}`;
    }
    const resp = await axios.post(url, { projectIdList: ids }, { headers });
    return resp.data;
};

export const insertBatchInternalBinding = (projectId: string, internalIds: string[]) => {
    return request<null>({
        url: 'internal/project_internal_project/v2/insert-batch',
        method: 'post',
        data: {
            projectId,
            internalProjectIdList: internalIds,
        },
    });
};

export const syncInternalOrthographic = (projectIds: string[]) => {
    return request<null>({
        url: 'internal/internal-orthographic/v2/select-internal-orthographic',
        method: 'post',
        data: projectIds,
    });
};

export const syncInternalFeatures = (projectIds: string[]) => {
    return request<null>({
        url: 'internal/internal-feature/v2/select-internal-feature',
        method: 'post',
        data: projectIds,
    });
};

export const syncParcel = (projectId: string) => {
    return request<null>({
        url: 'internal/internal-project/v1/tongbudikuai',
        method: 'post',
        data: {
            projectId,
        },
    });
};
