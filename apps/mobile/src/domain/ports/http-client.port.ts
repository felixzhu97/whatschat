export type HttpResult<T = unknown> = { data: T };

export interface IHttpClient {
  get<T = unknown>(url: string, config?: unknown): Promise<HttpResult<T>>;
  post<T = unknown>(url: string, body?: unknown, config?: unknown): Promise<HttpResult<T>>;
  put<T = unknown>(url: string, body?: unknown, config?: unknown): Promise<HttpResult<T>>;
  delete<T = unknown>(url: string, config?: unknown): Promise<HttpResult<T>>;
}
