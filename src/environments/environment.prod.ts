// Configuration de PRODUCTION (utilisée au build `--configuration production`).
// apiUrl = URL HTTPS du backend déployé sur Azure (Container App), suffixe /api.
// ⚠️ Si tu recrées l'infra (terraform destroy/apply), récupère la valeur à jour avec :
//      cd crm-backend/terraform && terraform output -raw backend_url
export const environment = {
  production: true,
  apiUrl: 'https://easysales-backend.bravemoss-1c5a2f5c.francecentral.azurecontainerapps.io/api',
};
