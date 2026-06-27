# OpenWhispr Mobile

Application mobile React Native pour OpenWhispr. Se connecte à un serveur de synchronisation OpenWhispr pour accéder à vos notes, transcriptions et effectuer des dictées depuis votre téléphone.

## Prérequis

- Node.js 24+
- React Native CLI ou Expo CLI
- Android Studio (pour Android) ou Xcode (pour iOS)

## Installation

```bash
cd mobile
npm install

# iOS
cd ios && pod install && cd ..

# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

## Architecture

```
mobile/
├── App.tsx                          # Point d'entrée, hydratation thème/auth
├── src/
│   ├── types/index.ts               # Types TypeScript (Note, Transcription, Folder...)
│   ├── config/constants.ts          # Couleurs thème clair/sombre, constantes
│   ├── utils/logger.ts              # Logger structuré
│   ├── services/
│   │   ├── api.ts                   # Client API avec retry et upload audio
│   │   ├── auth.ts                  # Authentification JWT via AsyncStorage
│   │   └── audio.ts                 # Enregistrement audio
│   ├── stores/
│   │   ├── settingsStore.ts         # Zustand — configuration serveur
│   │   ├── notesStore.ts            # Zustand — CRUD notes
│   │   └── transcriptionStore.ts    # Zustand — transcriptions
│   ├── hooks/
│   │   ├── useSettings.ts           # Hydratation settings
│   │   └── useAudioRecording.ts     # Enregistrement + upload
│   ├── components/ui/               # Composants shadcn-like
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── Skeleton.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Dictée avec microphone
│   │   ├── NotesListScreen.tsx      # Liste des notes avec filtres dossier
│   │   ├── NoteDetailScreen.tsx     # Éditeur de note avec auto-save
│   │   ├── TranscriptionsScreen.tsx # Historique des transcriptions
│   │   └── SettingsScreen.tsx       # Connexion serveur + thème
│   └── navigation/
│       └── AppNavigator.tsx         # Bottom tabs + stack navigation
```

## Connexion au serveur

1. Lancez votre serveur de synchronisation (voir `docker-compose.yml` à la racine)
2. Dans l'application, allez dans Paramètres
3. Entrez l'URL de votre serveur (ex: `http://192.168.1.42:3001`)
4. Entrez le token d'API défini dans `API_TOKEN`
5. Appuyez sur "Connecter"

## Fonctionnalités

- Dictée vocale avec envoi au serveur pour transcription
- Consultation et création de notes
- Filtrage des notes par dossier
- Historique des transcriptions
- Thème clair/sombre
- Support Cloudflared Tunnel pour accès distant
