export interface LocationResponseDto {
  location_id: number;
  name: string;
  parent: {
    id: number;
    name: string;
  };
}

export interface LocationListResponseDto {
  location_list: LocationResponseDto[];
}
