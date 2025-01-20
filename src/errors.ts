export class CommonError extends Error {
  errorCode: string;
  reason: string;
  data: unknown;

  constructor(errorCode: string, reason: string, data: unknown) {
    super(reason);
    this.errorCode = errorCode;
    this.reason = reason;
    this.data = data;
  }
}

export class DuplicateUserEmailError extends CommonError {
  constructor(reason: string, data: unknown) {
    super('U001', reason, data);
  }
}

// Tip을 찾을 수 없을 때 발생하는 에러
export class TipNotFoundError extends CommonError {
  constructor(tipId: number) {
    const reason = `ID ${tipId}인 꿀팁을 찾을 수 없습니다.`;
    super('T001', reason, { tipId });
  }
}

// 중복된 팁을 생성하려 할 때 발생하는 에러
export class DuplicateTipError extends CommonError {
  constructor(title: string) {
    const reason = `제목 "${title}"인 꿀팁은 이미 존재합니다.`;
    super('T002', reason, { title });
  }
}

// 댓글을 찾을 수 없을 때 발생하는 에러
export class CommentNotFoundError extends CommonError {
  constructor(commentId: number) {
    const reason = `ID ${commentId}인 댓글을 찾을 수 없습니다.`;
    super('C001', reason, { commentId });
  }
}

// 이미 좋아요를 눌렀을 때 발생하는 에러
export class LikeAlreadyExistError extends CommonError {
  constructor(tipId: number, userId: number) {
    const reason = `사용자 ID ${userId}는 이미 ID ${tipId}인 꿀팁을 좋아요 했습니다.`;
    super('L001', reason, { tipId, userId });
  }
}

// 꿀팁을 저장하는데 실패했을 때 발생하는 에러
export class TipSaveError extends CommonError {
  constructor(tipId: number) {
    const reason = `ID ${tipId}인 꿀팁을 저장하는데 실패했습니다.`;
    super('T003', reason, { tipId });
  }


}