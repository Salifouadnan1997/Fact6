import { supabase } from './supabase';

export const useSubscriptionGuard = () => {

  const checkAndProceed = async (feature: string, action: () => void) => {
    try {
      // 1. Récupérer l'ID de l'utilisateur actuellement connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/subscription';
        return;
      }

      // 2. Traduire 'invoice' en 'factures' pour correspondre à ta base de données
      const metricName = feature === 'invoice' ? 'factures' : feature;

      // 3. Envoyer les bonnes données à la fonction Supabase
      const { data, error } = await supabase.functions.invoke('check-quota', {
        body: { 
          user_id: user.id, 
          metric: metricName 
        }
      });

      // Si la fonction refuse ou s'il y a une erreur, on redirige vers la page d'abonnement
      if (error || !data?.allowed) {
        window.location.href = '/subscription';
        return;
      }

      // Si tout est validé, on lance l'action (Téléchargement ou Impression)
      action();
      
    } catch (err) {
      console.error("Erreur Guard:", err);
      window.location.href = '/subscription';
    }
  };

  return { checkAndProceed };
};
