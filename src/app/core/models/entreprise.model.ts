export type StatutCompte =
  | 'EN_ATTENTE'
  | 'ACTIVE'
  | 'SUSPENDU'
  | 'REFUSE';

export type TailleEntreprise = 'TPE' | 'PME' | 'GE';

export interface EntrepriseCompteResponse {
  id:               number;
  nomEntreprise:    string;
  matriculeFiscale: string;
  secteurActivite:  string;
  tailleEntreprise: TailleEntreprise;
  telephone:        string;
  adresse:          string;
  ville:            string;
  pays:             string;
  siteWeb:          string | null;
  statutCompte:     StatutCompte;
  dateCreation:     string;
  dateValidation:   string | null;
  motifRefus:       string | null;
  proprietaireNom:       string;
  proprietairePrenom:    string;
  proprietaireEmail:     string;
  proprietaireTelephone: string | null;
}

/**
 * Aligné sur ValiderEntrepriseRequest.java :
 * valider=true  → ACTIVE
 * valider=false → REFUSE
 */
export interface DecisionEntrepriseRequest {
  valider:     boolean;
  motifRefus?: string;
}

export interface FiltresEntreprise {
  statut:    StatutCompte | 'TOUS';
  recherche: string;
}

export interface PageResponse<T> {
  content:       T[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
  last:          boolean;
}