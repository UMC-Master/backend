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
public async createTip(data: {
  userId: number;
  title: string;
  content: string;
  hashtags: string[][];
}) {
  // 1. 중복된 팁 제목 검사
  const existingTip = await this.tipRepository.getTipByTitle(data.title);
  if (existingTip) {
    throw new ValidationError('Duplicate tip title', { title: data.title });
  }

  // 2. 팁 생성
  const newTip = await this.tipRepository.createTip({
    userId: data.userId,
    title: data.title,
    content: data.content,
  });

  // 3. 해시태그 처리 및 연결 (이중 배열 해제 후 정리)
  const flattenedHashtags = data.hashtags.flat(); // [["#food", "#travel"]] → ["#food", "#travel"]

  const hashtagIds = await Promise.all(
    flattenedHashtags.map(async (hashtag) => {
      const existingHashtag = await this.hashtagRepository.getByName(hashtag.trim());
      if (existingHashtag) {
        return existingHashtag.hashtag_id;
      }
      const newHashtag = await this.hashtagRepository.createHashtag(hashtag.trim(), 1);
      return newHashtag.hashtag_id;
    })
  );

  await this.tipRepository.associateHashtagsWithTip(newTip.tips_id, Array.from(new Set(hashtagIds)));

  // 4. 연결된 해시태그 가져오기
  const hashtags = await Promise.all(
    hashtagIds.map(async (id) => {
      const hashtag = await this.hashtagRepository.getById(id);
      return { hashtagId: id, name: hashtag?.name || 'Unknown' };
    })
  );

  return {
    isSuccess: true,
    message: '팁이 생성되었습니다.',
    result: {
      tip: {
        ...newTip,
        hashtags, // 연결된 해시태그 포함
      },
    },
  };
}


  // 팁 조회 (해시태그 변환 추가)
  public async getTipById(tipId: number) {
    const tip = await this.tipRepository.getTipById(tipId);

    return {
      ...tip,
      hashtags: tip.hashtags.map((h) => ({
        hashtag_id: h.hashtag.hashtag_id,
        name: h.hashtag.name,
      })),
    };
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
  public async getSortedTips(options: {
    page: number;
    limit: number;
    sort: string;
  }) {
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

   // 팁 검색 기능
   public async searchTips(query: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const tips = await this.tipRepository.searchTips(query, skip, limit); // ✅ `this.tipRepository` 오류 방지

    return tips.map((tip) => ({
      tipId: tip.tips_id,
      title: tip.title,
      description: tip.content,
      author: tip.user
        ? {
            userId: tip.user.user_id,
            nickname: tip.user.nickname,
            profileImageUrl: tip.user.profile_image_url,
          }
        : {
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
