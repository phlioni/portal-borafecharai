
import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface UserTrialEndDateProps {
  user: {
    role?: string;
    subscriber?: {
      subscribed: boolean;
      subscription_tier?: string;
      trial_end_date?: string;
    };
  };
}

const UserTrialEndDate = ({ user }: UserTrialEndDateProps) => {
  const isUserRole = user.role === 'user';
  const hasActiveSubscription = user.subscriber?.subscribed && user.subscriber?.subscription_tier;
  const trialEndDate = user.subscriber?.trial_end_date;

  // Formatrar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Se tem assinatura ativa, não mostrar trial
  if (hasActiveSubscription) {
    return (
      <div className="flex items-center gap-1 text-xs text-green-600">
        <Calendar className="h-3 w-3" />
        <span>Assinatura Ativa</span>
      </div>
    );
  }

  // Se é role user e tem data de trial
  if (isUserRole && trialEndDate) {
    const endDate = new Date(trialEndDate);
    const now = new Date();
    const isExpired = endDate < now;

    return (
      <div className={`flex items-center gap-1 text-xs ${isExpired ? 'text-red-600' : 'text-blue-600'}`}>
        <Clock className="h-3 w-3" />
        <span>
          {isExpired ? 'Expirou em' : 'Válido até'} {formatDate(trialEndDate)}
        </span>
      </div>
    );
  }

  // Se é role user mas não tem trial configurado
  if (isUserRole) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Clock className="h-3 w-3" />
        <span>Trial não configurado</span>
      </div>
    );
  }

  // Para outras roles
  return (
    <div className="flex items-center gap-1 text-xs text-gray-500">
      <span>N/A</span>
    </div>
  );
};

export default UserTrialEndDate;
