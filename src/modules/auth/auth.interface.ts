export type Role = "contributor" | "maintainer";
export interface ICreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
}


export interface ILoginRequest {
  email: string;
  password: string;
}