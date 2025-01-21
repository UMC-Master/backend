import { prisma } from '../db.config.js';

export class TipRepository {

  // 팁 제목으로 조회
  public async getTipByTitle(title: string) {
    return await prisma.tip.findFirst({
      where: { title },
    });
  }

  // 팁 ID로 조회
  public async getTipById(tipId: number) {
    return await prisma.tip.findUnique({
      where: { tips_id: tipId },
      include: { likes: true, comments: true, media: true }  // 좋아요, 댓글, 미디어 포함
    });
  }

  // 팁 생성
  public async createTip(data: { userId: number; title: string; content: string }) {
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
}
