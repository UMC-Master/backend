export interface BookmarkDto {
    bookmarkId: number; // TipSave 또는 MagazineBookmark ID
    type: 'tip' | 'magazine'; // 북마크 타입
    title: string; // 팁 제목 또는 매거진 제목
    description?: string; // 팁 내용 또는 매거진 설명 (선택적)
    mediaUrl: string; // 미디어 URL (대표 이미지)
    bookmarkedAt: Date; // 북마크한 시간
}

