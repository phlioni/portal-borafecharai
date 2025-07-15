import React, { useState } from 'react';
import { Building2, Crown, Mail, MessageSquare, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSubscription } from '@/hooks/useSubscription';
import { CompanySettings } from '@/components/CompanySettings';
import { ProfileSettings } from '@/components/ProfileSettings';
import { TelegramBotSettings } from '@/components/TelegramBotSettings';
import { SignatureSettings } from '@/components/SignatureSettings';
import EmailTemplateSettings from '@/components/EmailTemplateSettings';

const ConfiguracoesPage = () => {
  const [activeTab, setActiveTab] = useState<string>('empresa');
  const { toast } = useToast();
  const { subscribed } = useSubscription();

  const primaryTabs = [
    { value: 'empresa', label: 'Meu Negócio', icon: Building2 },
    { value: 'perfil', label: 'Perfil', icon: User },
    { value: 'email', label: 'Templates de Email', icon: Mail },
    { value: 'telegram', label: 'Telegram Bot', icon: MessageSquare },
    { value: 'assinatura', label: 'Assinatura', icon: Crown },
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'empresa':
        return <CompanySettings />;
      case 'perfil':
        return <ProfileSettings />;
      case 'email':
        return <EmailTemplateSettings />;
      case 'telegram':
        return <TelegramBotSettings />;
      case 'assinatura':
        return <SignatureSettings />;
      default:
        return <CompanySettings />;
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-2 text-sm text-gray-500">
          Gerencie as configurações da sua conta e personalize sua experiência.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="bg-muted h-11 w-full rounded-lg p-1 flex items-center justify-between">
          {primaryTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {primaryTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="focus:outline-none">
            {renderTabContent()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;
