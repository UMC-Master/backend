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
    hashtags: string[];
  }) {
    // 중복된 팁 제목 검사
    const existingTip = await this.tipRepository.getTipByTitle(data.title);
    if (existingTip) {
      throw new ValidationError('Duplicate tip title', { title: data.title });
    }

    // 팁 생성
    const newTip = await this.tipRepository.createTip({
      userId: data.userId,
      title: data.title,
      content: data.content,
    });

    // 해시태그 처리
    const hashtagIds = new Set<number>();

    for (const hashtag of data.hashtags) {
      let hashtagId: number;

      if (typeof hashtag === 'number') {
        hashtagId = hashtag;
      } else {
        let existingHashtag = await this.hashtagRepository.getByName(
          hashtag.trim()
        );
        if (!existingHashtag) {
          existingHashtag = await this.hashtagRepository.createHashtag(
            hashtag.trim(),
            1
          );
        }
        hashtagId = existingHashtag.hashtag_id;
      }

      hashtagIds.add(hashtagId); // ✅ 중복 방지
    }

    const hashtagMap = new Map<string, number>();

    for (const hashtag of data.hashtags) {
      let hashtagId: number;
      let existingHashtag = await this.hashtagRepository.getByName(
        hashtag.trim()
      );

      if (!existingHashtag) {
        existingHashtag = await this.hashtagRepository.createHashtag(
          hashtag.trim(),
          1
        );
      }
      hashtagId = existingHashtag.hashtag_id;

      hashtagMap.set(hashtag.trim(), hashtagId);
    }

    // 팁과 해시태그 연결 (Set → Array 변환)
    await this.tipRepository.associateHashtagsWithTip(
      newTip.tips_id,
      Array.from(hashtagIds)
    );

    // 해시태그 ID와 실제 이름 매칭
    const hashtagData = await Promise.all(
      Array.from(hashtagIds).map(async (id) => {
        const hashtag = await this.hashtagRepository.getById(id);
        return { hashtag_id: id, name: hashtag?.name || 'Unknown' };
      })
    );

    return {
      ...newTip,
      hashtags: hashtagData,
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
}
