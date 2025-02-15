import { PrismaClient , MediaType } from '@prisma/client';
import { prisma } from '../db.config.js';
export class TipRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient(); // ✅ Prisma 인스턴스 생성
  }

  // 팁 제목으로 조회
  public async getTipByTitle(title: string) {
    return await prisma.tip.findFirst({
      where: { title },
    });
  }

  //팁 ID 로 조회 (미디어 포함)
  public async getTipById(tipId: number) {
    return await prisma.tip.findUnique({
      where: { tips_id: tipId },
      include: {
        user: true,
        hashtags: { include: { hashtag: true } },
        likes: true,
        comments: true,
        media: true, // ✅ 업로드된 미디어 포함
      },
    });
  }

  public async createTip(data: { userId: number; title: string; content: string }) {
    return await prisma.tip.create({
      data: {
        user_id: data.userId,
        title: data.title,
        content: data.content,
      },
    });
  }

  // ✅ 이미지 저장 메서드 수정
  public async saveImages(tipId: number, images: { media_url: string; media_type: string }[]) {
    return await prisma.tipMedia.createMany({
      data: images.map((image) => ({
        tips_id: tipId,
        media_url: image.media_url,
        media_type: this.getMediaType(image.media_type), // ✅ ENUM 변환 추가
        uploaded_at: new Date(),
      })),
    });
  }

  // ✅ media_type 변환 함수 추가
  private getMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith("image/")) {
      return MediaType.image; // ✅ Prisma ENUM 값으로 변환
    } else if (mimeType.startsWith("video/")) {
      return MediaType.video;
    } else {
      throw new Error(`Unsupported media type: ${mimeType}`);
    }
  }

  // 팁 수정 (제목, 내용, 새 이미지 추가)
  public async updateTip(tipId: number, title: string, content: string, newImages: { media_url: string; media_type: string }[]) {
    const updatedTip = await prisma.tip.update({
      where: { tips_id: tipId },
      data: { title, content, updated_at: new Date() },
    });

    // 기존 이미지 삭제 (선택 사항)
    await prisma.tipMedia.deleteMany({ where: { tips_id: tipId } });

    // 새 이미지 추가
    if (newImages.length > 0) {
      await prisma.tipMedia.createMany({
        data: newImages.map((image) => ({
          tips_id: tipId,
          media_url: image.media_url,
          media_type: image.media_type as MediaType,
          uploaded_at: new Date(),
        })),
      });
    }

    return updatedTip;
  }

  // 팁 삭제
  public async deleteTip(tipId: number) {
    return await prisma.tip.delete({
      where: { tips_id: tipId },
    });
  }

  //해시태그 연결 
  public async associateHashtagsWithTip(tips_id: number, hashtagIds: number[]) {
    if (!hashtagIds || hashtagIds.length === 0) {
      console.log("❌ 저장할 해시태그가 없습니다.");
      return;
    }
  
    const data = hashtagIds.map((hashtag_id) => ({
      tips_id,
      hashtag_id,
    }));
  
    console.log("✅ 해시태그 저장 데이터:", data);
  
    await prisma.tipHashtag.createMany({
      data,
      skipDuplicates: true,
    });
  }

  // 전체 팁 조회 (페이지네이션 포함, 제목, 내용, 해시태그, 이미지 포함)
  public async getAllTips(skip: number, take: number) {
    return await prisma.tip.findMany({
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: {
        media: true, // ✅ 업로드된 이미지 포함
        hashtags: { include: { hashtag: true } }, // ✅ 해시태그 포함
        user: { select: { user_id: true, nickname: true, profile_image_url: true } }, // ✅ 작성자 정보 포함
      },
    });
  }


  //팁 정보 반환 
  public async getTips(skip: number, limit: number, orderBy?: object) {
    return await prisma.tip.findMany({
      skip,
      take: limit,
      orderBy,
      include: {
        likes: true, // 좋아요 정보 포함
        saves: true, // 저장 정보 포함
        hashtags: { include: { hashtag: true } }, // 해시태그 포함
      },
    });
  }


 // 정렬된 팁 조회 (DB 접근 전용)
 public async getSortedTips(skip: number, take: number, sort: string) {
  // 기본 정렬 (최신순)
  const orderBy = { created_at: 'desc' };

  if (sort === 'likes') {
    // ✅ 좋아요 개수를 기반으로 정렬하려면 count()를 별도로 조회해야 함
    return await prisma.tip.findMany({
      skip,
      take,
      include: {
        media: true,
        hashtags: { include: { hashtag: true } },
        user: { select: { user_id: true, nickname: true, profile_image_url: true } },
        tipLikes: true, // ✅ 좋아요 개수 확인 가능
        saves: true, // ✅ 저장 개수 확인 가능
      },
      orderBy: {
        tipLikes: { _count: 'desc' }, // ❌ Prisma에서 직접 지원 안됨 -> 해결 방법 필요
      },
    });
  }

  if (sort === 'saves') {
    return await prisma.tip.findMany({
      skip,
      take,
      include: {
        media: true,
        hashtags: { include: { hashtag: true } },
        user: { select: { user_id: true, nickname: true, profile_image_url: true } },
        tipLikes: true,
        saves: true,
      },
      orderBy: {
        saves: { _count: 'desc' }, // ❌ Prisma에서 직접 지원 안됨 -> 해결 방법 필요
      },
    });
  }

  return await prisma.tip.findMany({
    skip,
    take,
    orderBy,
    include: {
      media: true,
      hashtags: { include: { hashtag: true } },
      user: { select: { user_id: true, nickname: true, profile_image_url: true } },
      tipLikes: true,
      saves: true,
    },
  });
}

  //팁 검색 기능 (제목, 내용, 해시태그 포함)
  public async searchTips(query: string, skip: number, take: number) {
    return await prisma.tip.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
          {
            hashtags: {
              some: {
                hashtag: {
                  name: { contains: query },
                },
              },
            },
          },
        ],
      },
      skip,
      take,
      include: {
        hashtags: { include: { hashtag: true } },
        user: true,
        likes: true,
        comments: true,
        media: true,
        saves: true,
      },
    });
  }

  public async getTipDetailsById(tipId: number) {
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
    };
  }
}
