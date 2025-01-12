declare namespace Express {
  export interface Response {
    success(response: any, message?: string, code?: string): this;
    error(options: { errorCode?: string; reason?: string | null; data?: any }): this;
  }
}