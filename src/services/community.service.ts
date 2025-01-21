import { CommunityRepository } from '../repositories/community.repository.js';
import { toCommunityDto } from '../dtos/community.dto.js';
import { Tip } from '../dtos/community.dto.js';
import { 
  ResourceNotFoundError,
  ValidationError,
  DatabaseError
} from '../errors';  // 에러 클래스 import

export class CommunityService {
  private communityRepository: CommunityRepository;

  constructor() {
    this.communityRepository = new CommunityRepository();
  }

  // 팁 생성
  public async createTip(data: { userId: number; title: string; content: string; category: string }) {
    try {
      // Validation: 중복된 팁을 생성하려 할 때 발생하는 에러 처리
      const existingTip = await this.communityRepository.getTipByTitle(data.title);
      if (existingTip) {
        throw new ValidationError('Duplicate tip title', { title: data.title });
      }

      const newTip: Tip = await this.communityRepository.createTip(data);

      // Validation: 생성된 팁이 필요한 필드를 포함하도록 처리
      newTip.user = { user_id: data.userId, nickname: "Unknown", profile_image_url: "" }; // 예시: 기본값 처리
      newTip.likes = newTip.likes || [];
      newTip.comments = newTip.comments || [];
      newTip.media = newTip.media || [];

      return toCommunityDto(newTip, data.userId);  // 팁 DTO 반환
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error; // 중복 팁 오류는 그대로 던짐
      }
      throw new DatabaseError('An error occurred while creating the tip.', error);
    }
  }

  // 팁 조회
  public async getTipById(tipId: number, currentUserId: number) {
    try {
      const tip: Tip | null = await this.communityRepository.getTipById(tipId);
      if (!tip) {
        throw new ResourceNotFoundError('Tip not found', { tipId });
      }

      return toCommunityDto(tip, currentUserId);  // 팁 DTO 반환
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;  // 팁을 찾을 수 없을 때 발생하는 에러
      }
      throw new DatabaseError('An error occurred while retrieving the tip.', error);
    }
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
        nickname: "Placeholder Nickname", // 필요시 적절한 기본값 사용
        profile_image_url: "", // 필요시 기본값 설정
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
  

  // 팁 좋아요 (토글)
  public async likeTip(userId: number, tipId: number) {
    try {
      // Validation: 이미 좋아요를 눌렀을 때 발생하는 에러 처리
      const existingLike = await this.communityRepository.getTipLike(userId, tipId);
      if (existingLike) {
        throw new ValidationError('Like already exists', { tipId, userId });
      }

      const tip = await this.communityRepository.getTipById(tipId);
      if (!tip) {
        throw new ResourceNotFoundError('Tip not found', { tipId });
      }

      await this.communityRepository.likeTip(userId, tipId);  // 좋아요 처리
      return toCommunityDto(tip, userId);  // 팁 DTO 반환
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;  // 이미 좋아요가 존재하는 경우의 에러
      } else if (error instanceof ResourceNotFoundError) {
        throw error;  // 팁을 찾을 수 없을 때 발생하는 에러
      }
      throw new DatabaseError('An error occurred while liking the tip.', error);
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
      const newComment = await this.communityRepository.commentOnTip(userId, tipId, comment);
      if (!newComment) {
        throw new ValidationError('Comment creation failed', { tipId, comment });
      }

      return newComment;  // 댓글 정보 반환
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw error;  // 팁을 찾을 수 없을 때 발생하는 에러
      } else if (error instanceof ValidationError) {
        throw error;  // 댓글 작성 실패 에러
      }
      throw new DatabaseError('An error occurred while commenting on the tip.', error);
    }
  }
}