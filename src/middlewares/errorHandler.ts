import { Request, Response, NextFunction } from 'express';
import { isCommonError } from '../errors/errors';

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isCommonError(error)) {
    res.status(getHttpStatusCode(error.errorCode)).json({
      isSuccess: false,
      code: error.errorCode,
      message: error.reason,
      data: error.data,
    });
  } else {
    console.error('Unhandled Error:', error);
    res.status(500).json({
      isSuccess: false,
      code: 'COMMON500',
      message: '서버 에러가 발생했습니다.',
    });
  }
};

// 에러 코드에 따른 상태 코드 반환 함수
const getHttpStatusCode = (errorCode: string): number => {
  if (errorCode.startsWith('AUTH')) return 401; // 인증 관련 에러
  if (errorCode.startsWith('VAL')) return 400; // 유효성 검증 에러
  if (errorCode.startsWith('RES')) return 404; // 리소스 관련 에러
  if (errorCode.startsWith('DB')) return 500; // 데이터베이스 에러
  return 400; // 기본 400
};
