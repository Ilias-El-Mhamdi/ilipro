export interface JwtPayload {
  sub: string;
  slug: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
}
