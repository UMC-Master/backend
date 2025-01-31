declare namespace Express {
  export interface Response {
    success(response: object, message?: string, code?: string): this;
    error(options: { errorCode?: string; reason?: string | null; data?: undefined }): this;
  }
}








