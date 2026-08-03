import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://swhjkrdhmkdwpmmvuuji.supabase.co';

const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_GkV_bY-ofJE58B02KFJXiA_yYSTAF-H';

const supabaseSdk = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const useSubscriptionGuard = () => {
  const checkAndProceed = async (
    _feature: string,
    action: () => void | Promise<void>
  ) => {
    try {
      let userId = null;

      const {
        data: { user }
      } = await supabaseSdk.auth.getUser();

      userId = user?.id;

      if (!userId) {
        const customToken = localStorage.getItem('factureset_session');

        if (customToken) {
          try {
            const payload = JSON.parse(
              atob(customToken.split('.')[1])
            );
            userId = payload.sub;
          } catch (e) {
            console.error(
              "Erreur de lecture du token perso :",
              e
            );
          }
        }
      }

      if (!userId) {
        alert("Action refusée : Vous n'êtes pas connecté.");
        return;
      }

      // CONTRÔLE ABONNEMENT/QUOTA DÉSACTIVÉ TEMPORAIREMENT.
      // L'utilisateur connecté peut générer librement.
      await action();

    } catch (err: any) {
      alert(
        "Détail du bug : " +
        (err?.message || JSON.stringify(err) || "Erreur inconnue")
      );
    }
  };

  return { checkAndProceed };
};
