/**
 * Modèles d'authentification — Easy Sales CRM.
 *
 * @author Riahi Dorsaf
 */

export type RoleUtilisateur = 'ROLE_SUPER_ADMIN' | 'ROLE_PROPRIETAIRE';

export interface LoginRequest {
  email:      string;
  motDePasse: string;
}

export interface AuthResponse {
  accessToken:   string;
  refreshToken:  string;
  tokenType:     string;
  userId:        number;
  nom:           string;
  prenom:        string;
  email:         string;
  role:          RoleUtilisateur;
  entrepriseId:  number | null;
  nomEntreprise: string | null;
  statutCompte:  string | null;
}

export interface ApiResponse<T> {
  success:   boolean;
  message:   string;
  data:      T;
  timestamp: string;
}