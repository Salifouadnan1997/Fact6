import { createClient } from '@supabase/supabase-js';

// 1. On configure le VRAI client officiel directement ici pour éviter le conflit avec ton fichier perso
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://swhjkrdhmkdwpmmvuuji.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GkV_bY-ofJE58B02KFJXiA_yYSTAF-H';

const supabaseSdk = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const useSubscriptionGuard = () => {

  const checkAndProceed = async (feature: string, action: () => void | Promise<void>) => {
    try {
      let userId = null;

      // 2A. On tente de récupérer l'utilisateur avec le SDK officiel
      const { data: { user } } = await supabaseSdk.auth.getUser();
      userId = user?.id;

      // 2B. S'il n'est pas trouvé, on regarde si ton système de session personnalisé (factureset_session) est actif
      if (!userId) {
        const customToken = localStorage.getItem('factureset_session');
        if (customToken) {
          try {
            // On décode le token JWT pour extraire l'ID utilisateur
            const payload = JSON.parse(atob(customToken.split('.')[1]));
            userId = payload.sub;
          } catch (e) {
            console.error("Erreur de lecture du token perso :", e);
          }
        }
      }

      // Si vraiment aucun ID n'est trouvé, on bloque.
      if (!userId) {
        alert("Action refusée : Vous n'êtes pas connecté.");
        return;
      }

      const metricName = feature === 'invoice' ? 'factures' : feature;

      // 3. Appel à ta Edge Function avec le vrai SDK
      const { data, error } = await supabaseSdk.functions.invoke('check-quota', {
        body: { user_id: userId, metric: metricName }
      });

      if (error) {
        throw new Error("Erreur Serveur Supabase : " + error.message);
      }

      // 4. Vérification finale du droit d'accès
      if (!data?.allowed) {
        alert("Alerte : Quota dépassé ou aucun abonnement actif. Vous devez souscrire à un plan.");
        return;
      }

      // 5. Tout est validé, on lance l'impression ou le téléchargement !
      await action();
      
    } catch (err: any) {
      alert("Détail du bug : " + (err.message || JSON.stringify(err) || "Erreur inconnue"));
    }
  };

  return { checkAndProceed };
};
