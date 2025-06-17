# Felanmälan Gotland

En geobaserad ärendehanteringsplattform för Gotland – utvecklad för att låta medborgare felanmäla saker som trasig gatubelysning, nedfallna träd eller andra problem direkt på en karta.

## 📐  Projektstruktur

```plaintext
felanmalan/
├── backend/      → Spring Boot-backend (API + datamodell)
├── frontend/     → React-baserad frontend (karta, formulär)
├── docker/       → docker-compose.yml, .env-filer, certifikat m.m.
├── db/           → PostgreSQL/PostGIS databasvolym
├── pgadmin/      → Persistent data för pgAdmin4
├── docs/         → Dokumentation, diagram, kravspec m.m.
├── scripts/      → CLI-verktyg, start/stopp-script m.m.
├── infra/        → Infrastrukturkod (Kubernetes, Ansible, etc.)
└── README.md     → Denna fil

## 📦  Teknikstack
- Spring Boot (Java)
- PostgreSQL + PostGIS
- React + Leaflet/MapLibre (frontend)
- Docker / TrueNAS SCALE
- GitHub / GitLab för versionshantering & CI/CD

## 🚀  Syfte
Att tillhandahålla en öppen, platsbaserad plattform för felanmälan på Gotland, med fokus på närhet, öppenhet och teknisk hållbarhet.

## 📄  Licens
TBD – t.ex. MIT, EUPL eller AGPL beroende på framtida mål.
