export class Client {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  stripeCustomerId: string | null;
  license?: unknown | null; // populated contextually by repository
  createdAt: Date;
  updatedAt: Date;
}
