import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building2, Mail, Settings, Bot } from 'lucide-react';
import ProfileTab from '@/components/ProfileTab';
import CompanyTab from '@/components/CompanyTab';
import EmailTemplateSettings from '@/components/EmailTemplateSettings';
import TelegramBotSettings from '@/components/TelegramBotSettings';
import ConfigProfileCompletionHandler from '@/components/ConfigProfileCompletionHandler';

const ConfiguracoesPage = () => {
  const [activeTab, setActiveTab] = useState('perfil');

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <ConfigProfileCompletionHandler />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e configurações da conta
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="empresa" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Meu Negócio
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="telegram" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Telegram
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>
                Configure as informações da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Templates de Email
              </CardTitle>
              <CardDescription>
                Configure os templates de email para envio de propostas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailTemplateSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telegram">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Telegram Bot
              </CardTitle>
              <CardDescription>
                Configure o bot do Telegram para receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TelegramBotSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;
