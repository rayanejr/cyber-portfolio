# 📚 Documentation Technique - Portfolio Rayane Jerbi

## 🏗️ Architecture du Projet

### **Frontend**
- **Framework**: React 18.3.1 avec TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v6.30.1
- **Styling**: 
  - Tailwind CSS avec design system personnalisé
  - Animations personnalisées (cyber theme)
  - shadcn/ui components
- **State Management**: React Hooks (useState, useEffect)
- **Forms**: React Hook Form avec validation Zod
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Themes**: next-themes pour dark/light mode

### **Backend**
- **BaaS**: Supabase (Backend as a Service)
- **Edge Functions**: Deno (TypeScript)
  - `ai-assistant`: Assistant IA intégré (Lovable AI Gateway)
  - `bulk-insert-projects`: Insertion en masse de projets
  - `encryption-service`: Service de chiffrement
  - `generate-project-image*`: Génération d'images de projets (Gemini, HuggingFace, Lovable)
  - `github-sync`: Synchronisation avec GitHub
  - `secure-cv-download`: Téléchargement sécurisé du CV
  - `security-*`: Suite de fonctions de sécurité (monitoring, scan, tests)
  - `user-management`: Gestion des utilisateurs
  - `veille-*`: Gestion de la veille technologique

### **Base de Données**
- **SGBD**: PostgreSQL (via Supabase)
- **Tables principales**:
  - `projects`: Projets avec technologies, images, liens
  - `experiences`: Expériences professionnelles
  - `formations`: Parcours de formation
  - `skills`: Compétences techniques par catégorie
  - `certifications`: Certifications avec PDFs et credentials
  - `veille_techno`: Articles de veille technologique
  - `tools`: Outils et technologies
  - `contact_messages`: Messages du formulaire de contact
  - `admin_files`: Fichiers administratifs (CV, logos, photos)
  - `rate_limit_contact`: Rate limiting pour anti-spam
  - `security_events`: Événements de sécurité

- **Fonctions DB**:
  - `is_admin()`: Vérification des droits administrateur
  - `check_contact_rate_limit()`: Rate limiting (max 3 messages/15min)
  - `cleanup_old_security_data()`: Nettoyage automatique
  - `log_security_event()`: Logging des événements de sécurité
  - `validate_password_strength()`: Validation de mot de passe (ANSSI)

- **Triggers**:
  - `check_contact_rate_limit`: Appliqué avant insertion dans `contact_messages`
  - `log_spam_attempt`: Logging des tentatives de spam
  - `update_updated_at`: Mise à jour automatique des timestamps

- **RLS (Row Level Security)**:
  - Activé sur toutes les tables sensibles
  - Policies pour lecture publique sur contenus actifs
  - Policies admin pour CRUD complet
  - Isolation des données par utilisateur où applicable

### **Sécurité**
- **Authentification**: Supabase Auth (JWT)
- **Chiffrement**: AES-256 pour données sensibles
- **Rate Limiting**: Au niveau DB et application
- **Protection CSRF**: Tokens et headers sécurisés
- **RLS**: Row Level Security sur toutes les tables
- **RGPD**: Politique de rétention des données (30 jours pour IPs)
- **Validation**: Zod pour validation des entrées
- **Logging**: Événements de sécurité centralisés

### **Stockage (Storage)**
- **Buckets Supabase**:
  - `projects`: Images de projets (public)
  - `blogs`: Images de blog (public)
  - `admin-files`: Fichiers administratifs (public)
- **Politiques**: 
  - Lecture publique pour tous
  - Écriture réservée aux admins

---

## 🔐 Administration du Portfolio

### **Accès Admin**
**URL**: `https://votre-domaine.com/admin`

**Authentification**:
- Email/Password via Supabase Auth
- Tokens JWT automatiques
- Sessions persistantes avec refresh automatique

### **Fonctionnalités Admin**

#### **1. Dashboard (Tableau de bord)**
- Vue d'ensemble des statistiques
- Messages de contact non lus
- Accès rapide à toutes les sections

#### **2. Gestion des Projets**
- CRUD complet des projets
- Upload d'images vers Supabase Storage
- Génération d'images IA (Gemini, HuggingFace, Lovable)
- Synchronisation GitHub
- Marquage de projets featured
- Gestion des technologies/tags

