import request from '@/utils/request';
import type { ProjectPageQuery, ProjectSave, ProjectUpdate, Project, RawProject, ExternalProjectList } from '@/types/project';

export const fetchProjectPage = (data: ProjectPageQuery) => {
    return request<{ total: number; records: RawProject[] }>({
        url: 'sys/business-projects/pageAll',
        method: 'post',
        data,
    });
};

export const getProject = (id: string) => {
    return request<Project>({
        url: `sys/business-projects/get/${id}`,
        method: 'get',
    });
};

export const saveProject = (data: ProjectSave) => {
    return request<boolean>({
        url: 'sys/business-projects/save',
        method: 'post',
        data,
    });
};

export const updateProject = (data: ProjectUpdate) => {
    return request<boolean>({
        url: 'sys/business-projects/update',
        method: 'post',
        data,
    });
};

export const fetchInternalProjectList = () => {
    return request<ExternalProjectList>({
        url: 'internal/internal-project/v1/select-list',
        method: 'post',
        data: {},
    });
};

export const syncExternalProjects = () => {
    return request<null>({
        url: 'internal/internal-project/v1/select-project-sync',
        method: 'post',
    });
};
