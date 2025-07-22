
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyTab from "@/components/CompanyTab";
import ProfileTab from "@/components/ProfileTab";
import EmailTemplateSettings from "@/components/EmailTemplateSettings";
import TelegramBotUserGuide from "@/components/TelegramBotUserGuide";
import WhatsAppBotSettings from "@/components/WhatsAppBotSettings";
import { ServiceAvailabilitySettings } from "@/components/ServiceAvailabilitySettings";
import { Building2, User, Mail, MessageCircle, Phone, Calendar } from "lucide-react";

const ConfiguracoesPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas configurações de perfil, empresa e integrações.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 size={16} />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail size={16} />
            E-mail
          </TabsTrigger>
          <TabsTrigger value="telegram" className="flex items-center gap-2">
            <MessageCircle size={16} />
            Telegram
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <Phone size={16} />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="agendamento" className="flex items-center gap-2">
            <Calendar size={16} />
            Agendamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="company">
          <CompanyTab />
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

        <TabsContent value="agendamento">
          <ServiceAvailabilitySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;
