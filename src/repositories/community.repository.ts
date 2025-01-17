// community.repository.ts
import { PrismaClient } from '@prisma/client';

export class CommunityRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // 새 팁 생성
  public async createTip(data: { userId: number; title: string; content: string; category: string }) {
    const newTip = await this.prisma.tip.create({
      data: {
        user_id: data.userId,
        title: data.title,
        content: data.content,
        category: data.category,
      },
    });
    return newTip;
  }

  // 팁 ID로 팁 조회
  public async getTipById(tipId: number) {
    const tip = await this.prisma.tip.findUnique({
      where: { tips_id: tipId },
      include: { user: true, media: true, likes: true, comments: true },
    });
    return tip;
  }

  // 팁 저장 (토글 방식)
  public async saveTip(userId: number, tipId: number) {
    const existingSave = await this.prisma.tipSave.findFirst({
      where: { user_id: userId, tips_id: tipId },
    });

    if (existingSave) {
      await this.prisma.tipSave.delete({
        where: { save_id: existingSave.save_id },
      });
    } else {
      await this.prisma.tipSave.create({
        data: { user_id: userId, tips_id: tipId },
      });
    }
  }

  // 팁 좋아요 (토글 방식)
  public async likeTip(userId: number, tipId: number) {
    const existingLike = await this.prisma.tipLike.findFirst({
      where: { user_id: userId, tips_id: tipId },
    });

    if (existingLike) {
      await this.prisma.tipLike.delete({
        where: { like_id: existingLike.like_id },
      });
    } else {
      await this.prisma.tipLike.create({
        data: { user_id: userId, tips_id: tipId },
      });
    }
  }

  // 팁에 댓글 작성
  public async commentOnTip(userId: number, tipId: number, comment: string) {
    const newComment = await this.prisma.comment.create({
      data: {
        user_id: userId,
        tips_id: tipId,
        comment: comment,
      },
    });
    return newComment;
  }
}
