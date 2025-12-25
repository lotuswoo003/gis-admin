import request from '@/utils/request';
import type { PlanTemplate } from '@/types/plan-template';

export const listPlanTemplates = () => {
  return request<PlanTemplate[]>({
    url: 'sys/planTemplate/list',
    method: 'post',
  });
};

export const getPlanTemplate = (id: number | string) => {
  return request<PlanTemplate>({
    url: `sys/planTemplate/get/${id}`,
    method: 'post',
  });
};

export const createPlanTemplate = (data: PlanTemplate) => {
  return request<number>({
    url: 'sys/planTemplate/create',
    method: 'post',
    data,
  });
};

export const updatePlanTemplate = (data: PlanTemplate) => {
  return request<boolean>({
    url: 'sys/planTemplate/update',
    method: 'post',
    data,
  });
};

export const deletePlanTemplate = (id: number | string) => {
  return request<boolean>({
    url: `sys/planTemplate/delete/${id}`,
    method: 'post',
  });
};

export const fetchPlanTemplatePage = (data: { page: number; rows: number; [k: string]: any }) => {
  return request<{ total: number; list: PlanTemplate[] }>({
    url: 'sys/planTemplate/page',
    method: 'post',
    data,
  });
};
