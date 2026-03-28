import { CommonError } from './errors.js';

export class ChallengeNotFoundError extends CommonError {
  constructor(data: unknown) {
    super('CH001', '없는 챌린지입니다.', data);
  }
}
