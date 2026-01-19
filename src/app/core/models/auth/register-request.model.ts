/* -------- REQUEST -------- */
export interface RegisterRequest {
  username: string;       // 3 à 50 caractères
  email: string;          // email valide
  password: string;       // minimum 8 caractères
  phoneNumber: number;    // obligatoire
}
