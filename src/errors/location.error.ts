import { CommonError } from "./errors.js";

export class LocationNotFoundError extends CommonError {
  constructor(data: unknown) {
    super('LOC001', '없는 위치입니다.', data);
  }
}