<p align="center">
  <img src="src/assets/logo.svg" alt="OpenWhispr" width="120" />
</p>

<h1 align="center">OpenWhispr — Self-Hosted Edition</h1>

<p align="center">
  <a href="https://github.com/jclaudan/openwhispr/blob/main/LICENSE"><img src="https://img.shields.io/github/license/jclaudan/openwhispr?style=flat" alt="License" /></a>
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey?style=flat" alt="Platform" />
  <a href="https://github.com/jclaudan/openwhispr/releases/latest"><img src="https://img.shields.io/github/v/release/jclaudan/openwhispr?style=flat&sort=semver" alt="GitHub release" /></a>
  <a href="https://github.com/jclaudan/openwhispr/stargazers"><img src="https://img.shields.io/github/stars/jclaudan/openwhispr?style=flat" alt="GitHub stars" /></a>
</p>

<p align="center">
  Fork communautaire d'OpenWhispr axé sur le <strong>self-hosting</strong>, la <strong>persistance centralisée</strong> et la <strong>souveraineté des données</strong>.<br/>
  Dictée vocale privée, agents IA, transcription de réunions — rien ne quitte votre infrastructure.
</p>

<p align="center">
  <a href="#features">Fonctionnalités</a> &middot;
  <a href="#quick-start">Démarrage</a> &middot;
  <a href="#self-hosted-sync">Sync auto-hébergée</a> &middot;
  <a href="#desktop-as-server">Desktop comme serveur</a> &middot;
  <a href="#mobile">Application mobile</a> &middot;
  <a href="#sécurité">Sécurité</a>
</p>

---

OpenWhispr transforme votre voix en texte, notes et actions depuis votre bureau. Appuyez sur une touche, parlez, et vos mots apparaissent à votre curseur. Choisissez entre la transcription hors-ligne totalement privée avec Whisper ou NVIDIA Parakeet — votre audio ne quitte jamais votre appareil — ou le traitement cloud pour la vitesse. Aucune collecte de données, aucune télémétrie, entièrement open source.

Ce fork étend le projet original avec des fonctionnalités conçues pour les utilisateurs auto-hébergés : un serveur de synchronisation, la prise en charge de Cloudflared Tunnel, et l'architecture pour faire de votre bureau un serveur de transcription central.

## Téléchargement

