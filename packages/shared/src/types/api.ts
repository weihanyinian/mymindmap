export interface IApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export interface IApiResponse<T> {
  data?: T;
  error?: IApiError;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
