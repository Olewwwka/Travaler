export interface User {
    id: string;
    email: string;
    name: string;
    roles: Role[];
  }
  
  export interface Role {
    id: string;
    name: string;
    permissions: Permission[];
  }
  
  export interface Permission {
    id: string;
    name: string;
  }