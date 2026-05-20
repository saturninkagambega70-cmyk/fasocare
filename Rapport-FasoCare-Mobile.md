---
title: "FasoCare Mobile — Application de Santé Numérique"
subtitle: "Documentation Fonctionnelle — De A à Z"
author:
  - "Étudiant : ____________________________"
  - "Encadreur : ____________________________"
date: \today
toc: true
toc-depth: 3
numbersections: true
geometry: margin=2.5cm
fontsize: 12pt
header-includes:
  - "\\usepackage{fancyhdr}"
  - "\\pagestyle{fancy}"
  - "\\lhead{}"
  - "\\rhead{FasoCare Mobile}"
  - "\\cfoot{\\thepage}"
---

\newpage

# Introduction

FasoCare est une plateforme nationale de santé numérique destinée au Burkina Faso. Elle connecte les citoyens, les médecins, les pharmaciens et les parents/tuteurs légaux autour d'un dossier médical partagé, sécurisé et accessible depuis un smartphone.

L'application mobile (Expo React Native) permet de :

- Consulter son dossier médical et ses ordonnances numériques (QR code)
- Prendre rendez-vous avec un médecin
- Effectuer des téléconsultations vidéo (Jitsi Meet)
- Déclencher une alerte SOS avec géolocalisation
- Suivre l'observance des traitements médicamenteux
- Scanner et valider les ordonnances en pharmacie
- Gérer le carnet de vaccination des enfants
- Bénéficier d'un assistant IA de triage des symptômes
- Accéder à l'application en Français, Mooré, Dioula ou Fulfuldé

\newpage

# Architecture Technique

## Stack Technologique

| Composant       | Technologie                          |
|-----------------|--------------------------------------|
| Framework       | Expo SDK 55 (React Native 0.83)      |
| Langage         | JavaScript (ES2022)                  |
| Navigation      | React Navigation (Stack + Bottom Tabs) |
| État global     | Zustand avec persistance             |
| API             | Axios avec intercepteurs JWT         |
| Temps réel      | Socket.IO (messagerie)               |
| International.  | i18next + react-i18next (4 langues)  |
| Base locale     | SQLite (expo-sqlite)                 |
| Stockage sécurisé| expo-secure-store                   |
| QR Code         | react-native-qrcode-svg + expo-camera|
| Cartographie    | react-native-maps + Leaflet (WebView)|
| Visioconférence | Jitsi Meet via WebView               |
| Synthèse vocale | expo-speech                          |
| Reconnaissance  | @react-native-voice/voice            |
| Notifications   | expo-notifications                   |
| Biométrie       | expo-local-authentication            |
| Haptique        | expo-haptics                         |
| Géolocalisation | expo-location                        |
| Tests           | Jest + React Native Testing Library  |

## Structure des Répertoires

```
mobile/
├── App.js                    # Point d'entrée, navigation racine
├── app.json                  # Configuration Expo
├── package.json              # Dépendances
├── .env                      # Variables d'environnement
├── assets/                   # Images, polices
├── src/
│   ├── screens/
│   │   ├── Auth/             # 6 écrans (Welcome, Login, Register, ...)
│   │   ├── Home/             # 4 écrans (PatientDashboard, Profile, ...)
│   │   ├── Patient/          # 6 écrans (MedicalRecord, Emergency, ...)
│   │   ├── Doctor/           # 7 écrans (Dashboard, Prescription, ...)
│   │   ├── Pharmacist/       # 2 écrans (Scanner, Inventory)
│   │   ├── Pharmacy/         # 2 écrans (Dashboard, Portal)
│   │   ├── Parent/           # 1 écran (VaccineBook)
│   │   ├── Medical/          # 3 écrans (Chat, Meeting, VideoCall)
│   │   └── Settings/         # 1 écran (ServerConfig)
│   ├── services/             # API, Socket, Sync, Notifications, Sentry
│   ├── store/                # Zustand stores (auth, etc.)
│   ├── context/              # ThemeContext (mode clair/sombre)
│   ├── i18n/                 # Traductions (4 langues × 530 clés)
│   ├── components/           # Composants réutilisables
│   ├── constants/            # Médicaments, diagnostics
│   ├── database/             # SQLite offline queue
│   └── navigation/           # Navigateurs, RoleTabNavigator
```

