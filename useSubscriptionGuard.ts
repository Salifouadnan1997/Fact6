import { supabase } from './supabase';

export const useSubscriptionGuard = () => {

  const checkAndProceed = async (feature: string, action: () => void | Promise<void>) => {
    try {
      // 1. Vérification de l'utilisateur avec capture d'erreur
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error("Problème d'authentification : " + authError.message);
      }
      
      if (!user) {
        alert("Action refusée : Vous n'êtes pas connecté.");
        return;
      }

      const metricName = feature === 'invoice' ? 'factures' : feature;

      // 2. Appel à la fonction Supabase avec capture d'erreur
      const { data, error } = await supabase.functions.invoke('check-quota', {
        body: { user_id: user.id, metric: metricName }
      });

      if (error) {
        throw new Error("Erreur Edge Function : " + error.message);
      }

      // 3. Vérification du droit d'accès
      if (!data?.allowed) {
        alert("Alerte : Quota dépassé ou aucun abonnement actif. Vous devez souscrire à un plan.");
        return;
      }

      // 4. Lancement de l'action
      await action();
      
    } catch (err: any) {
      // C'est ICI qu'on va afficher le vrai problème technique à l'écran !
      alert("Détail du bug : " + (err.message || JSON.stringify(err) || "Erreur inconnue"));
    }
  };

  return { checkAndProceed };
};
