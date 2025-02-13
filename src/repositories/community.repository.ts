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

    // 특정 커뮤니티 ID로 조회 (DB 접근만)
    async findCommunityById(communityId: number) {
      return await prisma.community.findUnique({
        where: { community_id: communityId },
      });
    }
  
    // 특정 사용자와 커뮤니티의 좋아요 여부 조회
    async findLikeByUserAndCommunity(userId: number, communityId: number) {
      return await prisma.communityLike.findFirst({
        where: { user_id: userId, community_id: communityId },
      });
    }
  
    // 좋아요 추가
    async addLike(userId: number, communityId: number) {
      return await prisma.communityLike.create({
        data: { user_id: userId, community_id: communityId },
      });
    }
  
    // 좋아요 삭제
    async removeLike(likeId: number) {
      return await prisma.communityLike.delete({
        where: { community_like_id: likeId },
      });
    }
  
    // 특정 사용자와 커뮤니티의 북마크 여부 조회
    async findBookmarkByUserAndCommunity(userId: number, communityId: number) {
      return await prisma.communityBookmark.findFirst({
        where: { user_id: userId, community_id: communityId },
      });
    }
  
    // 북마크 추가
    async addBookmark(userId: number, communityId: number) {
      return await prisma.communityBookmark.create({
        data: { user_id: userId, community_id: communityId },
      });
    }
  
    // 북마크 삭제
    async removeBookmark(bookmarkId: number) {
      return await prisma.communityBookmark.delete({
        where: { community_bookmark_id: bookmarkId },
      });
    }
}
