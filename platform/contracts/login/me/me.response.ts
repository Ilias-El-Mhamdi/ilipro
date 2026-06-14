export interface MeResponse {
  sub: string;
  slug: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
}

export class MeResponseClass {
  static fromJson(json: unknown): MeResponse {
    return json as MeResponse;
  }
}
