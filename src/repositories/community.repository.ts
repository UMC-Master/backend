import { prisma } from '../db.config.js';

export class CommunityRepository {

  // 팁 ID로 조회
  async getTipById(tipId: number) {
    return await prisma.tip.findUnique({
      where: { tips_id: tipId },
      include: { likes: true, comments: true, media: true }  // 좋아요, 댓글, 미디어 포함
    });
  }

  // 사용자가 해당 팁을 좋아요 했는지 확인
  async getTipLike(userId: number, tipId: number) {
    return await prisma.tipLike.findFirst({
      where: {
        user_id: userId,
        tips_id: tipId
      }
    });
  }

  // 댓글 작성
  async commentOnTip(userId: number, tipId: number, comment: string) {
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
  async deleteComment(commentId: number) {
    return await prisma.comment.delete({
      where: { comment_id: commentId },
    });
  }

  // 댓글 수정
  async updateComment(commentId: number, newContent: string) {
    return await prisma.comment.update({
      where: { comment_id: commentId },
      data: { comment: newContent },
    });
  }

  // 좋아요 추가 
  async addLike(userId: number, tipId: number) {
    return await prisma.tipLike.create({
      data: { user_id: userId, tips_id: tipId },
    });
  }

  // 좋아요 삭제 
  async removeLike(userId: number, tipId: number) {

    const like = await prisma.tipLike.findFirst({
      where: { user_id: userId, tips_id: tipId },
    });

    // 만약 좋아요가 없는 경우 예외 처리
    if (!like || !like.like_id) {
      throw new Error("좋아요 기록이 없습니다.");
    }

    // 찾은 like_id를 사용하여 삭제
    return await prisma.tipLike.delete({
      where: { like_id: like.like_id },
    });
  }

  // 사용자가 특정 팁을 북마크했는지 확인
  async getBookmarkByUserAndTip(userId: number, tipId: number) {
    return await prisma.tipSave.findFirst({
      where: { user_id: userId, tips_id: tipId },
    });
  }

  // 북마크 추가
  async addBookmark(userId: number, tipId: number) {
    return await prisma.tipSave.create({
      data: { user_id: userId, tips_id: tipId },
    });
  }

  // 북마크 삭제
  async removeBookmark(saveId: number) {
    return await prisma.tipSave.delete({
      where: { save_id: saveId },
    });
  }

  // 사용자의 저장된 꿀팁 목록 조회
  async getSavedTips(userId: number) {
    return await prisma.tipSave.findMany({
      where: { user_id: userId },
      include: {
        tips: {
          select: {
            tips_id: true,
            title: true,
            content: true,
            created_at: true,
            user: {
              select: {
                user_id: true,
                nickname: true,
                profile_image_url: true,
              },
            },
            media: {
              select: {
                media_url: true,
                media_type: true,
              },
            },
            likes: {
              select: {
                like_id: true,
              },
            },
            saves: {
              select: {
                save_id: true,
              },
            } 
          },
        },
      },
    });
  }


  //전체 댓글 조회 
  async getAllComments() {
    return await prisma.comment.findMany({
      orderBy: { created_at: 'desc' }, // 최신 댓글 우선
      include: {
        user: {
          select: {
            user_id: true,
            nickname: true,
            profile_image_url: true,
          },
        },
        tips: {
          select: {
            title: true,
          },
        },
      },
    });
  }

  // 특정 댓글 상세 조회
  async getCommentById(commentId: number) {
    return await prisma.comment.findUnique({
      where: { comment_id: commentId },
      include: {
        user: {
          select: {
            user_id: true,
            nickname: true,
            profile_image_url: true,
          },
        },
        tips: {
          select: {
            tips_id: true,
            title: true,
          },
        },
      },
    });
  }

}
