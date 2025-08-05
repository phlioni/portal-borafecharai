
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ProfileTab from "@/components/ProfileTab";
import CompanyTab from "@/components/CompanyTab";
import EmailTemplateSettings from "@/components/EmailTemplateSettings";
import WhatsAppBotSettings from "@/components/WhatsAppBotSettings";
import { ServiceAvailabilityTab } from "@/components/ServiceAvailabilityTab";
import { User, Building2, Mail, MessageCircle, Clock } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas informações pessoais, da empresa e preferências.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1">
              <TabsTrigger value="profile" className="flex items-center gap-2 px-3 py-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2 px-3 py-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Empresa</span>
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-2 px-3 py-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Atendimento</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2 px-3 py-2">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center gap-2 px-3 py-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="profile" className="mt-0">
                <ProfileTab />
              </TabsContent>

              <TabsContent value="company" className="mt-0">
                <CompanyTab />
              </TabsContent>

              <TabsContent value="attendance" className="mt-0">
                <ServiceAvailabilityTab />
              </TabsContent>

              <TabsContent value="email" className="mt-0">
                <EmailTemplateSettings />
              </TabsContent>

              <TabsContent value="whatsapp" className="mt-0">
                <WhatsAppBotSettings />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
