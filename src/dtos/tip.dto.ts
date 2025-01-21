export interface TipDto {
  tipId: number; // 팁 ID (tips_id)
  title: string; // 팁 제목
  description: string; // 팁 내용
  author: {
    userId: number; // 작성자 ID (user_id)
    nickname: string; // 작성자 닉네임
    profileImageUrl: string; // 작성자 프로필 이미지 URL
  };
  createdAt: Date; // 생성일
  updatedAt: Date; // 수정일
  likesCount: number; // 좋아요 수
  commentsCount: number; // 댓글 수
}

// Tip 데이터에서 TipDto로 변환하는 함수
export function toTipDto(tip: any): TipDto {
  return {
    tipId: tip.tips_id,
    title: tip.title,
    description: tip.content,
    author: {
      userId: tip.user?.user_id,  // user 객체가 없으면 기본값 0
      nickname: tip.user?.nickname || "",  // 기본값 빈 문자열
      profileImageUrl: tip.user?.profile_image_url || "",  // 기본값 빈 문자열
    },
    createdAt: tip.created_at,
    updatedAt: tip.updated_at,
    
  };
}


// Tip 데이터 배열에서 TipDto 배열로 변환하는 함수
export function toTipDtoList(tips: any[]): TipDto[] {
  return tips.map((tip) => toTipDto(tip));
}

