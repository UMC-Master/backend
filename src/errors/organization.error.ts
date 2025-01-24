import { CommonError } from "./errors.js";

export class OrganizationNotFoundError extends CommonError {
  constructor(data: unknown) {
    super('ORG001', '없는 기관입니다.', data);
  }
}