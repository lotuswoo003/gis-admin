import request from '@/utils/request';
import type { SchedulerJob, SchedulerJobPayload } from '@/types/scheduler';

export const listSchedulerJobs = () =>
  request<SchedulerJob[]>({
    url: 'scheduler/jobs',
    method: 'get',
  });

export const getSchedulerJob = (id: string) =>
  request<SchedulerJob>({
    url: `scheduler/jobs/${id}`,
    method: 'get',
  });

export const createSchedulerJob = (payload: SchedulerJobPayload) =>
  request<SchedulerJob>({
    url: 'scheduler/jobs',
    method: 'post',
    data: payload,
  });

export const updateSchedulerJob = (id: string, payload: SchedulerJobPayload) =>
  request<SchedulerJob>({
    url: `scheduler/jobs/${id}`,
    method: 'put',
    data: payload,
  });

export const deleteSchedulerJob = (id: string) =>
  request<boolean>({
    url: `scheduler/jobs/${id}`,
    method: 'delete',
  });

export const triggerSchedulerJob = (id: string) =>
  request<boolean>({
    url: `scheduler/jobs/${id}/trigger`,
    method: 'post',
  });

export const pauseSchedulerJob = (id: string) =>
  request<SchedulerJob>({
    url: `scheduler/jobs/${id}/pause`,
    method: 'post',
  });

export const resumeSchedulerJob = (id: string) =>
  request<SchedulerJob>({
    url: `scheduler/jobs/${id}/resume`,
    method: 'post',
  });
