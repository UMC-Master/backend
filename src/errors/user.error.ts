import { CommonError } from './errors.js';

export class UserNotFoundError extends CommonError {
  constructor(data: unknown) {
    super('U001', '사용자를 찾을 수 없습니다.', data);
  }
}
