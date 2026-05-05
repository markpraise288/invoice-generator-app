export interface Client {
  _id?: string;

  name: string;
  email: string;
  phone: string;
  address: string;

  createdAt?: string;
  updatedAt?: string;

  isDeleted?: boolean;
}