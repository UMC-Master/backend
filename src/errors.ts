// 기본 CommonError 클래스
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

// 중복 이메일 에러
export class DuplicateUserEmailError extends CommonError {
  constructor(reason: string, data: unknown) {
    super('U001', reason, data);
  }
}

// 인증 관련 에러
export class UnauthorizedError extends CommonError {
  constructor(reason: string, data: unknown) {
    super('AUTH401', reason || 'Unauthorized access', data);
  }
}

export class ForbiddenError extends CommonError {
  constructor(reason: string, data: unknown) {
    super('AUTH403', reason || 'Forbidden access', data);
  }
}

// 유효성 검증 에러
export class ValidationError extends CommonError {
  constructor(reason: string, data: unknown) {
    super('VAL400', reason || 'Validation failed', data);
  }
}

// 데이터베이스 관련 에러
export class DatabaseError extends CommonError {
  constructor(reason: string, data: unknown) {
    super('DB500', reason || 'Database operation failed', data);
  }
}

// 리소스 관련 에러
export class ResourceNotFoundError extends CommonError {
  constructor(reason: string, data: unknown) {
    super('RES404', reason || 'Resource not found', data);
  }
}

// CommonError 타입 가드 함수
export function isCommonError(error: unknown): error is CommonError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errorCode' in error &&
    'reason' in error &&
    'data' in error
  );
}
