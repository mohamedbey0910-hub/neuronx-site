# Activer le formulaire de devis

Le formulaire passe par Vercel puis Google Apps Script. Apps Script envoie chaque demande à ton adresse Gmail. Aucun serveur n8n sur ton PC n'est nécessaire.

## 1. Créer le relais Google

1. Ouvre [Google Apps Script](https://script.google.com/home/start) avec le compte Google qui recevra les demandes.
2. Crée un projet, puis remplace le contenu de `Code.gs` par celui du fichier `google-apps-script/Code.gs` de ce dépôt.
3. Dans **Paramètres du projet** (icône ⚙️) → **Propriétés du script**, ajoute :
   - `QUOTE_TO_EMAIL` : l'adresse qui doit recevoir les demandes.
   - `QUOTE_FORWARD_SECRET` : un secret aléatoire long (au moins 32 caractères). Garde-le privé.
4. Dans l'éditeur, sélectionne `authorizeEmail` dans la liste des fonctions puis clique sur **Exécuter**. Accepte l'autorisation d'envoyer des emails.

## 2. Déployer le relais

1. Clique **Déployer** → **Nouveau déploiement**.
2. Choisis le type **Application Web**.
3. Sélectionne **Exécuter en tant que : Moi** et **Qui a accès : Tout le monde**.
4. Clique **Déployer**, puis copie l'URL qui se termine par `/exec`.

## 3. Relier Vercel

Dans **Vercel → projet neuronx-site → Settings → Environment Variables**, ajoute ces deux variables pour **Production** et **Preview** :

- `GOOGLE_APPS_SCRIPT_URL` : l'URL `/exec` copiée à l'étape précédente.
- `QUOTE_FORWARD_SECRET` : exactement le même secret que dans les propriétés du script.

Garde aussi `GROQ_API_KEY` pour le chat. Tu pourras supprimer `N8N_WEBHOOK_URL` une fois que le formulaire fonctionne. Après avoir enregistré les variables, redéploie l'aperçu ou le site.

## 4. Vérifier

Sur l'aperçu Vercel, envoie une demande de test avec ton adresse email, puis vérifie la boîte de réception (et les courriers indésirables). Le bouton de confirmation du site ne s'affiche que si l'email a été accepté.

Le relais utilise les quotas d'envoi Google Apps Script du compte qui le déploie. Ne partage pas le secret et ne le colle jamais dans le code du site.
