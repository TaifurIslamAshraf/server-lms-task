export type TResponseMeta = {
  page: number;
  limit: number;
  total: number;
};

export type TSuccessResponse<T> = {
  statusCode: number;
  success?: true;
  message?: string | null;
  meta?: TResponseMeta | null;
  data?: T | null;
};
