import { z } from "zod";

export class User {
  static readonly schema = z.object({
    id: z.string(),
    slug: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.string(),
    stripeCustomerId: z.string().nullable(),
    createdAt: z.string(),
  });

  declare id: string;
  declare slug: string;
  declare firstName: string | null;
  declare lastName: string | null;
  declare email: string;
  declare stripeCustomerId: string | null;
  declare createdAt: string;

  static fromJson(json: unknown): User {
    return Object.assign(new User(), User.schema.parse(json));
  }

  static fromJsonList(json: unknown): User[] {
    return z
      .array(User.schema)
      .parse(json)
      .map((d) => Object.assign(new User(), d));
  }
}
