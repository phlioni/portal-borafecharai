
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';

export const SignatureSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Configurações de Assinatura
        </CardTitle>
        <CardDescription>
          Gerencie sua assinatura e planos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">
          Configurações de assinatura em desenvolvimento.
        </p>
      </CardContent>
    </Card>
  );
};
