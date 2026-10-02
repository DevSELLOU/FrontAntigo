export interface UserHierarchy {
  id: number;
  name: string;
  role: string;
  avatar: string;
  managerId?: number;
  subordinates?: UserHierarchy[];
}
