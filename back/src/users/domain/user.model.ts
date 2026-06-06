export class UserModel {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  stripeCustomerId: string | null;
  license?: unknown | null;
  createdAt: Date;
  updatedAt: Date;
}