\newpage

# Flux d'Authentification

## Parcours Utilisateur

```
                    ┌──────────────────┐
                    │   WelcomeScreen   │
                    │ "Commencer l'exp."│
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   LoginScreen     │
                    │ Mode MOT DE PASSE │
                    │  ou Mode OTP      │
                    └────────┬─────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
        ┌───────────┐ ┌──────────┐ ┌───────────┐
        │ Biometrie  │ │ Password │ │   OTP     │
        │ (Touch ID) │ │ + phone  │ │ + phone   │
        └───────────┘ └────┬─────┘ └─────┬─────┘
                           │             │
                           ▼             ▼
                    ┌──────────────────┐
                    │ POST /auth/login │
                    │ ou /login-otp    │
                    └────────┬─────────┘
                             │ {access_token, user}
                             ▼
                    ┌──────────────────┐
                    │ isAuthenticated  │
                    │ = true           │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   AppNavigator    │
                    │ (rôle → onglets) │
                    └──────────────────┘
```

## Modes de connexion

| Mode           | Description                                                                 |
|----------------|-----------------------------------------------------------------------------|
| Mot de passe   | POST `/auth/login` avec téléphone + mot de passe → JWT + refresh token     |
| OTP            | POST `/auth/request-login-otp` → saisie code 6 chiffres → POST `/auth/login-otp` |
| Biométrique    | Scan empreinte digitale → récupération credentials SecureStore → login auto|

## Enregistrement

- POST `/auth/register` avec nom, téléphone, mot de passe, rôle, genre
- Validation : nom ≥ 2 car., téléphone 8 chiffres, mot de passe ≥ 8 car.
- 4 rôles : PATIENT, DOCTOR, PHARMACIST, PARENT

## Sécurité

- JWT stocké dans SecureStore (chiffré par le matériel)
- Refresh token pour renouvellement automatique
- Intercepteur Axios : 401 → refresh → retry
- Déconnexion : effacement complet du store

\newpage

# Navigation et Rôles

## Arborescence de Navigation

```
App.js
├── [Non connecté] Stack Auth
│   ├── Welcome
│   ├── Login
│   ├── Register
│   ├── ForgotPassword
│   ├── ResetPassword
│   └── OtpVerification
│
└── [Connecté] AppNavigator
    ├── MainTabs (Barre d'onglets selon le rôle)
    │   ├── PATIENT
    │   │   ├── "Mon QR"     → PatientDashboard
    │   │   ├── "Dossier"    → MedicalRecordScreen
    │   │   ├── "Messagerie" → DoctorMessagingScreen
    │   │   └── "Urgences"   → EmergencyScreen
    │   │
    │   ├── DOCTEUR
    │   │   ├── "Clinique"   → DoctorDashboard
    │   │   ├── "Téléconsult."→ ConsultationScreen
    │   │   ├── "Messagerie" → DoctorMessagingScreen
    │   │   └── "Ordonnances"→ PrescriptionScreen
    │   │
    │   ├── PHARMACIEN
    │   │   ├── "Scanner"    → PharmacyScannerScreen
    │   │   └── "Stocks"     → InventoryScreen
    │   │
    │   └── PARENT
    │       ├── "Enfants"    → ParentDashboard
    │       └── "Vaccins"    → VaccineBookScreen
    │
    └── Écrans accessibles depuis tous les onglets
        ├── Profile
        ├── PrescriptionList
        ├── PharmacyDiscovery
        ├── Meeting / VideoCall (téléconsultation)
        ├── PatientRecord (vue docteur)
        ├── EpidemicReport
        ├── Triage (IA symptômes)
        ├── Chat (messagerie 1-1)
        ├── Appointments / BookAppointment
        └── ServerConfig
```

## Règles de Navigation

- La barre d'onglets s'adapte dynamiquement au rôle connecté (`activeRole`)
- Les écrans "stack" sont accessibles depuis n'importe quel onglet via `navigation.navigate()`
- Un utilisateur avec plusieurs rôles peut basculer via le profil
- Le thème (clair/sombre) est persistant et détecté automatiquement

\newpage

# Fonctionnalités par Rôle

## Citoyen / Patient

