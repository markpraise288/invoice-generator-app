export interface User {
  _id?: string;

  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;

  createdAt?: string;
  updatedAt?: string;
}