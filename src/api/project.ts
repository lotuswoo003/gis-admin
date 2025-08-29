import request from '@/utils/request';
import type { ProjectPageQuery, ProjectSave, ProjectUpdate, Project } from '@/types/project';

export const fetchProjectPage = (data: ProjectPageQuery) => {
    return request<{ total: number; records: Project[] }>({
        url: 'sys/project/page',
        method: 'post',
        data,
    });
};

export const getProject = (id: number) => {
    return request<Project>({
        url: `sys/project/get/${id}`,
        method: 'get',
    });
};

export const saveProject = (data: ProjectSave) => {
    return request<boolean>({
        url: 'sys/project/save',
        method: 'post',
        data,
    });
};

export const updateProject = (data: ProjectUpdate) => {
    return request<boolean>({
        url: 'sys/project/update',
        method: 'post',
        data,
    });
};
