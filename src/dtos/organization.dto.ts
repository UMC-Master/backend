export interface OrganizationResponseDto {
  organization_id: number;
  name: string;
  location: {
    id: number;
    name: string;
  };
}

export interface OrganizationListResponseDto {
  organization_list: OrganizationResponseDto[];
}
