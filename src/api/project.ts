import request from '@/utils/request';
import type { ProjectPageQuery, ProjectSave, ProjectUpdate } from '@/types/project';

export const fetchProjectPage = (data: ProjectPageQuery) => {
    return request({
        url: '/project/page',
        method: 'post',
        data,
    });
};

export const getProject = (id: number) => {
    return request({
        url: `/project/get/${id}`,
        method: 'get',
    });
};

export const saveProject = (data: ProjectSave) => {
    return request({
        url: '/project/save',
        method: 'post',
        data,
    });
};

export const updateProject = (data: ProjectUpdate) => {
    return request({
        url: '/project/update',
        method: 'post',
        data,
    });
};
