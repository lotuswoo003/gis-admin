import request from '@/utils/request';
import type {
  SchedulerJob,
  SchedulerJobPayload,
  SchedulerJobLogPage,
  SchedulerJobLogPageQuery,
} from '@/types/scheduler';

export const listSchedulerJobs = () =>
  request<SchedulerJob[]>({
    url: 'scheduler/jobs/list',
    method: 'post',
  });

export const getSchedulerJob = (id: string) =>
  request<SchedulerJob>({
    url: `scheduler/jobs/get/${id}`,
    method: 'post',
  });

export const createSchedulerJob = (payload: SchedulerJobPayload) =>
  request<SchedulerJob>({
    url: 'scheduler/jobs/create',
    method: 'post',
    data: payload,
  });

export const updateSchedulerJob = (id: string, payload: SchedulerJobPayload) =>
  request<SchedulerJob>({
    url: `scheduler/jobs/update/${id}`,
    method: 'post',
    data: payload,
  });

export const deleteSchedulerJob = (id: string) =>
  request<boolean>({
    url: `scheduler/jobs/delete/${id}`,
    method: 'post',
  });

export const triggerSchedulerJob = (id: string) =>
  request<boolean>({
    url: `scheduler/jobs/trigger/${id}`,
    method: 'post',
  });

export const pauseSchedulerJob = (id: string) =>
  request<SchedulerJob>({
    url: `scheduler/jobs/pause/${id}`,
    method: 'post',
  });

export const resumeSchedulerJob = (id: string) =>
  request<SchedulerJob>({
    url: `scheduler/jobs/resume/${id}`,
    method: 'post',
  });

export const pageSchedulerJobLogs = (payload: SchedulerJobLogPageQuery) =>
  request<SchedulerJobLogPage>({
    url: 'scheduler/jobs/logs/page',
    method: 'post',
    data: payload,
  });
