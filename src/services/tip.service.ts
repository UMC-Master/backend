import { TipRepository } from '../repositories/tip.repository.js';
import { toTipDto } from '../dtos/tip.dto.js';
import { HashtagRepository } from '../repositories/hashtag.repository.js';
import { ValidationError } from '../errors/errors.js'; 
import {HashtagNotFoundError} from '../errors/hashtag.error.js' //해시태그 에러 클래스 추가 

export class TipService {
  private tipRepository: TipRepository;
  private hashtagRepository: HashtagRepository;

  constructor() {
    this.tipRepository = new TipRepository();
    this.hashtagRepository = new HashtagRepository();
  }

  // 팁 생성 (미디어 추가 포함)
  public async createTip(data: {
    userId: number;
    title: string;
    content: string;
    hashtags: string[];
    imageUrls: { media_url: string; media_type: string }[];
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

    // 3. 해시태그 처리 및 연결
    const hashtagIds = await Promise.all(
      data.hashtags.map(async (hashtag) => {
        const existingHashtag = await this.hashtagRepository.getByName(hashtag.trim());

        if (!existingHashtag) {
          throw new HashtagNotFoundError({ hashtag });
        }
        return existingHashtag.hashtag_id;
      })
    );

    await this.tipRepository.associateHashtagsWithTip(newTip.tips_id, Array.from(new Set(hashtagIds)));

    // 4. 미디어 저장
    if (data.imageUrls && data.imageUrls.length > 0) {
      await this.tipRepository.saveImages(newTip.tips_id, data.imageUrls);
    }

    // 5. 연결된 해시태그 가져오기
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
          images: data.imageUrls, // 업로드된 미디어 포함
        },
      },
    };
  }

  // 팁 아이디로 팁 조회 (해시태그 변환 추가)
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


  public async updateTip(tipId: number, title: string, content: string, newImages: { media_url: string; media_type: string }[]) {
    // ✅ media_type을 ENUM 값으로 변환
    const newImagesWithEnum = newImages.map((img) => ({
      media_url: img.media_url,
      media_type: this.tipRepository.getMediaType(img.media_type), // ✅ ENUM 변환
    }));

    return await this.tipRepository.updateTip(tipId, title, content, newImagesWithEnum);
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
    return tips.map(tip => ({
      tipId: tip.tips_id,
      title: tip.title,
      content: tip.content,
      author: tip.user
        ? {
            userId: tip.user.user_id,
            nickname: tip.user.nickname,
            profileImageUrl: tip.user.profile_image_url,
          }
        : null,
      hashtags: tip.hashtags.map(h => ({
        hashtagId: h.hashtag.hashtag_id,
        name: h.hashtag.name,
      })),
      imageUrls: tip.media.map(media => ({
        media_url: media.media_url,
        media_type: media.media_type,
      })),
      createdAt: tip.created_at,
      updatedAt: tip.updated_at,
    }));
  }

   // ✅ 정렬된 팁 조회 (좋아요, 저장 개수를 포함)
   public async getSortedTips(page: number, limit: number, sort: string) {
    const skip = (page - 1) * limit;
    const tips = await this.tipRepository.getSortedTips(skip, limit);
  
    // 정렬 적용 (좋아요순, 북마크순)
    if (sort === 'likes') {
      tips.sort((a, b) => (b._count.likes || 0) - (a._count.likes || 0)); // 좋아요 개수 내림차순
    } else if (sort === 'saves') {
      tips.sort((a, b) => (b._count.saves || 0) - (a._count.saves || 0)); // 북마크 개수 내림차순
    }
  
    return tips.map((tip) => ({
      tipId: tip.tips_id,
      title: tip.title,
      content: tip.content,
      author: tip.user
        ? {
            userId: tip.user.user_id,
            nickname: tip.user.nickname,
            profileImageUrl: tip.user.profile_image_url,
          }
        : null,
      hashtags: tip.hashtags.map((h) => ({
        hashtagId: h.hashtag.hashtag_id,
        name: h.hashtag.name,
      })),
      imageUrls: tip.media.map((media) => ({
        media_url: media.media_url,
        media_type: media.media_type,
      })),
      likesCount: tip._count.likes || 0, // ✅ 기본값 0 설정
      savesCount: tip._count.saves || 0, // ✅ 기본값 0 설정
      createdAt: tip.created_at,
      updatedAt: tip.updated_at,
    }));
  }
  
  

   // 팁 검색 기능
   public async searchTips(query: string, hashtags: string[], page: number, limit: number) {
    // ✅ 검색어 Validation (검색어가 없으면 예외 발생)
    if (!query) {
        throw new ValidationError("검색어(query)는 필수입니다.", null);
    }

    const skip = (page - 1) * limit;

    // ✅ 검색 실행 (검색어 + 해시태그 필터 적용)
    const tips = await this.tipRepository.searchTips(query, hashtags, skip, limit);

    // ✅ 검색된 결과가 없으면 "없는 팁" 메시지 반환
    if (!tips || tips.length === 0) {
        return {
            isSuccess: true,
            message: "없는 팁",
            result: [],
        };
    }

    // ✅ 검색 결과 매핑하여 반환
    return {
        isSuccess: true,
        message: "팁 검색 성공",
        result: tips.map(tip => ({
            tipId: tip.tips_id,
            title: tip.title,
            content: tip.content,
            author: tip.user ? {
                userId: tip.user.user_id,
                nickname: tip.user.nickname,
                profileImageUrl: tip.user.profile_image_url
            } : null,
            hashtags: tip.hashtags.map(h => ({
                hashtagId: h.hashtag.hashtag_id,
                name: h.hashtag.name
            })),
            imageUrls: tip.media.map(media => ({
                media_url: media.media_url,
                media_type: media.media_type
            })),
            likesCount: tip.likes.length || 0, // ✅ 좋아요 기본값 0
            savesCount: tip.saves.length || 0, // ✅ 북마크 기본값 0
            createdAt: tip.created_at,
            updatedAt: tip.updated_at
        })),
    };
}

 //팁 상세 조회 
 public async getTipDetail(tipId: number) {
  const tip = await this.tipRepository.getTipById(tipId);
  if (!tip) {
    return null;
  }

  return {
    tipId: tip.tips_id,
    title: tip.title,
    content: tip.content,
    author: tip.user
      ? {
          userId: tip.user.user_id,
          nickname: tip.user.nickname,
          profileImageUrl: tip.user.profile_image_url,
        }
      : null,
    hashtags: tip.hashtags.map((h) => ({
      hashtagId: h.hashtag.hashtag_id,
      name: h.hashtag.name,
    })),
    imageUrls: tip.media.map((media) => ({
      media_url: media.media_url,
      media_type: media.media_type,
    })),
    likesCount: tip.likes.length || 0,
    savesCount: tip.saves.length || 0,
    createdAt: tip.created_at,
    updatedAt: tip.updated_at,
  };
}

}
