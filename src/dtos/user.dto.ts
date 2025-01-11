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