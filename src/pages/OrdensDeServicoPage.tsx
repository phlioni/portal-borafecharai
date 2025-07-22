
import React from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceOrdersCalendar from '@/components/ServiceOrdersCalendar';
import ServiceOrdersTable from '@/components/ServiceOrdersTable';
import { Calendar, List } from 'lucide-react';

const OrdensDeServicoPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas ordens de serviço e agendamentos
          </p>
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="mt-6">
            <ServiceOrdersCalendar />
          </TabsContent>
          
          <TabsContent value="table" className="mt-6">
            <ServiceOrdersTable />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OrdensDeServicoPage;
