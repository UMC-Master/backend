import { PrismaClient } from '@prisma/client';
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

  // 팁 ID로 조회
  async getTipById(tipId: number) {
    return await this.prisma.tip.findUnique({
      where: { tips_id: tipId },
      include: {
        hashtags: {
          include: {
            hashtag: true, // ✅ 실제 해시태그 정보 포함
          },
        },
      },
    });
  }

  // 팁 생성
  public async createTip(data: {
    userId: number;
    title: string;
    content: string;
  }) {
    return await prisma.tip.create({
      data: {
        title: data.title,
        content: data.content,
        user_id: data.userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }
  // 팁 수정
  public async updateTip(tipId: number, title: string, content: string) {
    return await prisma.tip.update({
      where: { tips_id: tipId },
      data: { title, content, updated_at: new Date() },
    });
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

  //팁 검색 기능 (제목, 내용, 해시태그 포함)
  public async searchTips(query: string, tags: string[], skip: number, take: number) {
    // URL 인코딩 문제 해결 (한글 디코딩)
    const decodedQuery = query ? decodeURIComponent(query) : "";
    const decodedTags = tags.map(tag => decodeURIComponent(tag));

    const whereClause: any = {
      OR: [
        { title: { contains: decodedQuery } }, // mode: "insensitive" 제거
        { content: { contains: decodedQuery } },
        {
          hashtags: {
            some: {
              hashtag: {
                name: { contains: decodedQuery }, // 검색어가 해시태그에도 포함될 수 있도록 설정
              },
            },
          },
        },
      ],
    };

    // 해시태그 필터가 있을 경우 추가
    if (decodedTags.length > 0) {
      whereClause.OR.push({
        hashtags: {
          some: {
            hashtag: {
              name: { in: decodedTags },
            },
          },
        },
      });
    }

    return await prisma.tip.findMany({
      where: whereClause,
      skip: skip,
      take: take,
      include: {
        hashtags: { include: { hashtag: true } },
        user: {
          select: {
            user_id: true,
            nickname: true,
            profile_image_url: true,
          },
        },
        likes: true,
        comments: true,
      },
    });
  }
}
