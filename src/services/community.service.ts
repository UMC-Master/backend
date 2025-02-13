import { CommunityRepository } from '../repositories/community.repository.js';
import { UserRepository } from '../repositories/user.repository';

import {
  ResourceNotFoundError,
  ValidationError,
  DatabaseError,
  TipNotFoundError
} from '../errors/errors.js'; // 에러 클래스 import

export class CommunityService {
  private communityRepository: CommunityRepository;
  private userRepository: UserRepository;


  constructor() {
    this.communityRepository = new CommunityRepository();
  }



  async toggleLike(userId: number, tipId: number) {
    const tip = await this.communityRepository.getTipById(tipId);
    if (!tip) {
      throw new TipNotFoundError(tipId);
    }

    const existingLike = await this.communityRepository.findLikeByUserAndTip(userId, tipId);

    if (existingLike) {
      await this.communityRepository.removeLike(existingLike.tip_like_id);
      return { message: '좋아요 취소' };
    } else {
      await this.communityRepository.addLike(userId, tipId);
      return { message: '좋아요' };
    }
  }

  async toggleBookmark(userId: number, tipId: number) {
    const tip = await this.communityRepository.getTipById(tipId);
    if (!tip) {
      throw new TipNotFoundError(tipId);
    }

    const existingBookmark = await this.communityRepository.findBookmarkByUserAndTip(userId, tipId);

    if (existingBookmark) {
      await this.communityRepository.removeBookmark(existingBookmark.tip_bookmark_id);
      return { message: '북마크 취소' };
    } else {
      await this.communityRepository.addBookmark(userId, tipId);
      return { message: '북마크' };
    }
  }

  // 팁에 댓글 작성
   public async commentOnTip(userId: number, tipId: number, comment: string) {
    try {
      const tip = await this.communityRepository.getTipById(tipId);
      if (!tip) {
        throw new ResourceNotFoundError('Tip not found', { tipId });
      }

      // 댓글을 작성할 수 없을 때 발생하는 에러 처리
      const newComment = await this.communityRepository.commentOnTip(
        userId,
        tipId,
        comment
      );
      if (!newComment) {
        throw new ValidationError('Comment creation failed', {
          tipId,
          comment,
        });
      }

      return newComment; // 댓글 정보 반환
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error; // 팁을 찾을 수 없을 때 발생하는 에러
      } else if (error instanceof ValidationError) {
        throw error; // 댓글 작성 실패 에러
      }
      throw new DatabaseError(
        'An error occurred while commenting on the tip.',
        error
      );
    }
  }

  // 댓글 삭제
  public async deleteComment(commentId: number) {
    try {
      // 댓글 존재 여부 확인
      const comment = await this.communityRepository.getCommentById(commentId);
      if (!comment) {
        throw new ResourceNotFoundError('Comment not found', { commentId });
      }

      // 댓글 삭제 처리
      await this.communityRepository.deleteComment(commentId);
      return { message: 'Comment successfully deleted' };
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error; // 댓글을 찾을 수 없을 때 발생하는 에러
      }
      throw new DatabaseError(
        'An error occurred while deleting the comment.',
        error
      );
    }
  }

  public async updateComment(
    userId: number,
    tipId: number,
    commentId: number,
    comment: string
  ) {
    try {
      // 댓글 존재 여부 확인
      const existingComment =
        await this.communityRepository.getCommentById(commentId);
      if (!existingComment) {
        throw new ResourceNotFoundError('Comment not found', { commentId });
      }

      // 댓글이 요청한 사용자와 연관되어 있는지 확인
      if (existingComment.user_id !== userId) {
        throw new ValidationError(
          'You are not authorized to modify this comment',
          { commentId }
        );
      }

      // 댓글 업데이트
      return await this.communityRepository.updateComment(commentId, comment);
    } catch (error) {
      if (
        error instanceof ResourceNotFoundError ||
        error instanceof ValidationError
      ) {
        throw error;
      }
      throw new DatabaseError(
        'An error occurred while updating the comment.',
        error
      );
    }
  }

  private validateInputs(userId: number, communityId: number): void {
    if (!userId || !communityId) {
      throw new ValidationError('유효하지 않은 요청입니다.', { userId, communityId });
    }
    if (isNaN(userId) || isNaN(communityId)) {
      throw new ValidationError('ID는 숫자 형식이어야 합니다.', { userId, communityId });
    }
  }
}
