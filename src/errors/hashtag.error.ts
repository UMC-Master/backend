import { CommonError } from './errors.js';

export class HashtagNotFoundError extends CommonError {
  constructor(data: unknown) {
    super('#001', '없는 해시태그입니다.', data);
  }
}
