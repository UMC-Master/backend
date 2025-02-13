import { prisma } from '../db.config.js';

export class CommunityRepository {


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

// 댓글 ID로 댓글 조회
public async getCommentById(commentId: number) {
  return await prisma.comment.findUnique({
    where: { comment_id: commentId },
    include: {
      user: {
        select: {
          user_id: true,
          nickname: true,
          profile_image_url: true,
        },
      }, // 댓글 작성자 정보 포함 (필요시)
      tips: {
        select: {
          tips_id: true,
          title: true,
        },
      }, // 관련된 팁 정보 포함 (필요시)
    },
  });

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

  // 댓글 삭제
  public async deleteComment(commentId: number) {
    return await prisma.comment.delete({
      where: { comment_id: commentId },
    });
    }


    // 댓글 수정
  public async updateComment(commentId: number, newContent: string) {
  return await prisma.comment.update({
    where: { comment_id: commentId },
    data: { comment: newContent },
  });
  }
  
  async findLikeByUserAndTip(userId: number, tipId: number) {
    return await prisma.tipLike.findFirst({
      where: { user_id: userId, tips_id: tipId },
    });
  }

  async addLike(userId: number, tipId: number) {
    return await prisma.tipLike.create({
      data: { user_id: userId, tips_id: tipId },
    });
  }

  async removeLike(likeId: number) {
    return await prisma.tipLike.delete({
      where: { tip_like_id: likeId },
    });
  }

  async findBookmarkByUserAndTip(userId: number, tipId: number) {
    return await prisma.tipBookmark.findFirst({
      where: { user_id: userId, tips_id: tipId },
    });
  }

  async addBookmark(userId: number, tipId: number) {
    return await prisma.tipBookmark.create({
      data: { user_id: userId, tips_id: tipId },
    });
  }

  async removeBookmark(bookmarkId: number) {
    return await prisma.tipBookmark.delete({
      where: { tip_bookmark_id: bookmarkId },
    });
  }

    
}
