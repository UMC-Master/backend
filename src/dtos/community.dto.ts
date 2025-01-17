import { MediaDto } from './media.dto'; 

export interface CommunityDto {
    tipId: number; // 팁 ID
    title: string; // 팁 제목
    content: string; // 팁 내용
    category: string; // 카테고리
    author: {
      userId: number; // 작성자 ID
      nickname: string; // 작성자 닉네임
      profileImageUrl?: string; // 작성자 프로필 이미지
    };

    createdAt: Date; // 생성일
    updatedAt: Date; // 수정일
    likesCount: number; // 좋아요 수
    commentsCount: number; // 댓글 수
    isLiked: boolean; // 현재 사용자가 좋아요를 눌렀는지 여부
    mediaList: MediaDto[]; // 첨부된 미디어 리스트

}
  