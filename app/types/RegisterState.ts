export type RegisterType = {
  success: boolean;
  message: string;
};

export type UserType = { 
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  PhotoUrl?: string;
  otp: string;
  otpExpiry: Date;
  isVerified?: boolean;
}