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
