import { CommonError } from './errors.js';

export class QuizNotFoundError extends CommonError {
  constructor(data: unknown) {
    super('Q001', '없는 퀴즈입니다.', data);
  }
}