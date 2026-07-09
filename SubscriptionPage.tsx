import { supabase } from './config/supabaseClient';
import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { getCurrentPlan, activatePlan } from './payliv1';

interface SubscriptionPageProps {
  onTriggerToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
  userEmail: string;
  userName: string;
  userId: string;
}

interface Plan {
  slug: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
  is_active: boolean;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  onTriggerToast,
  userEmail,
  userName,
  userId
}) => {

  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState(getCurrentPlan());
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<'success' | 'cancel' | null>(null);


  // Chargement des tarifs depuis Supabase
  useEffect(() => {

    const fetchPlans = async () => {

      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });


      if (error) {
        console.error("Erreur chargement plans :", error);
        return;
      }


      setPlans(data || []);

    };


    fetchPlans();

  }, []);



  // Retour paiement Moneroo
  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    const payment = params.get('payment');
    const planId = params.get('plan');


    if (payment === 'success' && planId) {

      activatePlan(planId);

      setCurrentPlan(getCurrentPlan());

      setPaymentResult('success');

      onTriggerToast(
        'Paiement réussi, abonnement activé !',
        'success'
      );


      window.history.replaceState(
        {},
        '',
        window.location.pathname
      );


    } else if (payment === 'cancel') {

      setPaymentResult('cancel');

      window.history.replaceState(
        {},
        '',
        window.location.pathname
      );

    }


  }, []);



  const handleSubscribe = async (planId: string) => {


    const selectedPlan = plans.find(
      (p) => p.slug === planId
    );


    if (!selectedPlan) {

      onTriggerToast(
        "Plan introuvable",
        "warning"
      );

      return;
    }



    if (planId === 'gratuit') {

      activatePlan('gratuit');

      setCurrentPlan(
        getCurrentPlan()
      );

      onTriggerToast(
        'Plan Gratuit activé',
        'success'
      );

      return;
    }



    if (planId === 'enterprise') {

      onTriggerToast(
        'Contactez-nous au +2290166336546',
        'info'
      );

      return;
    }



    setLoading(planId);



    try {


      const response = await fetch(
        "https://swhjkrdhmkdwpmmvuuji.supabase.co/functions/v1/create-moneroo-paiement",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Authorization":
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
          },


          body: JSON.stringify({

            amount: Number(selectedPlan.price),

            plan: selectedPlan.slug,

            userId: userId,


            customer: {

              email: userEmail,

              first_name:
                userName.split(" ")[0] || "",

              last_name:
                userName.split(" ").slice(1).join(" ")
                || "Client"

            }

          })

        }
      );



      const result = await response.json();



      const checkoutUrl =
        result.checkoutUrl ||
        result.data?.checkout_url;



      if (checkoutUrl) {

        window.location.href = checkoutUrl;


        onTriggerToast(
          "Redirection vers Moneroo...",
          "info"
        );


      } else {


        console.error(
          "Erreur Moneroo:",
          result
        );


        onTriggerToast(
          JSON.stringify(result),
          "warning"
        );


      }



    } catch (error: any) {


      onTriggerToast(
        "Erreur connexion : " + error.message,
        "warning"
      );


      console.error(error);


    }



    setLoading(null);

  };



  return (

    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">


      {paymentResult === 'success' && (

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center space-x-4">

          <CheckCircle2 className="w-8 h-8 text-emerald-600" />

          <div>

            <h3 className="font-bold text-emerald-900">
              Paiement réussi !
            </h3>

            <p className="text-xs text-emerald-700">
              Votre abonnement a été activé.
            </p>

          </div>

        </div>

      )}



      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


        {plans.map((plan) => (


          <div
            key={plan.slug}
            className="border rounded-2xl p-6 flex flex-col"
          >


            <h3 className="text-xl font-bold">
              {plan.name}
            </h3>


            <p className="text-3xl font-bold mt-2">

              {plan.price} {plan.currency}

            </p>


            <p className="text-sm text-gray-500">

              par {plan.duration}

            </p>



            <ul className="space-y-2 text-sm mt-4 flex-1">


              {plan.features?.map(
                (feature, index) => (

                  <li
                    key={index}
                    className="flex items-start"
                  >

                    <span className="text-green-500 mr-2">
                      ✓
                    </span>

                    {feature}

                  </li>

                )
              )}


            </ul>



            <button

              onClick={() =>
                handleSubscribe(plan.slug)
              }

              disabled={
                loading === plan.slug
              }

              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"

            >

              {
                loading === plan.slug
                ? "Chargement..."
                : "S'abonner"
              }


            </button>



          </div>


        ))}


      </div>


    </div>

  );

};
