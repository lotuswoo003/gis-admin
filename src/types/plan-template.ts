export interface PlanTemplate {
  id?: string;
  organizationId?: string;
  organizationName?: string;
  month?: number;
  type?: string;
  description?: string;
  suggestions?: string;
  intelligentSuggestions?: string;
  inputLabor?: number;
  workload?: number;
  finishStandards?: string;
  province?: string;
  city?: string;
  county?: string;
  provinceId?: string;
  cityId?: string;
  countyId?: string;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: string; // date-time
  updatedAt?: string; // date-time
  deletedAt?: string; // date-time
}
