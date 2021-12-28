declare namespace Express {
  export interface Request {
    userPermissions: Record<string, boolean>;
    userId: string;
  }
}
