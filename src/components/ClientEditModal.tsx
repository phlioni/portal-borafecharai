
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Save, User, MapPin, Globe, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Company {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ClientEditModalProps {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyUpdated: () => void;
}

export const ClientEditModal: React.FC<ClientEditModalProps> = ({
  company,
  open,
  onOpenChange,
  onCompanyUpdated,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    contact_person: '',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    website: '',
    notes: '',
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        contact_person: '',
        cnpj: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        website: '',
        notes: '',
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !user) return;

    // Verificar se a empresa pertence ao usuário atual
    if (company.user_id !== user.id) {
      toast({
        title: "Erro de Segurança",
        description: "Você não tem permissão para modificar esta empresa.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verificar se o telefone já existe para outro usuário (se telefone foi fornecido e alterado)
      if (formData.phone && formData.phone.trim() !== '' && formData.phone !== company.phone) {
        const { data: existingCompany, error: checkError } = await supabase
          .from('companies')
          .select('id, user_id')
          .eq('phone', formData.phone)
          .neq('id', company.id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Error checking phone uniqueness:', checkError);
          throw new Error('Erro ao verificar telefone');
        }

        if (existingCompany) {
          toast({
            title: "Telefone já cadastrado",
            description: "Este telefone já está sendo usado por outro usuário.",
            variant: "destructive",
          });
          return;
        }
      }

      const { error } = await supabase
        .from('companies')
        .update({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id)
        .eq('user_id', user.id); // Garantir que só atualiza empresa do próprio usuário

      if (error) {
        if (error.message.includes('unique_phone_per_user')) {
          throw new Error('Este telefone já está cadastrado');
        }
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso!",
      });

      onCompanyUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar cliente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Editar Cliente: {company?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome da empresa"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_person">Pessoa de Contato</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>

            {/* Contato */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contato
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.empresa.com"
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço
              </h3>
              
              <div>
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="UF"
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Observações
              </h3>
              
              <div>
                <Label htmlFor="notes">Notas sobre o cliente</Label>
                <textarea
                  id="notes"
                  className="w-full p-3 border border-input rounded-md resize-none"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações adicionais, preferências, histórico..."
                />
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t mt-4 shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
