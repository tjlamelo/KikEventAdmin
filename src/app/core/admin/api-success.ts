/**
 * Le backend renvoie souvent status dans le corps JSON (BaseResponse),
 * pas seulement le code HTTP. Certaines routes utilisent 204 (ex. DELETE profil).
 */
export function isApiSuccessStatus(status: number | undefined): boolean {
  if (status == null) return false;
  return status === 200 || status === 201 || status === 202 || status === 204;
}
