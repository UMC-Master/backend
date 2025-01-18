export interface EmailSignupDto {
  email: string;
  password: string;
  nickname: string;
  city?: string;
  district?: string;
}

export interface KakaoSignupDto {
  kakaoToken: string;
  email?: string;
  nickname?: string;
  city?: string;
  district?: string;
}

export interface EmailLoginDto {
  email: string;
  password: string;
}

export interface ProfileUpdateDto {
  email?: string; // 이메일 변경 (선택 사항)
  password?: string; // 비밀번호 변경
  nickname?: string; // 닉네임 변경
  city?: string; // 도시 변경
  district?: string; // 구 변경
  profileImageUrl?: string; // 프로필 이미지 URL 변경
}

export interface TokenRefreshDto {
  refreshToken: string; // 리프레시 토큰
}