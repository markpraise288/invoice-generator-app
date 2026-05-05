export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface ApiError {
  message: string;
  status?: number;
}