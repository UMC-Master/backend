import { CommonError } from "./errors.js";

export class LocationNotFoundError extends CommonError {
  constructor(data: unknown) {
    super('LOC001', '없는 위치입니다.', data);
  }
}

export class LocationAlreadyExistError extends CommonError {
  constructor(data: unknown) {
    super('LOC002', '이미 존재하는 위치입니다.', data);
  }
}