### Tableau de Bord (\texttt{PatientDashboard.js})
- Carte d'identité QR unique (`FASOCARE_ID:{userId}`)
- Grille de services : Profil, Dossier Médical, IA Triage, Pharmacies, Rendez-vous, Téléconsultation, Urgences, Mes Droits
- Historique des consultations avec statut des ordonnances
- Notifications (modal)
- Déconnexion

### Dossier Médical (\texttt{MedicalRecordScreen.js})
- Statistiques : nombre de consultations, ordonnances, vaccins
- Liste chronologique des consultations
- Modal détaillé avec :
  - QR code de l'ordonnance numérique
  - Diagnostic, médecin prescripteur, date
  - Liste des médicaments avec posologie, quantité, moment de prise
  - Cachet officinal (pharmacie de délivrance)
  - **Suivi du traitement** : génération automatique des prises, boutons Prise/Sautée par dose

### Ordonnances (\texttt{PrescriptionListScreen.js})
- Liste de toutes les ordonnances avec QR code
- Filtre automatique : uniquement les consultations avec `qr_token`
- Statut : délivrée ou en attente
- Modal détaillé : informations de prescription, QR partageable

### IA Triage (\texttt{TriageScreen.js})
- Chatbot d'analyse des symptômes (POST `/ai/triage`)
- Saisie texte + reconnaissance vocale
- Suggestions rapides de symptômes
- Analyse automatique → niveau d'urgence
- Bouton SOS en cas de situation critique
- Messages utilisateur/bot, chargement, historique

### Pharmacies (\texttt{PharmacyDiscoveryScreen.js})
- Carte Leaflet interactive (WebView)
- Marqueurs verts (ouvertes) / rouges (fermées)
- Pop-up : nom, statut, téléphone (appel direct), itinéraire (Google Maps)
- Rafraîchissement automatique

### Rendez-vous (\texttt{AppointmentScreen.js} + \texttt{BookAppointmentScreen.js})
- Liste des rendez-vous avec statut (EN ATTENTE, CONFIRMÉ, TERMINÉ, ANNULÉ)
- Prise de rendez-vous :
  - Recherche du médecin par téléphone
  - Sélection : date, heure, motif, établissement (CSPS/CMA/CHU)
  - Confirmation avec nom du médecin
- Annulation possible pour les rendez-vous en attente

### Téléconsultation (\texttt{VideoCallScreen.js} / \texttt{MeetingScreen.js})
- Appel vidéo via Jitsi Meet (WebView)
- Contrôles : micro (muet/actif), caméra (on/off), raccrocher
- Timer de durée d'appel
- Gestion des erreurs et écran de chargement

### Urgences / SOS (\texttt{EmergencyScreen.js})
- Bouton SOS large avec décompte
- Envoi de la position GPS + infos utilisateur (POST `/medical/emergency`)
- Carte interactive avec position actuelle
- Alerte sonore (haptique)
- Historique des alertes précédentes
- Accès direct SAMU via le triage IA

