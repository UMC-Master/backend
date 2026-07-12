import { CommonError } from './errors.js';

export class ChallengeNotFoundError extends CommonError {
  constructor(data: unknown) {
    super('CH001', '없는 챌린지입니다.', data);
  }
}

export class ChallengeAlreadyStartedError extends CommonError {
  constructor(data: unknown) {
    super('CH002', '이미 시작한 챌린지입니다.', data);
  }
}

export class ChallengeAttemptNotFoundError extends CommonError {
  constructor(data: unknown) {
    super('CH003', '없는 챌린지 시도입니다.', data);
  }
}

export class ChallengeAttemptNotStartError extends CommonError {
  constructor(data: unknown) {
    super('CH004', '챌린지 시도 상태가 START가 아닙니다.', data);
  }
}

export class ChallengeAttemptForbiddenError extends CommonError {
  constructor(data: unknown) {
    super('CH005', '본인의 챌린지 시도가 아닙니다.', data);
  }
}
