import { CommonError } from './errors.js';

export class PolicyNotFoundError extends CommonError {
  constructor(data: unknown) {
    super('P001', '없는 정책입니다.', data);
  }
}