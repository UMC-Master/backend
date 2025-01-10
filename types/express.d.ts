declare namespace Express {
    export interface Response {
      success(success: unknown): this;
      error(error: {
        errorCode?: string;
        reason?: string | null;
        data?: unknown | null;
      }): this;
    }
  }