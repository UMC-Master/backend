export class CommonError extends Error {
  errorCode: string;
  reason: string;
  data: unknown;

  constructor(errorCode: string, reason: string, data: unknown) {
    super(reason);
    this.errorCode = errorCode;
    this.reason = reason;
    this.data = data;
  }
}

export class DuplicateUserEmailError extends CommonError {
  constructor(reason: string, data: unknown) {
    super('U001', reason, data);
  }
}


