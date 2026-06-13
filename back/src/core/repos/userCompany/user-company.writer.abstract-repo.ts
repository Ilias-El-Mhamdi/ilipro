export abstract class IUserCompanyWriterRepo {
  abstract link(userId: string, companyId: string): Promise<void>;
  abstract unlink(userId: string, companyId: string): Promise<void>;
}
