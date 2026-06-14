import { z } from "zod";

export class Deliverable {
  static readonly schema = z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    mimeType: z.string(),
    size: z.number(),
    projectId: z.string(),
    createdAt: z.string(),
  });

  declare id: string;
  declare name: string;
  declare url: string;
  declare mimeType: string;
  declare size: number;
  declare projectId: string;
  declare createdAt: string;

  static fromJson(json: unknown): Deliverable {
    return Object.assign(new Deliverable(), Deliverable.schema.parse(json));
  }

  static fromJsonList(json: unknown): Deliverable[] {
    return z
      .array(Deliverable.schema)
      .parse(json)
      .map((d) => Object.assign(new Deliverable(), d));
  }
}
