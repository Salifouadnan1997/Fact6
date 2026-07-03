import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

export const useSubscriptionGuard = () => {
  const navigate = useNavigate();

  const checkAndProceed = async (feature: string, action: () => void) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-quota', {
        body: { feature }
      });
      if (error || !data?.allowed) {
        navigate('/subscription');
        return;
      }
      action();
      await supabase.functions.invoke('increment-usage', { body: { feature } });
    } catch (err) {
      console.error("Erreur Guard:", err);
      navigate('/subscription');
    }
  };

  return { checkAndProceed };
};
