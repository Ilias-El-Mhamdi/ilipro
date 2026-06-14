export class DeleteLicenseMachineRequest {
  static BASE_URL = "/licenses/:id/machines/:machineId";
  static buildUrl(id: string, machineId: string) {
    return `/licenses/${id}/machines/${machineId}`;
  }
}
