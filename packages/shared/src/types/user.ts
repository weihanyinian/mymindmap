export interface IUser {
  _id: string;
  email: string;
  username: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  username: string;
  password: string;
}
