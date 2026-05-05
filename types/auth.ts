export interface AuthResponse {
  message: string;
  data: {
    accessToken: string;
    user: {
      _id: string;
      email: string;
    };
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  companyName: string;
  phone: string;
  address: string;
}