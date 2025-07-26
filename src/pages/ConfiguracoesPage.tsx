
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CompanyTab from '@/components/CompanyTab';
import ProfileTab from '@/components/ProfileTab';
import EmailTemplateSettings from '@/components/EmailTemplateSettings';
import TelegramBotUserGuide from '@/components/TelegramBotUserGuide';
import WhatsAppBotSettings from '@/components/WhatsAppBotSettings';
import AvailabilityTab from '@/components/AvailabilityTab';

const ConfiguracoesPage = () => {
  const [activeTab, setActiveTab] = useState('perfil');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie suas informações e preferências</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="telegram">Telegram</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="empresa">
          <CompanyTab />
        </TabsContent>

        <TabsContent value="agenda">
          <AvailabilityTab />
        </TabsContent>

        <TabsContent value="email">
          <EmailTemplateSettings />
        </TabsContent>

        <TabsContent value="telegram">
          <TelegramBotUserGuide />
        </TabsContent>

        <TabsContent value="whatsapp">
          <WhatsAppBotSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;