| Plateforme | Téléchargement |
|---|---|
| macOS (Apple Silicon) | [`.dmg`](https://github.com/jclaudan/openwhispr/releases/latest) |
| macOS (Intel) | [`.dmg`](https://github.com/jclaudan/openwhispr/releases/latest) |
| Windows | [`.exe`](https://github.com/jclaudan/openwhispr/releases/latest) |
| Linux | [`.AppImage`](https://github.com/jclaudan/openwhispr/releases/latest) / [`.deb`](https://github.com/jclaudan/openwhispr/releases/latest) / [`.rpm`](https://github.com/jclaudan/openwhispr/releases/latest) / [`.tar.gz`](https://github.com/jclaudan/openwhispr/releases/latest) |

## Fonctionnalités

- **Dictée vocale** — touche globale pour dicter dans n'importe quelle application avec collage automatique
- **Agent IA** — parlez à GPT-5, Claude, Gemini, Groq ou des modèles locaux avec un assistant vocal nommé
- **Raccourci agent vocal** — hotkey dédié qui envoie votre dictée directement à votre agent IA comme commande
- **Transcription de réunions** — détection automatique des appels Zoom, Teams, FaceTime avec diarisation et empreinte vocale
- **Notes** — créez, organisez et recherchez des notes avec dossiers, recherche sémantique et synchronisation
- **Local ou cloud** — toutes les fonctionnalités de base fonctionnent avec des modèles locaux ou des fournisseurs cloud
- **API publique & MCP** — gérez les notes et transcriptions par programme

### Fonctionnalités spécifiques à ce fork

- **🔑 Intégrations débloquées en self-hosted** — plus de blocage "View Plans" : les sections API, MCP et CLI sont accessibles sans abonnement cloud
- **🔄 Serveur de synchronisation auto-hébergé** — gardez vos notes, transcriptions et dictionnaire synchronisés entre toutes vos machines
- **📱 Architecture mobile-ready** — le bureau peut servir de backend dédié pour une application mobile
- **🔒 Exposition sécurisée via Cloudflared Tunnel** — zero trust, pas de port ouvert sur votre routeur
- **🛡️ Souveraineté totale** — vos données vocales, vos transcriptions, vos modèles, votre infrastructure

## Démarrage rapide

```bash
git clone https://github.com/jclaudan/openwhispr.git
cd openwhispr
npm install
npm run dev
```

Nécessite Node.js 24+. Consultez la [documentation](https://docs.openwhispr.com/quickstart) pour les guides d'installation complets.

## Synchronisation auto-hébergée

Pour centraliser vos données entre plusieurs machines (bureau, portable, etc.), ce fork propose un serveur de synchronisation léger.

### Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Machine A   │     │  Sync Server │     │  Machine B   │
│  Desktop     │◄───►│  (votre VPS) │◄───►│  Desktop     │
│  App + DB    │     │  PostgreSQL/ │     │  App + DB    │
└──────────────┘     │  SQLite      │     └──────────────┘
                     └──────────────┘
                           │
                     ┌─────▼─────┐
                     │ Cloudflare │
                     │   Tunnel   │
                     └───────────┘
```

### Démarrage du serveur de synchronisation

```bash
# 1. Générer les secrets
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
echo "API_TOKEN=$(openssl rand -hex 32)" >> .env

# 2. Lancer le serveur
docker compose up -d

# 3. Pour exposer via Cloudflared Tunnel (optionnel)
export CLOUDFLARED_TUNNEL_TOKEN="votre-token-cloudflared"
docker compose -f docker-compose.yml -f docker-compose.cloudflared.yml up -d
```

### Configuration du client desktop

Dans le fichier `.env` à la racine du projet :

```env
# Pointer vers votre serveur de synchronisation
VITE_OPENWHISPR_API_URL=http://localhost:3001

# Token d'API pour l'authentification
API_TOKEN=votre-token-api
```

### Endpoints du serveur

| Endpoint | Méthode | Description |
|---|---|---|
| `/health` | GET | Santé du serveur |
| `/api/auth/token` | POST | Obtenir un JWT (nécessite `API_TOKEN`) |
| `/api/notes` | GET | Lister les notes |
| `/api/notes` | POST | Créer une note |
| `/api/notes/:cloudId` | PATCH | Mettre à jour une note |
| `/api/notes/:cloudId` | DELETE | Supprimer une note |
| `/api/folders` | GET/POST | Lister/créer des dossiers |
| `/api/folders/:cloudId` | PATCH/DELETE | Mettre à jour/supprimer un dossier |
| `/api/transcriptions` | GET/POST | Lister/créer des transcriptions |
| `/api/transcriptions/:cloudId` | PATCH/DELETE | Mettre à jour/supprimer une transcription |
| `/api/dictionary` | GET/POST | Lire/ajouter au dictionnaire |

## Desktop comme serveur

L'application de bureau peut agir comme un serveur backend pour d'autres clients légers. Le pont CLI (`cliBridge.js`) expose déjà un serveur HTTP local sur le port 8200-8219. Cette architecture permet :

```
┌──────────────┐     ┌─────────────────┐
│  Mobile APK  │────►│  Cloudflared    │────►┌──────────────────┐
│  (client     │     │  Tunnel         │     │  Desktop App     │
│   léger)     │◄────│  (optionnel)    │◄────│  (serveur:8200)  │
└──────────────┘     └─────────────────┘     │  + Modèles IA    │
                                             │  + Transcription │
                                             └──────────────────┘
```

Le desktop expose :
- Transcription via Whisper / Parakeet
- Accès aux notes et transcriptions stockées localement
- Gestion des modèles IA
- Recherche sémantique (Qdrant)

Pour activer le mode serveur :

```bash
# Par défaut, le serveur écoute sur 127.0.0.1:8200-8219
# Pour exposer via Cloudflared :
# 1. Installer cloudflared
# 2. Créer un tunnel : cloudflared tunnel create openwhispr
# 3. Exposer : cloudflared tunnel run openwhispr
```

## Application mobile

Une future application mobile APK est envisagée pour permettre :

- **Dictée vocale depuis le téléphone** — enregistrez sur votre mobile, transcrit sur le desktop
- **Consultation des notes** — accédez à toutes vos notes synchronisées
- **Transcription de réunions mobiles** — enregistrez sur mobile, traité sur le desktop
- **Notifications push** — soyez averti quand une transcription est prête

L'APK serait un client React Native (ou équivalent cross-platform) se connectant au serveur de synchronisation ou directement au desktop via l'API REST.

## Sécurité

- **Chiffrement de bout en bout** — toutes les communications entre le client et le serveur de synchronisation sont chiffrées via TLS
- **Authentification par JWT** — chaque client nécessite un token valide
- **Cloudflared Tunnel** — exposition zero-trust sans ouvrir de ports
- **Données locales** — les modèles et les transcriptions restent sur votre machine
- **Aucune télémétrie** — pas de collecte de données, pas de suivi

## Stack technique

React 19, TypeScript, Tailwind CSS v4, Electron 41, better-sqlite3, whisper.cpp, sherpa-onnx, shadcn/ui

Serveur de synchronisation : Node.js 24, Express, better-sqlite3, JWT

## Licence

[MIT](LICENSE) — libre pour usage personnel et commercial.

## Remerciements

- **[OpenWhispr](https://github.com/OpenWhispr/openwhispr)** — le projet original qui rend ce fork possible
- **[OpenAI Whisper](https://github.com/openai/whisper)** — modèle de reconnaissance vocale
- **[whisper.cpp](https://github.com/ggerganov/whisper.cpp)** — implémentation C++ haute performance
- **[NVIDIA Parakeet](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)** — modèle ASR multilingue rapide
- **[sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)** — runtime ONNX cross-platform
- **[llama.cpp](https://github.com/ggerganov/llama.cpp)** — inférence LLM locale
- **[Electron](https://www.electronjs.org/)** — framework desktop cross-platform
- **[React](https://react.dev/)** — bibliothèque UI
- **[Cloudflare](https://cloudflare.com/)** — tunnel sécurisé
