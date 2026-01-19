import ResponseType from "../api_resp.model";

/* -------- REQUEST -------- */
export type Login = {
  email: string;
  password: string;
};

/* -------- USER (subset) -------- */
export type LoginUser = {
  username: string;
  email: string;
};

/* -------- RESPONSE DATA -------- */
export type LoginResponseDataType = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: LoginUser;
};

/* -------- FINAL RETURN TYPE -------- */
export type LoginReturnType = ResponseType<LoginResponseDataType>;
