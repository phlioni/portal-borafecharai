
import React from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompanyTab from '@/components/CompanyTab';
import ProfileTab from '@/components/ProfileTab';
import EmailTemplateSettings from '@/components/EmailTemplateSettings';
import TelegramBotUserGuide from '@/components/TelegramBotUserGuide';
import WhatsAppBotSettings from '@/components/WhatsAppBotSettings';
import SchedulingSettings from '@/components/SchedulingSettings';

const ConfiguracoesPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas configurações de perfil, empresa e sistema
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="company">Empresa</TabsTrigger>
            <TabsTrigger value="scheduling">Agendamento</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="telegram">Telegram</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <ProfileTab />
          </TabsContent>
          
          <TabsContent value="company" className="mt-6">
            <CompanyTab />
          </TabsContent>
          
          <TabsContent value="scheduling" className="mt-6">
            <SchedulingSettings />
          </TabsContent>
          
          <TabsContent value="email" className="mt-6">
            <EmailTemplateSettings />
          </TabsContent>
          
          <TabsContent value="telegram" className="mt-6">
            <TelegramBotUserGuide />
          </TabsContent>
          
          <TabsContent value="whatsapp" className="mt-6">
            <WhatsAppBotSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ConfiguracoesPage;
