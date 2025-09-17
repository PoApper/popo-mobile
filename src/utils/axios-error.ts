import axios from 'axios';

export type AxiosErrorInfo = {
  isAxios: boolean;
  status?: number;
  detail?: string;
  data?: any;
};

export function getAxiosErrorInfo(err: unknown): AxiosErrorInfo {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;
    const detail =
      typeof data === 'string'
        ? data
        : data?.detail || data?.message || (data ? JSON.stringify(data) : undefined);
    return {isAxios: true, status, detail, data};
  }
  return {isAxios: false, detail: err instanceof Error ? err.message : String(err)};
}


