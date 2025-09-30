export type SchedulerJobStatus = 'ACTIVE' | 'PAUSED' | 'DELETED';

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export interface SchedulerJobPayload {
  name: string;
  description?: string;
  cronExpression: string;
  requestUrl: string;
  httpMethod: HttpMethod | string;
  headers?: Record<string, string> | null;
  queryParams?: Record<string, any> | null;
  body?: Record<string, any> | null;
  active?: boolean | null;
}

export interface SchedulerJob extends SchedulerJobPayload {
  id: string;
  status?: SchedulerJobStatus;
  lastTriggeredAt?: string | null;
  nextFireTime?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SchedulerJobLogPageQuery {
  jobId: string;
  page?: number;
  pageSize?: number;
}

export interface SchedulerJobLog {
  id: string;
  jobId: string;
  executedAt?: string | null;
  durationMs?: number | null;
  requestUrl?: string | null;
  httpMethod?: string | null;
  requestHeadersJson?: string | null;
  requestParamsJson?: string | null;
  requestBody?: string | null;
  responseStatus?: number | null;
  responseBody?: string | null;
  errorMessage?: string | null;
}

export interface SchedulerJobLogPage {
  total?: number;
  page?: number;
  pageSize?: number;
  records?: SchedulerJobLog[];
}
