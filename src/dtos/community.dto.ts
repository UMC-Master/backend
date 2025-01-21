// community.dto.ts
import { MediaDto } from './media.dto';

// CommunityDto 인터페이스 정의
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

// MediaDto 정의
export interface MediaDto {
  mediaId: number;
  mediaUrl: string;
  mediaType: 'image' | 'video'; // 미디어 타입
}

// Tip 타입 정의
export interface Tip {
  tips_id: number;
  title: string;
  content: string;
  category: string;
  user: {
    user_id: number; // 데이터베이스에서 제공되는 user_id
    nickname: string;
    profile_image_url: string;
  };
  created_at: Date;
  updated_at: Date;
  likes: { user_id: number }[];
  comments: any[];
  media: { media_id: number; media_url: string; media_type: 'image' | 'video' }[];
}

// CommunityDto 형식으로 변환하는 함수
export function toCommunityDto(tip: Tip, currentUserId: number): CommunityDto {
  return {
    tipId: tip.tips_id,
    title: tip.title,
    content: tip.content,
    category: tip.category,
    author: {
      userId: tip.user?.user_id,
      nickname: tip.user.nickname || "Unknown",
      profileImageUrl: tip.user.profile_image_url || "",
    },
    createdAt: tip.created_at,
    updatedAt: tip.updated_at,
    likesCount: tip.likes.length,
    commentsCount: tip.comments.length,
    isLiked: tip.likes.some((like) => like.user_id === currentUserId), // 수정: currentUserId와 비교
    mediaList: toMediaDtoList(tip.media),
  };
}

// Media 데이터를 MediaDto 형식으로 변환하는 함수
export function toMediaDtoList(media: any[]): MediaDto[] {
  return media.map((item) => ({
    mediaId: item.media_id,
    mediaUrl: item.media_url,
    mediaType: item.media_type,
  }));
}
