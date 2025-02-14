export interface TipDto {
  tipId: number;
  title: string;
  description: string;
  author: {
    userId: number;
    nickname: string;
    profileImageUrl: string;
  };
  createdAt: Date;
  updatedAt: Date;
  images: { mediaUrl: string; mediaType: string }[];
}

export function toTipDto(tip: any): TipDto {
  return {
    tipId: tip.tips_id,
    title: tip.title,
    description: tip.content,
    author: {
      userId: tip.user?.user_id || 0,
      nickname: tip.user?.nickname || '',
      profileImageUrl: tip.user?.profile_image_url || '',
    },
    createdAt: tip.created_at,
    updatedAt: tip.updated_at,
    images: tip.media?.map((media: { media_url: string; media_type: string }) => ({
      mediaUrl: media.media_url,
      mediaType: media.media_type,
    })) || [],
  };
}


// Tip 데이터 배열에서 TipDto 배열로 변환하는 함수
export function toTipDtoList(tips: any[]): TipDto[] {
  return tips.map((tip) => toTipDto(tip));
}
