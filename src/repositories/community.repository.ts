import { prisma } from '../db.config.js';

export class CommunityRepository {
  // 팁 생성
  public async createTip(data: { userId: number; title: string; content: string; category: string }) {
    console.log(data);  // data 값 확인
    return await prisma.tip.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category, // category 추가
        user_id: data.userId,
        created_at: new Date(),
        updated_at: new Date(),
      }
    });
  }

  // 팁 제목으로 조회
  public async getTipByTitle(title: string) {
    return await prisma.tip.findFirst({
      where: { title }
    });
  }

  // 팁 ID로 조회
  public async getTipById(tipId: number) {
    return await prisma.tip.findUnique({
      where: { tips_id: tipId },
      include: { likes: true, comments: true, media: true }  // 좋아요, 댓글, 미디어 포함
    });
  }

  // 사용자가 해당 팁을 좋아요 했는지 확인
  public async getTipLike(userId: number, tipId: number) {
    return await prisma.tipLike.findFirst({
      where: {
        user_id: userId,
        tips_id: tipId
      }
    });
  }

  // 좋아요 토글 기능: 좋아요 추가 또는 제거
  public async likeTip(userId: number, tipId: number) {
    // 먼저 사용자가 이미 해당 팁에 좋아요를 눌렀는지 확인
    const existingLike = await this.getTipLike(userId, tipId);
    if (existingLike) {
      // 좋아요가 이미 존재하면 제거
      return await prisma.tipLike.delete({
        where: {
          like_id: existingLike.like_id
        }
      });
    } else {
      // 좋아요가 없으면 새로 추가
      return await prisma.tipLike.create({
        data: {
          user_id: userId,
          tips_id: tipId,
          liked_at: new Date(),
        }
      });
    }
  }

  // 댓글 작성
  public async commentOnTip(userId: number, tipId: number, comment: string) {
    return await prisma.comment.create({
      data: {
        user_id: userId,
        tips_id: tipId,
        comment,
        created_at: new Date()
      }
    });
  }

  // 팁 저장 처리
  public async saveTip(userId: number, tipId: number) {
    return await prisma.tipSave.create({
      data: {
        user_id: userId,
        tips_id: tipId,
        scraped_at: new Date()
      }
    });
  }
}
