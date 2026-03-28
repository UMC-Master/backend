import { CommunityRepository } from '../repositories/community.repository.js';
import { UserRepository } from '../repositories/user.repository';

import {
  ResourceNotFoundError,
  ValidationError,
  DatabaseError,
} from '../errors/errors.js'; // 에러 클래스 import

export class CommunityService {
  private communityRepository: CommunityRepository;
  private userRepository: UserRepository;


  constructor() {
    this.communityRepository = new CommunityRepository();
  }



  async toggleLike(userId: number, tipId: number) {
    // 기존 좋아요 여부 확인
    const existingLike = await this.communityRepository.getTipLike(userId, tipId);
  
    if (existingLike) {
      await this.communityRepository.removeLike(userId, tipId);
      return { message: "좋아요가 취소되었습니다." };
    } else {
      await this.communityRepository.addLike(userId, tipId);
      return { message: "좋아요가 추가되었습니다." };
    }
  }
  

  async toggleBookmark(userId: number, tipId: number) {
    // 기존 북마크 여부 확인
    const existingBookmark = await this.communityRepository.getBookmarkByUserAndTip(userId, tipId);

    if (existingBookmark) {
      await this.communityRepository.removeBookmark(existingBookmark.save_id);
      return { message: "북마크가 취소되었습니다." };
    } else {
      await this.communityRepository.addBookmark(userId, tipId);
      return { message: "북마크가 추가되었습니다."};
    }
  }

  // 팁에 댓글 작성
  async commentOnTip(userId: number, tipId: number, comment: string) {
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
  async deleteComment(commentId: number) {
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

  async updateComment(
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

// 사용자의 저장된 꿀팁 목록 조회
async getSavedTips(userId: number) {
  const savedTips = await this.communityRepository.getSavedTips(userId);

  return savedTips.map((save) => ({
    tipId: save.tips.tips_id,
    title: save.tips.title,
    content: save.tips.content,
    author: {
      userId: save.tips.user.user_id,
      nickname: save.tips.user.nickname,
      profileImageUrl: save.tips.user.profile_image_url,
    },
    imageUrls: save.tips.media.map((media) => ({
      media_url: media.media_url,
      media_type: media.media_type,
    })),
    likeCount: save.tips.likes ? save.tips.likes.length : 0, // 좋아요 수 계산
    saveCount: save.tips.saves ? save.tips.saves.length : 0, // 북마크(저장) 수 계산
    createdAt: save.tips.created_at,
  }));
}


  // 전체 댓글 조회 (페이지네이션 적용)
  async getAllComments() {
    return await this.communityRepository.getAllComments();
  }

  
  // 특정 댓글 상세 조회
  async getCommentById(commentId: number) {
    if (!commentId || isNaN(commentId)) {
      throw new ValidationError('유효한 댓글 ID가 필요합니다.',null);
    }

    return await this.communityRepository.getCommentById(commentId);
  }
}
