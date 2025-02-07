import { TipRepository } from '../repositories/tip.repository.js';
import { toTipDto } from '../dtos/tip.dto.js';
import { HashtagRepository } from '../repositories/hashtag.repository.js';
import { ValidationError } from '../errors/errors.js'; // 에러 클래스 추가

export class TipService {
  private tipRepository: TipRepository;
  private hashtagRepository: HashtagRepository;

  constructor() {
    this.tipRepository = new TipRepository();
    this.hashtagRepository = new HashtagRepository();
  }

  // 팁 생성
  public async createTip(data: { userId: number; title: string; content: string; hashtags: string[] }) {
    // 중복된 팁 제목 검사
    const existingTip = await this.tipRepository.getTipByTitle(data.title);
    if (existingTip) {
      throw new ValidationError('Duplicate tip title', { title: data.title });
    }

    // 팁 생성
    const newTip = await this.tipRepository.createTip({ userId: data.userId, title: data.title, content: data.content });

    // 해시태그 처리
    const hashtagIds = [];
    for (const hashtagName of data.hashtags) {
      let hashtag = await this.hashtagRepository.getByName(hashtagName);
      if (!hashtag) {
        // 해시태그가 없으면 새로 생성
        hashtag = await this.hashtagRepository.createHashtag(hashtagName, 1); // 예시로 `hashtag_type_id`는 1로 설정
      }
      hashtagIds.push(hashtag.hashtag_id);
    }

    // 팁과 해시태그 연결
    await this.tipRepository.associateHashtagsWithTip(newTip.tips_id, hashtagIds);

    return toTipDto(newTip);
  }

  // 팁 수정
  public async updateTip(tipId: number, title: string, content: string) {
    const updatedTip = await this.tipRepository.updateTip(
      tipId,
      title,
      content
    );
    return toTipDto(updatedTip);
  }

  // 팁 삭제
  public async deleteTip(tipId: number) {
    await this.tipRepository.deleteTip(tipId);
    return { isSuccess: true, message: 'Tip successfully deleted' };
  }
 // 전체 꿀팁 조회 (페이지네이션)
  public async getAllTips(options: { page: number; limit: number }) {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  return await this.tipRepository.getTips(skip, limit);
}

// 정렬된 꿀팁 조회
public async getSortedTips(options: { page: number; limit: number; sort: string }) {
  const { page, limit, sort } = options;
  const skip = (page - 1) * limit;

  let orderBy;
  if (sort === 'popular') {
    orderBy = { likes: { _count: 'desc' } }; // 좋아요 기준 정렬
  } else if (sort === 'saved') {
    orderBy = { saves: { _count: 'desc' } }; // 저장 기준 정렬
  } else {
    orderBy = { created_at: 'desc' }; // 최신순 정렬
  }

  return await this.tipRepository.getTips(skip, limit, orderBy);
}

//꿀팁 검색 기능 (제목, 내용, 해시태그그)
public async searchTips(query: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const tips = await this.tipRepository.searchTips(query, skip, limit);

  return tips.map((tip) => ({
    tipId: tip.tips_id,
    title: tip.title,
    description: tip.content,
    author: tip.user
      ? { // ✅ `user` 필드가 존재할 경우만 사용
          userId: tip.user.user_id,
          nickname: tip.user.nickname,
          profileImageUrl: tip.user.profile_image_url,
        }
      : { // ❗ `user` 정보가 없을 경우 기본값 설정
          userId: null,
          nickname: "Unknown User",
          profileImageUrl: null,
        },
    createdAt: tip.created_at,
    updatedAt: tip.updated_at,
    likesCount: tip.likes.length,
    commentsCount: tip.comments.length,
    hashtags: tip.hashtags.map((h) => ({
      hashtagId: h.hashtag.hashtag_id,
      name: h.hashtag.name,
    })),
  }));
}

}
