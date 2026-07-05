# ============================================================
#  Image front admin Angular — nginx sert les fichiers compilés.
#  ⚠️ Image "runtime only" (même pattern que le backend) : le build Angular
#     est fait AVANT (pipeline : npm run build), on ne copie que dist/.
# ============================================================
FROM nginx:1.27-alpine

# Config nginx avec fallback SPA (remplace la config par défaut)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Fichiers Angular compilés (Angular 19 : sous-dossier browser/)
COPY dist/frontend-admin-web/browser/ /usr/share/nginx/html/

EXPOSE 80