### Profil (\texttt{ProfileScreen.js})
- Nom, téléphone, rôle
- Sélecteur de groupe sanguin (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Sélecteur de langue (Français / Mooré / Dioula / Fulfuldé)

\newpage

## Médecin / Docteur

### Tableau de Bord (\texttt{DoctorDashboard.js})
- Indicateurs : consultations, ordonnances, file d'attente, alertes
- Liste des patients en attente avec niveau d'urgence
- Barre de recherche dans la file d'attente
- Gestion des rendez-vous (confirmer, refuser, compléter)
- Bouton d'accès aux épidémies (MDO)
- Alertes cliniques (tension élevée, pouls élevé)
- Bannière de vérification du compte

### Prescription (\texttt{PrescriptionScreen.js})
- **Étape 1** : Recherche/scan du patient (QR code ou téléphone)
- **Étape 2** : Saisie des signes vitaux (température, poids, tension, pouls, SpO2)
- **Étape 3** : Diagnostic (chips prédéfinies ou saisie libre)
- **Étape 4** : Prescription médicamenteuse
  - 32 médicaments courants avec dosages prédéfinis
  - Posologie personnalisable
  - Quantité
  - Moment de prise (Matin, Midi, Soir, Matin et Soir, Matin/Midi/Soir, Toutes les 8h)
- **Génération** : POST `/medical/consultations` → QR code unique
- Mode hors-ligne : sauvegarde SQLite + synchronisation automatique
- Validation : patient, diagnostic, au moins un médicament requis

### Dossier Patient (\texttt{PatientRecordScreen.js})
- Groupe sanguin et allergies
- Graphiques d'évolution (température, poids) en SVG
- Journal des consultations
- Historique des vaccinations

### File de Téléconsultation (\texttt{ConsultationScreen.js})
- Liste des patients en attente de téléconsultation
- Bouton pour lancer un appel vidéo Jitsi
- Statut de chaque consultation

### Messagerie (\texttt{DoctorMessagingScreen.js})
- Conversations par contact (regroupées)
- Messagerie temps réel via Socket.IO
- Nouvelle conversation par recherche de téléphone
- Interface sécurisée (HTTPS + tokens)

### Signalement Épidémiologique (\texttt{EpidemicReportScreen.js})
- Notification obligatoire (MDO — Maladie à Déclaration Obligatoire)
- Maladies : Paludisme grave, Choléra, Méningite, Fièvre jaune, Rage humaine
- Nombre de cas, localisation précise, notes
- Transmission chiffrée au Ministère de la Santé / DGISS / OMS
- Mode hors-ligne

\newpage

## Pharmacien

### Scan d'Ordonnance (\texttt{PharmacyScannerScreen.js})
- Scanner de QR code (expo-camera)
- Récupération des informations de l'ordonnance
- Validation de la prescription (expiration 24h, non délivrée)
- Liste des médicaments avec état (Disponible / Indisponible)
- Validation de la délivrance par article
- Cachet numérique officinal

### Gestion des Stocks (\texttt{InventoryScreen.js})
- Activation/désactivation de la pharmacie (visible sur la carte publique)
- Alertes de rupture de stock
- Configuration officine : nom, ville, GPS, téléphone, horaires
- Mise à jour des niveaux de stock

## Parent / Tuteur Légal

### Espace Parent (\texttt{ParentDashboard.js})
- Liste des enfants liés au compte
- Ajout d'enfant par :
  - Saisie du numéro de téléphone
  - Scan du QR code d'identité
- Notifications push pour les rappels vaccinaux
- Accès aux dossiers médicaux des enfants

### Carnet de Vaccination (\texttt{VaccineBookScreen.js})
- Liste des vaccins administrés avec dates
- Indicateur de prochaine dose
- QR code d'identification de l'enfant
- Courbes de croissance OMS (à venir)

\newpage

# Fonctionnalités Transversales

## QR Codes

| Usage              | Génération                    | Scan                  |
|--------------------|-------------------------------|-----------------------|
| Identité patient   | PatientDashboard             | Docteur (Prescription)|
| Ordonnance         | PrescriptionScreen           | Pharmacien (Scanner)  |
| Identité enfant    | ParentDashboard / VaccineBook| Parent (liaison)      |
| Cachet délivrance  | PharmacyScannerScreen        | Patient (vérification)|

Les QR codes utilisent le format `FASOCARE_ID:{uuid}` pour l'identité et les tokens hexadécimaux pour les ordonnances.

## Internationalisation

- **4 langues** : Français (fr), Mooré (mo), Dioula (di), Fulfuldé (fu)
- **Bibliothèque** : i18next + react-i18next
- **530 clés de traduction** couvrant l'intégralité de l'interface
- **Fallback** : les langues mo/di/fu utilisent le texte français comme placeholder pour les clés non encore traduites
- **Sélecteur** : présent sur l'écran de connexion et l'écran de profil
- **Détection** : langue du système comme valeur initiale

## Mode Hors-ligne

- **File d'attente SQLite** : les actions sont sauvegardées localement
- **Synchronisation automatique** : `SyncService` traite la file d'attente au retour du réseau
- **Actions supportées** : création de consultation, signalement épidémiologique, prise de rendez-vous, enregistrement de vaccination
- **Génération de QR offline** : mode dégradé avec préfixe `OFFLINE_MODE_`

## Messagerie Temps Réel

- Basée sur Socket.IO (namespace `/messages`)
- Connexion authentifiée par JWT
- Événements : `sendMessage`, `newMessage`, `messages`
- Sécurisé : HTTPS + token Bearer
- Interface : liste de conversations, bulles de chat, timestamps

## Thème (Clair / Sombre)

- Détection automatique via le système d'exploitation
- Persistance du choix utilisateur dans AsyncStorage
- Thème personnalisé avec couleurs adaptées pour tous les composants

\newpage

# API REST — Synthèse

L'application mobile communique avec un backend NestJS via une API REST.

## Endpoints Principaux

### Authentification
| Méthode | Endpoint                        | Description                |
|---------|---------------------------------|----------------------------|
| POST    | `/auth/login`                   | Connexion mot de passe     |
| POST    | `/auth/register`                | Création de compte         |
| POST    | `/auth/request-login-otp`       | Demande OTP connexion      |
| POST    | `/auth/login-otp`               | Connexion par OTP          |
| POST    | `/auth/forgot-password`         | Demande réinitialisation   |
| POST    | `/auth/reset-password`          | Réinitialisation mot passe |
| POST    | `/auth/refresh`                 | Rafraîchir JWT             |

### Médical
| Méthode | Endpoint                                  | Description                    |
|---------|-------------------------------------------|--------------------------------|
| GET     | `/medical/consultations`                  | Liste consultations            |
| POST    | `/medical/consultations`                  | Créer consultation             |
| GET     | `/medical/consultations/patient/me`       | Historique patient             |
| GET     | `/medical/consultations/{id}/items`       | Médicaments d'une consultation |
| POST    | `/medical/consultations/{id}/items`       | Ajouter médicaments            |
| GET     | `/medical/patients/{id}/history`          | Historique (vue docteur)       |
| GET     | `/medical/patients/latest`                | File d'attente                 |

### Traitement
| Méthode | Endpoint                                         | Description                    |
|---------|--------------------------------------------------|--------------------------------|
| POST    | `/medical/treatment-logs`                        | Créer log de prise             |
| GET     | `/medical/treatment-progress`                    | Progrès traitement patient     |
| GET     | `/medical/consultations/{id}/treatment-logs`     | Logs d'une consultation        |
| PATCH   | `/medical/treatment-logs/{id}/status`            | Marquer prise/sautée           |
| POST    | `/medical/consultations/{id}/generate-treatment-logs` | Générer logs automatiquement|

### Pharmacie
| Méthode | Endpoint                          | Description                |
|---------|-----------------------------------|----------------------------|
| GET     | `/pharmacies/public`              | Pharmacies (carte)         |
| POST    | `/pharmacies`                     | Créer pharmacie            |
| POST    | `/medical/dispense-items/{token}` | Délivrer médicaments       |
| GET     | `/medical/validate-prescription/{token}` | Valider QR ordonnance|

### Rendez-vous
| Méthode | Endpoint                             | Description                |
|---------|--------------------------------------|----------------------------|
| POST    | `/appointments`                      | Créer rendez-vous          |
| GET     | `/appointments/my-appointments`      | Mes rendez-vous            |
| PATCH   | `/appointments/{id}/confirm`         | Confirmer                  |
| PATCH   | `/appointments/{id}/cancel`          | Annuler                    |
| PATCH   | `/appointments/{id}/complete`        | Terminer                   |

### Autres
| Méthode | Endpoint                    | Description                |
|---------|-----------------------------|----------------------------|
| POST    | `/medical/emergency`        | Alerte SOS                 |
| POST    | `/ai/triage`                | Analyse IA des symptômes   |
| POST    | `/medical/epidemic-report`  | Signalement MDO            |
| GET     | `/vaccination/child/{id}`   | Carnet vaccinal enfant     |

\newpage

# Traitement des Médicaments — Fonctionnalité Clé

## Prescription

1. Le médecin sélectionne des médicaments parmi 32 produits courants
2. Pour chaque médicament : posologie, quantité, moment de prise
3. Les moments de prise possibles :
   - Matin (08:00)
   - Midi (12:00)
   - Soir (20:00)
   - Matin et Soir (08:00 + 20:00)
   - Matin, Midi et Soir (08:00 + 12:00 + 20:00)
   - Toutes les 8h (08:00 + 16:00 + 00:00)
4. Génération de l'ordonnance avec QR code → consultation en base de données

## Suivi du Traitement

1. Création automatique des logs de traitement lors de la prescription
2. Chaque log = une dose à prendre à une heure planifiée
3. Le patient voit dans son dossier médical :
   - La liste des médicaments prescrits avec leurs horaires
   - Des boutons d'action : ✅ (Prise) / ❌ (Sautée) par dose
   - Le statut visuel : vert = prise, rouge = sautée, jaune = en attente
4. API de mise à jour : PATCH `/medical/treatment-logs/{id}/status`
5. Possibilité de relancer manuellement la génération des logs

## Délivrance en Pharmacie

1. Le pharmacien scanne le QR code de l'ordonnance
2. Validation : ordonnance non expirée (24h), non déjà délivrée
3. Affichage de chaque médicament avec case à cocher
4. Pour chaque article : Disponible (✓) ou Indisponible (✗)
5. Validation finale → cachet numérique officinal
6. Le patient voit le cachet dans le détail de son ordonnance

\newpage

# Internationalisation — Détail

## Structure des Traductions

```
mobile/src/i18n/
├── config.js                   # Configuration i18next
└── locales/
    ├── fr.json                 # 530 clés — Français (langue par défaut)
    ├── mo.json                 # 530 clés — Mooré
    ├── di.json                 # 530 clés — Dioula
    └── fu.json                 # 530 clés — Fulfuldé
```

## Fonctionnement

- **Bibliothèque** : `i18next` + `react-i18next`
- **Hook** : `const { t } = useTranslation();`
- **Usage** : `{t('ma_cle')}` dans le JSX
- **Langue courante** stockée dans i18next, accessible via `i18n.language`
- **Changement** : `i18n.changeLanguage('mo')` (disponible sur LoginScreen et ProfileScreen)
- **Fallback** : `fr` est la langue de secours pour toutes les clés manquantes dans mo/di/fu

## Catégories de Clés

| Catégorie         | Nombre | Exemples                              |
|-------------------|--------|---------------------------------------|
| Authentification  | ~40    | login, password, otp_label            |
| Navigation        | ~15    | tab_home, tab_record, tab_emergency   |
| Dossier médical   | ~35    | dossier_medical, consultations        |
| Prescription      | ~50    | medicaments, posologie, quantite      |
| Vaccination       | ~20    | vaccine_calendar, prochain_dose       |
| Urgences          | ~15    | bouton_sos, danger_vital              |
| Pharmacie         | ~30    | pharmacie_ouverte, scanner_ordonnance |
| Parent            | ~25    | espace_parent, ajouter_enfant         |
| Docteur           | ~25    | file_attente, confirmer_rdv           |
| Général           | ~50    | succes, erreur, retour, annuler       |
| Traitement        | ~20    | suivi_traitement, prise, sautee       |
| Téléconsultation  | ~15    | teleconsultation, connexion_jitsi     |
| Rendez-vous       | ~20    | prendre_rdv, rdv_confirme             |
| Épidémie          | ~15    | signalement_transmis, maladie_detectee|
| Messagerie        | ~15    | messagerie_securisee, ecrire_message  |
| Configuration     | ~20    | configuration_serveur, url_serveur    |
| Droits citoyen    | ~5     | mes_droits_titre, mes_droits_contenu  |
| Temps de prise    | ~6     | temps_matin, temps_soir, temps_8h     |

\newpage

# Conclusion

FasoCare Mobile est une application de santé numérique complète, conçue pour le contexte burkinabè. Elle couvre l'ensemble du parcours de soin :

1. **Prévention** : carnet de vaccination, rappels automatiques
2. **Consultation** : prise de rendez-vous, téléconsultation vidéo
3. **Diagnostic** : IA de triage des symptômes, dossier médical partagé
4. **Prescription** : génération numérique avec QR code et suivi des doses
5. **Délivrance** : scan pharmacie, cachet officinal, gestion des stocks
6. **Suivi** : observance du traitement, historique complet
7. **Urgence** : bouton SOS avec géolocalisation

L'application est accessible en 4 langues (Français, Mooré, Dioula, Fulfuldé) et fonctionne en mode connecté comme hors-ligne, garantissant son utilisation sur l'ensemble du territoire.

\newpage

# Annexes

## A. Dépendances Principales

```
expo ~55.0.23
react 19.2.0
react-native 0.83.6
@react-navigation/native ^7.x
@react-navigation/stack ^4.x
@react-navigation/bottom-tabs ^7.x
axios ^1.14.0
zustand ^5.0.12
i18next ^26.0.3
react-i18next ^17.0.2
expo-camera ~16.2.1
react-native-qrcode-svg ^6.3.14
react-native-maps 1.27.2
react-native-webview 13.16.0
socket.io-client ^4.8.3
expo-sqlite ~15.2.2
expo-secure-store ~14.2.2
expo-local-authentication ~15.2.1
expo-location ~18.1.0
expo-notifications ~0.31.0
expo-haptics ~14.2.0
expo-speech ~13.2.0
@react-native-voice/voice ^0.5.0
lucide-react-native ^1.7.0
@react-native-async-storage/async-storage 2.1.2
@react-native-community/netinfo ^11.4.1
@sentry/react-native ~7.11.0
jest ~29.2.1
@testing-library/react-native ^12.4.0
```

## B. Écrans et Fichiers (33 fichiers)

| Fichier                          | Fonction                          |
|----------------------------------|-----------------------------------|
| Auth/WelcomeScreen.js            | Page d'accueil                    |
| Auth/LoginScreen.js              | Connexion                         |
| Auth/RegisterScreen.js           | Inscription                       |
| Auth/ForgotPasswordScreen.js     | Mot de passe oublié               |
| Auth/ResetPasswordScreen.js      | Réinitialisation mot de passe     |
| Auth/OtpVerificationScreen.js    | Vérification OTP                  |
| Home/PatientDashboard.js         | Tableau de bord patient           |
| Home/ParentDashboard.js          | Espace parent                     |
| Home/ProfileScreen.js            | Profil utilisateur                |
| Home/HomeScreen.js               | Accueil générique                 |
| Patient/MedicalRecordScreen.js   | Dossier médical                   |
| Patient/PrescriptionListScreen.js| Liste ordonnances                 |
| Patient/EmergencyScreen.js       | Urgences SOS                      |
| Patient/TriageScreen.js          | Triage IA                         |
| Patient/PharmacyDiscoveryScreen.js| Carte pharmacies                 |
| Patient/AppointmentScreen.js     | Rendez-vous                       |
| Patient/BookAppointmentScreen.js | Prise de rendez-vous              |
| Doctor/DoctorDashboard.js        | Tableau de bord docteur           |
| Doctor/DoctorPortal.js           | Portail docteur                   |
| Doctor/PrescriptionScreen.js     | Prescription                      |
| Doctor/PatientRecordScreen.js    | Dossier patient (vue docteur)     |
| Doctor/ConsultationScreen.js     | File téléconsultation             |
| Doctor/DoctorMessagingScreen.js  | Messagerie                        |
| Doctor/EpidemicReportScreen.js   | Signalement MDO                   |
| Pharmacist/PharmacyScannerScreen.js| Scan QR pharmacie               |
| Pharmacist/InventoryScreen.js    | Gestion stocks                    |
| Pharmacy/PharmacistDashboard.js  | Dashboard pharmacien              |
| Pharmacy/PharmacistPortal.js     | Portail pharmacien                |
| Parent/VaccineBookScreen.js      | Carnet vaccination                |
| Medical/MeetingScreen.js         | Visio Jitsi (custom)             |
| Medical/VideoCallScreen.js       | Visio Jitsi (URL directe)        |
| Medical/ChatScreen.js            | Chat 1-1 temps réel               |
| Settings/ServerConfigScreen.js   | Configuration serveur             |

\newpage

## C. Captures d'écran (suggestions)

\vspace{2cm}

\centering
*--- Insérer ici les captures d'écran de l'application ---*

\vspace{1cm}

| Écran suggéré             | Description                                |
|---------------------------|--------------------------------------------|
| WelcomeScreen             | Page d'accueil avec logo FasoCare          |
| LoginScreen               | Formulaire de connexion + sélecteur langue |
| PatientDashboard          | QR identité + grille de services           |
| MedicalRecordScreen       | Dossier médical + suivi traitement         |
| PrescriptionScreen        | Création d'ordonnance (vue docteur)        |
| EmergencyScreen           | Carte SOS + bouton d'urgence               |
| PharmacyScannerScreen     | Scan QR + validation médicaments           |
| ProfileScreen             | Profil + sélecteur groupe sanguin + langue |
