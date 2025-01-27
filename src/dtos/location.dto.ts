export interface CreatePolicyResponseDto {
    location_id: number;
    name: string;
    parent: {
        id: number;
        name: string;
    };
}