import { CommunityRepository } from '../repositories/community.repository.js';
import { toCommunityDto } from '../dtos/community.dto.js';
import {
  ResourceNotFoundError,
  ValidationError,
  DatabaseError,
} from '../errors/errors.js'; // 에러 클래스 import

export class CommunityService {
  private communityRepository: CommunityRepository;

  constructor() {
    this.communityRepository = new CommunityRepository();
  }

  // 팁 저장 (토글)
  public async saveTip(userId: number, tipId: number) {
    try {
      console.log('saveTip called with userId:', userId, 'tipId:', tipId);

      const tip = await this.communityRepository.getTipById(tipId);
      console.log('Retrieved Tip:', tip);

      if (!tip) {
        throw new ResourceNotFoundError('Tip not found', { tipId });
      }

      // user 데이터를 추가
      tip.user = {
        user_id: tip.user_id, // 기존 필드 사용
        nickname: 'Placeholder Nickname', // 필요시 적절한 기본값 사용
        profile_image_url: '', // 필요시 기본값 설정
      };

      const savedTip = await this.communityRepository.saveTip(userId, tipId);
      console.log('Saved Tip:', savedTip);

      const dto = toCommunityDto(tip, userId);
      console.log('DTO:', dto);
      return dto;
    } catch (error) {
      console.error('Error in saveTip:', error);
      throw new DatabaseError('An error occurred while saving the tip.', error);
    }
  }

  // 팁 저장 취소
  public async removeSave(userId: number, tipId: number) {
    try {
      const tip = await this.communityRepository.getTipById(tipId);
      if (!tip) {
        throw new ResourceNotFoundError('Tip not found', { tipId });
      }

      await this.communityRepository.removeSave(userId, tipId); // 저장 취소
      return { message: 'Tip successfully removed from saved' }; // 저장 취소에 대한 응답
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error; // 팁을 찾을 수 없을 때 발생하는 에러
      }
      throw new DatabaseError(
        'An error occurred while removing the saved tip.',
        error
      );
    }
  }

  // 팁 좋아요 (토글)
  public async likeTip(userId: number, tipId: number) {
    try {
      // Validation: 이미 좋아요를 눌렀을 때 발생하는 에러 처리
      const existingLike = await this.communityRepository.getTipLike(
        userId,
        tipId
      );
      if (existingLike) {
        throw new ValidationError('Like already exists', { tipId, userId });
      }

      const tip = await this.communityRepository.getTipById(tipId);
      if (!tip) {
        throw new ResourceNotFoundError('Tip not found', { tipId });
      }

      await this.communityRepository.likeTip(userId, tipId); // 좋아요 처리
      return toCommunityDto(tip, userId); // 팁 DTO 반환
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error; // 이미 좋아요가 존재하는 경우의 에러
      } else if (error instanceof ResourceNotFoundError) {
        throw error; // 팁을 찾을 수 없을 때 발생하는 에러
      }
      throw new DatabaseError('An error occurred while liking the tip.', error);
    }
  }

  // 좋아요 삭제
  public async removeLike(userId: number, tipId: number) {
    try {
      const tip = await this.communityRepository.getTipById(tipId);
      if (!tip) {
        throw new ResourceNotFoundError('Tip not found', { tipId });
      }

      await this.communityRepository.removeLike(userId, tipId); // 좋아요 취소
      return { message: 'Like successfully removed' }; // 좋아요 취소에 대한 응답
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error; // 팁을 찾을 수 없을 때 발생하는 에러
      }
      throw new DatabaseError(
        'An error occurred while removing the like.',
        error
      );
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
}
