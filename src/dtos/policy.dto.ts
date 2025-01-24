export interface PolicyListDto {
  policy_list: {
    id: number;
    title: string;
    imageUrl: string;
  }[];
}

export interface PolicyGuideDto {
  policy_id: number;
  description: string;
  image_url_list: string[];
}

export interface policyRequestDto {
  organization_id: number;
  title: string;
  description: string;
  policy_url: string;
  location_id: number;
  iamge_url_list?: string[];
  magazine_hashtag_id_list: number[];
}

export interface policyResponseDto {
  id: number;
  title: string;
  description: string;
  created_at: string | Date;
  updated_at: string | Date;
  policy_url: string;
  magazine_image_url_list?: [
    {
      image_name: string;
      image_url: string;
    },
  ];
  magazine_likes: number;
  magazine_bookmarks: number;
  organization: {
    id: number;
    name: string;
  };
  location: {
    id: number;
    name: string;
  };
  hashtag: {
    id: number;
    name: string;
  }[];
}
