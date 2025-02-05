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

  // 팁과 해시태그 연결 (중복 방지)
  public async associateHashtagsWithTip(tips_id: number, hashtagIds: number[]) {
    const data = hashtagIds.map((hashtag_id) => ({
      tips_id,
      hashtag_id,
    }));

    return await prisma.tipHashtag.createMany({
      data,
      skipDuplicates: true, // ✅ 중복 방지
    });
  }

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
  }//팁 정보 반환 
}
