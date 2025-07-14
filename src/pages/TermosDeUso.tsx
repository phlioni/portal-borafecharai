import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

const TermosDeUso = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/login">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Login
            </Link>
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Termos de Uso</h1>
              <p className="text-gray-600">Bora Fechar Aí</p>
            </div>
          </div>
        </div>

        {/* Conteúdo dos Termos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">
              Termos de Uso da Plataforma Bora Fechar Aí
            </CardTitle>
            <p className="text-sm text-gray-600">Última atualização: 14 de julho de 2025</p>
          </CardHeader>
          
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <div>
                <p className="text-lg font-medium text-blue-600 mb-4">
                  Bem-vindo(a) ao Bora Fechar Aí!
                </p>
                
                <p className="text-gray-700 leading-relaxed">
                  Estes Termos de Uso ("Termos") regem o seu acesso e uso da plataforma online de criação e gestão de propostas comerciais, incluindo o site https://borafecharai.com/, suas funcionalidades, APIs e todos os serviços associados (coletivamente, a "Plataforma"), oferecidos por [NOME DA SUA EMPRESA AQUI], pessoa jurídica de direito privado, inscrita no CNPJ sob o nº [SEU CNPJ AQUI], com sede em [SEU ENDEREÇO AQUI].
                </p>
                
                <p className="text-gray-700 leading-relaxed mt-4">
                  Ao se cadastrar, acessar ou utilizar a Plataforma, você declara que leu, entendeu e concorda em cumprir integralmente com as condições estabelecidas nestes Termos e em nossa Política de Privacidade. Caso não concorde com qualquer parte destes Termos, você não deverá utilizar a Plataforma.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Definições</h2>
                <div className="space-y-3">
                  <p><strong>Plataforma:</strong> Refere-se ao software como serviço (SaaS) Bora Fechar Aí, acessível pelo site https://borafecharai.com/, que permite a criação, envio e gestão de propostas comerciais.</p>
                  
                  <p><strong>Usuário:</strong> Qualquer pessoa física ou jurídica que se cadastra e utiliza a Plataforma, seja em um plano gratuito ou pago.</p>
                  
                  <p><strong>Conteúdo do Usuário:</strong> Todas as informações, dados, textos, imagens e documentos que o Usuário insere, cria, envia ou armazena na Plataforma, incluindo dados de clientes, textos de propostas e assinaturas.</p>
                  
                  <p><strong>Plano:</strong> O pacote de serviços e funcionalidades escolhido pelo Usuário, que pode ser gratuito ou pago (assinatura).</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Objeto do Serviço</h2>
                <p className="mb-3">A Plataforma é uma ferramenta online que visa otimizar o processo de vendas através de funcionalidades como:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Criação de propostas comerciais, com o auxílio de inteligência artificial para geração de textos.</li>
                  <li>Utilização de modelos (templates) de propostas.</li>
                  <li>Gestão de clientes e contatos.</li>
                  <li>Envio e acompanhamento do status das propostas (enviada, visualizada, assinada).</li>
                  <li>Coleta de assinatura eletrônica dos destinatários das propostas.</li>
                  <li>Analytics sobre o desempenho das propostas.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cadastro e Conta do Usuário</h2>
                <div className="space-y-2">
                  <p><strong>3.1.</strong> Para utilizar a Plataforma, o Usuário deve ter no mínimo 18 anos de idade e capacidade legal para contratar.</p>
                  <p><strong>3.2.</strong> O Usuário concorda em fornecer informações verdadeiras, completas e atualizadas no momento do cadastro e em mantê-las sempre atualizadas.</p>
                  <p><strong>3.3.</strong> O Usuário é o único responsável pela segurança de sua senha e por todas as atividades que ocorrerem em sua conta. O Bora Fechar Aí não será responsável por perdas ou danos decorrentes do acesso não autorizado à conta do Usuário.</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Planos, Pagamentos e Assinaturas</h2>
                <div className="space-y-2">
                  <p><strong>4.1. Modalidades:</strong> A Plataforma oferece diferentes Planos, com funcionalidades e limites distintos. As características de cada Plano estão detalhadas na página de preços do nosso site.</p>
                  <p><strong>4.2. Pagamentos:</strong> Para os Planos pagos, o Usuário concorda em pagar os valores estipulados de forma recorrente (mensal ou anual), conforme o ciclo de faturamento escolhido. Os pagamentos serão processados por um gateway de pagamento terceirizado e seguro.</p>
                  <p><strong>4.3. Renovação Automática:</strong> As assinaturas dos Planos pagos serão renovadas automaticamente ao final de cada ciclo, a menos que o Usuário cancele sua assinatura antes da data de renovação.</p>
                  <p><strong>4.4. Cancelamento:</strong> O Usuário pode cancelar sua assinatura a qualquer momento através das configurações de sua conta. O cancelamento interromperá as cobranças futuras, e o acesso às funcionalidades do Plano pago permanecerá ativo até o final do período já pago.</p>
                  <p><strong>4.5. Não Reembolso:</strong> Salvo disposição legal em contrário, os valores já pagos não são reembolsáveis, totais ou parcialmente, mesmo que o Usuário não utilize a Plataforma durante o período de vigência da assinatura.</p>
                  <p><strong>4.6. Alteração de Preços:</strong> O Bora Fechar Aí se reserva o direito de alterar os preços dos Planos. Qualquer alteração será comunicada aos Usuários assinantes com antecedência mínima de 30 (trinta) dias.</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Propriedade Intelectual</h2>
                <div className="space-y-2">
                  <p><strong>5.1. Conteúdo do Usuário:</strong> Você retém todos os direitos e a propriedade sobre o Conteúdo do Usuário. Ao utilizar a Plataforma, você nos concede uma licença mundial, não exclusiva e isenta de royalties para hospedar, armazenar, processar e exibir seu conteúdo, unicamente com o propósito de operar e fornecer os serviços da Plataforma para você.</p>
                  <p><strong>5.2. Propriedade da Plataforma:</strong> Todo o software, design, interface, textos, gráficos, logotipos, modelos pré-definidos e a marca "Bora Fechar Aí" são de propriedade exclusiva do Bora Fechar Aí. O Usuário recebe uma licença de uso limitada, não exclusiva e intransferível para acessar e usar a Plataforma enquanto estes Termos estiverem em vigor.</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Uso da Inteligência Artificial</h2>
                <div className="space-y-2">
                  <p><strong>6.1.</strong> A Plataforma utiliza modelos de inteligência artificial para auxiliar na criação de textos para as propostas.</p>
                  <p><strong>6.2.</strong> O Usuário entende que o conteúdo gerado pela IA é uma sugestão e um ponto de partida. O Usuário é o único responsável por revisar, editar e validar a precisão, legalidade e adequação de todo o conteúdo final de suas propostas antes do envio.</p>
                  <p><strong>6.3.</strong> O Bora Fechar Aí não se responsabiliza por quaisquer imprecisões, erros ou consequências decorrentes do uso do conteúdo gerado por IA.</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Responsabilidades do Usuário</h2>
                <p className="mb-3">O Usuário concorda em não utilizar a Plataforma para:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Enviar spam ou comunicações não solicitadas.</li>
                  <li>Inserir conteúdo ilegal, fraudulento, difamatório, obsceno ou que viole direitos de terceiros (incluindo direitos autorais e de privacidade).</li>
                  <li>Realizar engenharia reversa, descompilar ou tentar extrair o código-fonte da Plataforma.</li>
                  <li>Transmitir vírus ou qualquer código de natureza destrutiva.</li>
                  <li>Criar propostas com ofertas enganosas ou que violem a legislação brasileira.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Privacidade e Proteção de Dados</h2>
                <p>O tratamento dos dados pessoais coletados do Usuário e de seus clientes é regido pela nossa Política de Privacidade, que é parte integrante destes Termos. A Plataforma opera em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitação de Responsabilidade</h2>
                <div className="space-y-2">
                  <p><strong>9.1.</strong> A Plataforma é fornecida "no estado em que se encontra" ("as is"). Não garantimos que o serviço será ininterrupto, livre de erros ou totalmente seguro.</p>
                  <p><strong>9.2.</strong> Em nenhuma circunstância o Bora Fechar Aí ou seus diretores serão responsáveis por quaisquer danos indiretos, lucros cessantes, perda de dados ou interrupção de negócios decorrentes do uso ou da incapacidade de usar a Plataforma.</p>
                  <p><strong>9.3.</strong> Nossa responsabilidade total por quaisquer reclamações relacionadas a estes Termos ou à Plataforma limita-se ao valor total pago pelo Usuário nos 3 (três) meses anteriores ao evento que deu origem à reclamação.</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Suspensão e Encerramento da Conta</h2>
                <p>Reservamo-nos o direito de suspender ou encerrar a conta de qualquer Usuário, sem aviso prévio, caso haja violação destes Termos, falta de pagamento ou suspeita de atividade fraudulenta ou ilegal.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Alterações nos Termos de Uso</h2>
                <p>Podemos modificar estes Termos a qualquer momento. Quando o fizermos, publicaremos a versão atualizada na Plataforma e notificaremos os Usuários por e-mail ou através de um aviso no sistema. O uso contínuo da Plataforma após a notificação constituirá aceitação dos novos Termos.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Disposições Gerais</h2>
                <div className="space-y-2">
                  <p><strong>12.1. Legislação e Foro:</strong> Estes Termos serão regidos e interpretados de acordo com as leis da República Federativa do Brasil. Fica eleito o foro da Comarca de Santos, Estado de São Paulo, para dirimir quaisquer controvérsias oriundas deste documento, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
                  <p><strong>12.2. Contato:</strong> Em caso de dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail: contato@borafecharai.com.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Button asChild>
            <Link to="/login">
              Voltar para Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermosDeUso;