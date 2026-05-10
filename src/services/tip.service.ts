import { TipRepository } from '../repositories/tip.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { HashtagRepository } from '../repositories/hashtag.repository.js';
import { ValidationError, TipNotFoundError } from '../errors/errors.js';
import { HashtagNotFoundError } from '../errors/hashtag.error.js'; //해시태그 에러 클래스 추가

export class TipService {
  private tipRepository: TipRepository;
  private hashtagRepository: HashtagRepository;
  private userRepository: UserRepository;

  constructor() {
    this.tipRepository = new TipRepository();
    this.hashtagRepository = new HashtagRepository();
    this.userRepository = new UserRepository();
  }

  // 팁 생성 (미디어 추가 포함)
  public async createTip(data: {
    userId: number;
    title: string;
    content: string;
    hashtags: string[];
    imageUrls: { media_url: string; media_type: string }[];
  }) {
    //  유저 정보 가져오기 (인플루언서 여부 확인)
    const user = await this.userRepository.findUserById(data.userId);
    if (!user) {
      throw new ValidationError('유효하지 않은 사용자입니다.', null);
    }
    const isInfluencer = user.role === 'INFLUENCER'; // 인플루언서 여부 판단

    // 기존 팁 생성 로직 유지
    const newTip = await this.tipRepository.createTip({
      userId: data.userId,
      title: data.title,
      content: data.content,
    });

    const hashtagIds = await Promise.all(
      data.hashtags.map(async (hashtag) => {
        const existingHashtag = await this.hashtagRepository.getByName(
          hashtag.trim()
        );

        if (!existingHashtag) {
          throw new HashtagNotFoundError({ hashtag });
        }
        return existingHashtag.hashtag_id;
      })
    );

    await this.tipRepository.associateHashtagsWithTip(
      newTip.tips_id,
      Array.from(new Set(hashtagIds))
    );

    // 해시태그 연결, 미디어 저장 로직 유지
    if (data.imageUrls.length > 0) {
      await this.tipRepository.saveImages(newTip.tips_id, data.imageUrls);
    }

    return {
      isSuccess: true,
      message: '팁이 생성되었습니다.',
      result: {
        tip: {
          ...newTip,
          isInfluencer, // 응답에 인플루언서 여부 포함
          hashtags: data.hashtags,
          images: data.imageUrls,
        },
      },
    };
  }

  public async updateTip(
    tipId: number,
    title: string,
    content: string,
    newImages: { media_url: string; media_type: string }[]
  ) {
    return await this.tipRepository.updateTip(tipId, title, content, newImages);
  }

  // 팁 삭제
  public async deleteTip(tipId: number) {
    await this.tipRepository.deleteTip(tipId);
    return { isSuccess: true, message: 'Tip successfully deleted' };
  }

  // 전체 팁 조회 (페이지네이션 포함)
  public async getAllTips(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const tips = await this.tipRepository.getAllTips(skip, limit);
    return tips.map(this.mapTipToListItem);
  }

  // 정렬된 팁 조회 (좋아요, 저장 개수를 포함)
  public async getSortedTips(page: number, limit: number, sort: string) {
    const skip = (page - 1) * limit;
    const tips = await this.tipRepository.getSortedTips(skip, limit, sort);
    return tips.map(this.mapTipToListItem);
  }

  // 팁 상세 조회 서비스
  public async getTipInfo(tipId: number, userId: number | null | undefined) {
    const tip = await this.tipRepository.getTipById(tipId);
    if (!tip) throw new TipNotFoundError(tipId);

    // 현재 로그인한 사용자의 좋아요 및 북마크 여부 확인
    const [isLiked, isBookmarked] = await Promise.all([
      userId ? this.tipRepository.isTipLikedByUser(tipId, userId) : Promise.resolve(false),
      userId ? this.tipRepository.isTipSavedByUser(tipId, userId) : Promise.resolve(false),
    ]);

    return {
      tipId: tip.tips_id,
      title: tip.title,
      content: tip.content,
      createdAt: tip.created_at,
      user: {
        userId: tip.user.user_id,
        nickname: tip.user.nickname,
        profileImageUrl: tip.user.profile_image_url,
        isInfluencer: tip.user.role === 'INFLUENCER',
      },
      hashtags: tip.hashtags.map((h: any) => h.hashtag.name),
      media: tip.media.map((m: any) => ({
        mediaUrl: m.media_url,
        mediaType: m.media_type,
      })),
      isLiked,
      isBookmarked,
      likesCount: tip.likes.length,
      savesCount: tip.saves.length,
    };
  }

  // 팁 검색 기능
  public async searchTips(
    query: string | null,
    hashtags: string[],
    page: number,
    limit: number,
    sort: string
  ) {
    const skip = (page - 1) * limit;

    // // 둘 다 입력되지 않으면 예외 처리
    // if (!query && hashtags.length === 0) {
    //   throw new ValidationError(
    //     '검색어 또는 해시태그 중 하나는 반드시 입력해야 합니다.',
    //     null
    //   );
    // }

    // 검색어가 있을 경우, 공백으로만 이루어진 값은 예외 처리
    if (query && query.trim() === '') {
      throw new ValidationError('검색어에는 공백만 포함될 수 없습니다.', null);
    }

    // Repository에서 검색 실행
    const tips = await this.tipRepository.searchTips(
      query,
      hashtags,
      skip,
      limit,
      sort
    );

    // 검색 결과 반환
    return {
      isSuccess: true,
      message: tips.length ? '팁 검색 성공' : '검색 결과가 없습니다.',
      result: tips.map(this.mapTipToListItem),
    };
  }

  // 정렬된 팁 조회 (좋아요, 저장 개수를 포함)
  public async getSortedInfluencerTips(
    page: number,
    limit: number,
    sort: string
  ) {
    const skip = (page - 1) * limit;
    const tips = await this.tipRepository.getSortedInfluencerTips(skip, limit, sort);
    return tips.map(this.mapTipToListItem);
  }

  // 팁 목록 응답 형식 통일 매핑 함수
  private mapTipToListItem(tip: any) {
    return {
      tipId: tip.tips_id,
      title: tip.title,
      content: tip.content,
      author: tip.user
        ? {
            userId: tip.user.user_id,
            nickname: tip.user.nickname,
            profileImageUrl: tip.user.profile_image_url,
            isInfluencer: tip.user.role === 'INFLUENCER',
          }
        : null,
      hashtags: tip.hashtags.map((h: any) => ({
        hashtagId: h.hashtag.hashtag_id,
        name: h.hashtag.name,
      })),
      imageUrls: tip.media.map((media: any) => ({
        mediaUrl: media.media_url,
        mediaType: media.media_type,
      })),
      likesCount: tip._count?.likes ?? 0, // 기본값 0 설정
      savesCount: tip._count?.saves ?? 0, // 기본값 0 설정
      createdAt: tip.created_at,
      updatedAt: tip.updated_at,
    };
  }
}
