export interface MediaDto {
    mediaId: number; // 미디어 ID
    mediaUrl: string; // 미디어 URL
    mediaType: 'image' | 'video'; // 미디어 타입
    uploadedAt: Date; // 업로드 시간

}