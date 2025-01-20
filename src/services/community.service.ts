import { CommunityRepository } from '../repositories/community.repository.js';
import { toCommunityDto } from '../dtos/community.dto.js';
import { Tip } from '../dtos/community.dto.js'; // Tip 타입 import
import { 
  TipNotFoundError, 
  DuplicateTipError, 
  CommentNotFoundError, 
  LikeAlreadyExistError, 
} from '../errors'; // 에러 클래스 import

export class CommunityService {
  private communityRepository: CommunityRepository;

  constructor() {
    this.communityRepository = new CommunityRepository();
  }

  // 팁 생성
  public async createTip(data: { userId: number; title: string; content: string; category: string }) {
    // Validation: 중복된 팁을 생성하려 할 때 발생하는 에러 처리
    const existingTip = await this.communityRepository.getTipByTitle(data.title);
    if (existingTip) {
      throw new DuplicateTipError(data.title);
    }

    const newTip: Tip = await this.communityRepository.createTip(data);

    // Validation: 생성된 팁이 필요한 필드를 포함하도록 처리
    newTip.user = { user_id: data.userId, nickname: "Unknown", profile_image_url: "" }; // 예시: 기본값 처리
    newTip.likes = newTip.likes || [];
    newTip.comments = newTip.comments || [];
    newTip.media = newTip.media || [];

    return toCommunityDto(newTip);  // toCommunityDto 사용
  }

  // 팁 조회
  public async getTipById(tipId: number) {
    const tip: Tip | null = await this.communityRepository.getTipById(tipId);
    if (!tip) {
      throw new TipNotFoundError(tipId);  // 팁을 찾을 수 없을 때 발생하는 에러 처리
    }

    return toCommunityDto(tip);  // toCommunityDto 사용
  }

  // 팁 저장 (토글)
  public async saveTip(userId: number, tipId: number) {
    const tip = await this.communityRepository.getTipById(tipId);
    if (!tip) {
      throw new TipNotFoundError(tipId);  // 팁을 찾을 수 없을 때 발생하는 에러 처리
    }

    await this.communityRepository.saveTip(userId, tipId);
    return toCommunityDto(tip);  // toCommunityDto 사용
  }

  // 팁 좋아요 (토글)
  public async likeTip(userId: number, tipId: number) {
    // Validation: 이미 좋아요를 눌렀을 때 발생하는 에러 처리
    const existingLike = await this.communityRepository.getTipLike(userId, tipId);
    if (existingLike) {
      throw new LikeAlreadyExistError(tipId, userId);  // 이미 좋아요를 눌렀을 때 발생하는 에러
    }

    const tip = await this.communityRepository.getTipById(tipId);
    if (!tip) {
      throw new TipNotFoundError(tipId);  // 팁을 찾을 수 없을 때 발생하는 에러 처리
    }

    await this.communityRepository.likeTip(userId, tipId);
    return toCommunityDto(tip);  // toCommunityDto 사용
  }

  // 팁에 댓글 작성
  public async commentOnTip(userId: number, tipId: number, comment: string) {
    const tip = await this.communityRepository.getTipById(tipId);
    if (!tip) {
      throw new TipNotFoundError(tipId);  // 팁을 찾을 수 없을 때 발생하는 에러 처리
    }

    // 댓글을 찾을 수 없을 때 발생하는 에러 처리
    const newComment = await this.communityRepository.commentOnTip(userId, tipId, comment);
    if (!newComment) {
      throw new CommentNotFoundError(tipId);  // 댓글이 존재하지 않을 경우
    }

    return newComment;  // 댓글은 CommunityDto 형식으로 변환할 필요가 없음
  }
}
