// bookmark.service.ts
import { BookmarkRepository } from '../repositories/bookmark.repository.js';
import { BookmarkDto } from '../dtos/bookmark.dto.js'; // DTO 임포트


export class BookmarkService {
  private bookmarkRepository: BookmarkRepository;

  constructor() {
    this.bookmarkRepository = new BookmarkRepository();
  }

  // 사용자가 저장한 북마크 목록 조회
  public async getUserBookmarks(userId: number): Promise<BookmarkDto[]> {
    return await this.bookmarkRepository.getUserBookmarks(userId);
  }

  // 북마크 삭제
  public async deleteBookmark(bookmarkId: number): Promise<void> {
    await this.bookmarkRepository.deleteBookmark(bookmarkId);
  }
}
