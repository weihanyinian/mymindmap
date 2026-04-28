export interface IUser {
  _id: string;
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
  username: string;
  password: string;
}

export interface IRegisterRequest {
  username: string;
  password: string;
}
