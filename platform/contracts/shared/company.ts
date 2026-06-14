import { z } from "zod";

export class Company {
  static readonly schema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    createdAt: z.string(),
  });

  declare id: string;
  declare name: string;
  declare slug: string;
  declare createdAt: string;

  static fromJson(json: unknown): Company {
    return Object.assign(new Company(), Company.schema.parse(json));
  }

  static fromJsonList(json: unknown): Company[] {
    return z
      .array(Company.schema)
      .parse(json)
      .map((d) => Object.assign(new Company(), d));
  }
}
