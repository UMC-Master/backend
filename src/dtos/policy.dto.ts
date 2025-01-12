export interface PolicyListDto {
  policyList: [
    {
      title: string;
      imageUrl: string;
    },
  ];
}

export interface PolicyGuideDto {
  policyId: number;
  description: string;
  imageUrlList: [string];
}
