export class DuplicateUserEmailError extends Error {
    errorCode = "U001";
    reason: string;
    data: string;
  
    constructor(reason: string, data: any) {
      super(reason);
      this.reason = reason;
      this.data = data;
    }
  }