#### **3. Veille Technologique**
- Import automatique depuis sources RSS/API
- Catégorisation (Sécurité, DevOps, Cloud, etc.)
- Gestion des CVE
- Publication/dépublication d'articles
- Mise en avant d'articles

#### **4. Expériences Professionnelles**
- Ajout/modification d'expériences
- Gestion des technologies utilisées
- Achievements par expérience
- Timeline automatique

#### **5. Formations**
- Gestion du parcours académique
- Compétences acquises par formation
- Niveaux de diplôme

#### **6. Compétences (Skills)**
- Organisation par catégories
- Niveaux de maîtrise (1-5)
- Icônes personnalisables
- Mise en avant de compétences

#### **7. Certifications**
- Upload de PDFs
- Liens vers credentials
- Gestion des dates d'expiration
- Images de certifications

#### **8. Outils & Technologies**
- Catalogue des outils utilisés
- Configuration JSONB personnalisable
- Catégorisation

#### **9. Fichiers Admin**
- CV (téléchargement sécurisé)
- Photos de profil
- Logos
- Gestion par catégories

#### **10. Messages de Contact**
- Consultation des messages
- Marquage lu/non-lu
- Suppression
- Détails IP/timestamp

#### **11. Sécurité Avancée**
- Dashboard de sécurité
- Logs d'événements
- Détection d'anomalies
- Scan de vulnérabilités
- Tests de sécurité automatisés
- Gestion des IPs bloquées
- Rate limiting monitoring

#### **12. Utilisateurs (Auth)**
- Liste des utilisateurs Supabase Auth
- Détails des sessions
- Gestion des rôles

#### **13. GitHub Sync**
- Synchronisation bidirectionnelle
- Import/export de projets
- Logs de synchronisation

---

## 🤖 Administration des IA

### **1. Assistant IA (AI Assistant Section)**

**Edge Function**: `ai-assistant`

**Configuration**:
```typescript
// supabase/functions/ai-assistant/index.ts
// Utilise Lovable AI Gateway
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const AI_ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
```

**Modèles disponibles**:
- `google/gemini-2.5-flash` (par défaut, rapide)
- `google/gemini-2.5-pro` (plus puissant)
- `openai/gpt-5-mini` (équivalent à Gemini Flash)

**Administration**:
1. Accès aux secrets: Supabase Dashboard > Settings > Edge Functions
2. Configuration du prompt système dans l'edge function
3. Ajustement du modèle dans le code
4. Monitoring des coûts via Lovable Dashboard

**Utilisation dans le portfolio**:
- Section "Assistant IA" sur la page d'accueil
- Chat conversationnel
- Aide à la navigation
- Informations sur les projets/compétences

---

### **2. Génération d'Images IA**

**Edge Functions multiples**:

#### **A. generate-project-image-gemini**
- **Modèle**: Google Gemini 2.5 Flash Image Preview
- **Usage**: Génération d'images de projets basée sur description
- **Configuration**:
  ```typescript
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  // Résolution: 1024x1024 par défaut
  ```

#### **B. generate-project-image-hf** 
- **Modèle**: Stable Diffusion via HuggingFace
- **Token requis**: `HUGGING_FACE_ACCESS_TOKEN`
- **Usage**: Alternative pour génération d'images

#### **C. generate-project-images-lovable**
- **Service**: Lovable Image Generation API
- **Usage**: Batch generation via Lovable

#### **D. generate-all-project-images**
- **Usage**: Génération en masse pour tous les projets sans image
- **Appel**: Bouton dans Admin > Projets

**Administration**:
1. **Configurer les secrets IA**:
   - Supabase Dashboard > Settings > Edge Functions
   - Ajouter/vérifier: `LOVABLE_API_KEY`, `HUGGING_FACE_ACCESS_TOKEN`

2. **Génération manuelle**:
   - Admin > Projets > Bouton "Générer image IA" par projet
   - Ou "Générer toutes les images" pour batch

3. **Personnalisation des prompts**:
   - Modifier dans l'edge function correspondante
   - Redéploiement automatique

4. **Monitoring**:
   - Logs: Supabase Dashboard > Edge Functions > Logs
   - Taux d'erreur, temps de réponse

