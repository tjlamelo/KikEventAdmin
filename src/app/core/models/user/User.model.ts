import { Role } from "../authorize/role.model";
import { Permission } from "../authorize/permission.model";

export interface User {
  id: number;
  username: string;
  email: string;
  emailVerifiedAt?: string | null;
  phoneNumber?: number | null;
  password?: string; // généralement non renvoyé par l’API
  enabled: boolean;

  createdAt: string;
  updatedAt?: string | null;

  roles: Role[];
  permissions: Permission[];
}
