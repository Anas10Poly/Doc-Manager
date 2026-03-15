import { User } from './User';

export type Permission = {
  user: {
    id: number;
    lastName: string;
    firstName: string;
    email: string;
  };
  role: {
    id: number;
  };
};

export type UserWithPermissions = User & {
  permissions: {
    read: boolean;
    modify: boolean;
    share: boolean;
  };
  role?: {
    name: string;
  };
};
export type { User };