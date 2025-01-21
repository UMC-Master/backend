// bookmark.repository.ts
import { prisma } from '../db.config.js';
import { BookmarkDto } from '../dtos/bookmark.dto.js'; // DTO 임포트

export class BookmarkRepository {
  // 사용자가 저장한 북마크 목록 조회
  public async getUserBookmarks(userId: number): Promise<BookmarkDto[]> {
    const bookmarks = await prisma.tipSave.findMany({
      where: { user_id: userId },
      include: {
        tips: true, // 팁 정보를 함께 가져오기
      },
    });

    return bookmarks.map((bookmark) => ({
      saveId: bookmark.save_id,
      userId: bookmark.user_id,
      tipsId: bookmark.tips_id,
      scrapedAt: bookmark.scraped_at, // scraped_at을 사용
    }));
  }


  // 북마크 삭제
  public async deleteBookmark(bookmarkId: number): Promise<void> {
    await prisma.tipSave.delete({
      where: { save_id: bookmarkId },
    });
  }
}
