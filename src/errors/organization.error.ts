import { CommonError } from './errors.js';

export class OrganizationNotFoundError extends CommonError {
  constructor(data: unknown) {
    super('ORG001', '없는 기관입니다.', data);
  }
}

export class OrganizationAlreadyExistError extends CommonError {
  constructor(data: unknown) {
    super('LOC002', '이미 존재하는 기관입니다.', data);
  }
}