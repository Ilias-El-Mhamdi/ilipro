import { z } from "zod";

export class Project {
  static readonly schema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    appUrl: z.string().nullable(),
    docsUrl: z.string().nullable(),
    changelogUrl: z.string().nullable(),
    companyId: z.string(),
    createdAt: z.string(),
  });

  declare id: string;
  declare name: string;
  declare slug: string;
  declare appUrl: string | null;
  declare docsUrl: string | null;
  declare changelogUrl: string | null;
  declare companyId: string;
  declare createdAt: string;

  static fromJson(json: unknown): Project {
    return Object.assign(new Project(), Project.schema.parse(json));
  }

  static fromJsonList(json: unknown): Project[] {
    return z
      .array(Project.schema)
      .parse(json)
      .map((d) => Object.assign(new Project(), d));
  }
}
