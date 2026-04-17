/**
 * Modèles de données pour les notifications Super Admin.
 * Utilisés par NotificationService et NotificationsComponent.
 *
 * @author Riahi Dorsaf
 */

/** Types de notifications générées par le système. */
export type TypeNotification =
  | 'NOUVELLE_INSCRIPTION'
  | 'MODIFICATION_ENTREPRISE'
  | 'INFO';

/** Réponse API pour une notification. */
export interface NotificationResponse {
  id:            number;
  titre:         string;
  message:       string;
  type:          TypeNotification;
  lue:           boolean;
  dateCreation:  string;
  lienRessource: string | null;
  nbNonLues:     number;
}

/** Réponse API paginée générique. */
export interface PageResponse<T> {
  content:       T[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
  last:          boolean;
}