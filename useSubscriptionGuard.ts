import { supabase } from './supabase';

export const useSubscriptionGuard = () => {

  const checkAndProceed = async (feature: string, action: () => void | Promise<void>) => {
    try {
      // 1. Vérification de l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Action refusée : Vous n'êtes pas connecté.");
        return;
      }

      const metricName = feature === 'invoice' ? 'factures' : feature;

      // 2. Appel à la fonction Supabase
      const { data, error } = await supabase.functions.invoke('check-quota', {
        body: { user_id: user.id, metric: metricName }
      });

      if (error) {
        alert("Erreur serveur : Impossible de vérifier l'abonnement.");
        console.error("Détail de l'erreur:", error);
        return;
      }

      // 3. Vérification du droit d'accès
      if (!data?.allowed) {
        alert("Alerte : Quota dépassé ou aucun abonnement actif. Vous devez souscrire à un plan.");
        // (On a enlevé la redirection ici pour stopper le clignotement)
        return;
      }

      // 4. Si tout est bon, on lance le téléchargement ou l'impression
      await action();
      
    } catch (err) {
      console.error("Erreur Guard:", err);
      alert("Une erreur inattendue s'est produite lors de la vérification.");
    }
  };

  return { checkAndProceed };
};
