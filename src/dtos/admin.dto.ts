export interface AdminCreateDto {
    email: string;
    password: string;
  }
  
  export interface AdminLoginDto {
    email: string;
    password: string;
  }
  
  export interface PasswordUpdateDto {
    oldPassword: string;
    newPassword: string;
  }  