---

### **3. Sécurité IA & Monitoring**

**Edge Functions de sécurité**:

#### **security-vulnerability-scanner**
- Scan automatique de vulnérabilités
- Détection de patterns suspects
- Scoring de sécurité

#### **security-real-tests**
- Tests de pénétration automatisés
- Vérification des endpoints
- Validation RLS

#### **security-monitor**
- Monitoring temps réel
- Alertes sur anomalies
- Dashboard de santé

**Configuration**:
```typescript
// Webhooks et alertes
const ALERT_THRESHOLD = "MEDIUM"; // ou HIGH, CRITICAL
const NOTIFICATION_EMAIL = "admin@example.com";
```

**Administration**:
1. Admin > Sécurité > Tests
2. Lancer scans manuels
3. Consulter rapports
4. Activer/désactiver alertes email

---

## 🔧 Maintenance & Déploiement

### **Environnements**
- **Dev**: Lovable IDE preview
- **Production**: Déployé automatiquement via Vercel/Netlify

### **Secrets à configurer**
```env
SUPABASE_URL=https://pcpjqxuuuawwqxrecexm.supabase.co
SUPABASE_ANON_KEY=<votre-clé>
SUPABASE_SERVICE_ROLE_KEY=<clé-service>
LOVABLE_API_KEY=<auto-généré>
HUGGING_FACE_ACCESS_TOKEN=<votre-token>
ANTHROPIC_API_KEY=<optionnel>
OPENAI_API_KEY=<optionnel>
ENCRYPTION_KEY=<clé-32-caractères>
```

### **Mises à jour**
1. **Code frontend**: Push sur GitHub → Auto-deploy
2. **Edge Functions**: Déploiement automatique via Supabase CLI
3. **DB Migrations**: Via SQL Editor Supabase ou migrations versionnées

### **Monitoring**
- **Logs**: Supabase Dashboard > Edge Functions > Logs
- **Analytics**: Admin > Dashboard
- **Sécurité**: Admin > Sécurité > Events

### **Backup**
- **DB**: Backups automatiques Supabase (quotidiens)
- **Storage**: Réplication automatique
- **Code**: Versionné sur GitHub

---

## 📊 Stack Technique Complète

### **Langages**
- TypeScript (frontend + edge functions)
- SQL (PostgreSQL)
- CSS (Tailwind)
- HTML (JSX/TSX)

### **Frameworks & Librairies**
- React 18
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- React Hook Form
- Zod
- TanStack Query
- date-fns

### **Backend & BaaS**
- Supabase (Auth, DB, Storage, Edge Functions)
- PostgreSQL
- Deno (runtime Edge Functions)

### **IA & APIs**
- Lovable AI Gateway (Gemini + OpenAI)
- Google Gemini 2.5 Flash/Pro
- HuggingFace Inference API
- OpenAI GPT (optionnel)

### **DevOps & Tooling**
- Git & GitHub
- Vercel/Netlify (hosting)
- Supabase CLI
- Bun (package manager)

---

## 🛡️ Sécurité & Conformité

### **Mesures de sécurité implémentées**
✅ Rate limiting DB + application  
✅ Validation Zod sur tous les inputs  
✅ RLS activé sur toutes les tables  
✅ Chiffrement AES-256 pour données sensibles  
✅ Authentification JWT (Supabase Auth)  
✅ Protection CSRF  
✅ Politique de rétention RGPD (30 jours IPs)  
✅ Logging centralisé des événements de sécurité  
✅ Scan automatique de vulnérabilités  
✅ Tests de pénétration automatisés  
✅ Headers de sécurité (CSP, HSTS, etc.)  

### **Conformité RGPD**
- Politique de rétention des données
- Suppression automatique (IPs après 30 jours)
- Consentement explicite pour contact
- Droit à l'oubli implémenté

---

## 📞 Support & Contact

Pour toute question technique ou problème d'administration:
- **Email**: admin@rayane-jerbi.com
- **GitHub**: [lien-du-repo]
- **Documentation Supabase**: https://supabase.com/docs
- **Documentation Lovable AI**: https://docs.lovable.dev

---

**Dernière mise à jour**: 19 Octobre 2025  
**Version**: 1.0.0
