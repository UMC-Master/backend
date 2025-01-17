// community.service.ts
import { CommunityRepository } from '../repositories/community.repository.js';
import { toCommunityDto } from '../dtos/community.dto.js';
import { Tip } from '../dtos/community.dto.js'; // Tip 타입 import

export class CommunityService {
  private communityRepository: CommunityRepository;

  constructor() {
    this.communityRepository = new CommunityRepository();
  }

  // 팁 생성
  public async createTip(data: { userId: number; title: string; content: string; category: string }) {
    const newTip: Tip = await this.communityRepository.createTip(data);
    return toCommunityDto(newTip);  // toCommunityDto 사용
  }

  // 팁 조회
  public async getTipById(tipId: number) {
    const tip: Tip = await this.communityRepository.getTipById(tipId);
    return toCommunityDto(tip);  // toCommunityDto 사용
  }

  // 팁 저장 (토글)
  public async saveTip(userId: number, tipId: number) {
    await this.communityRepository.saveTip(userId, tipId);
    const tip: Tip = await this.communityRepository.getTipById(tipId);
    return toCommunityDto(tip);  // toCommunityDto 사용
  }

  // 팁 좋아요 (토글)
  public async likeTip(userId: number, tipId: number) {
    await this.communityRepository.likeTip(userId, tipId);
    const tip: Tip = await this.communityRepository.getTipById(tipId);
    return toCommunityDto(tip);  // toCommunityDto 사용
  }

  // 팁에 댓글 작성
  public async commentOnTip(userId: number, tipId: number, comment: string) {
    const newComment = await this.communityRepository.commentOnTip(userId, tipId, comment);
    return newComment;  // 댓글은 CommunityDto 형식으로 변환할 필요가 없음
  }
}
