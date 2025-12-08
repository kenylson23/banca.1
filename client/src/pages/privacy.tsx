import { Button } from "@/components/ui/button";
import { ArrowLeft, Utensils } from "lucide-react";
import { useLocation } from "wouter";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-3" data-testid="logo-privacy">
              <div className="w-10 h-10 rounded-lg bg-[#0054FF] flex items-center justify-center">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1D1F22]">Na Bancada</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
              className="text-[#1D1F22]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#1D1F22] mb-8" data-testid="text-privacy-title">
          Política de Privacidade
        </h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6" data-testid="text-privacy-updated">
            Última atualização: {new Date().toLocaleDateString('pt-AO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">1. Introdução</h2>
            <p className="text-gray-600 mb-4">
              O Na Bancada ("nós", "nosso" ou "Empresa") está comprometido em proteger a privacidade dos nossos 
              utilizadores. Esta Política de Privacidade explica como recolhemos, utilizamos, divulgamos e 
              protegemos as suas informações quando utiliza a nossa plataforma de gestão de restaurantes.
            </p>
            <p className="text-gray-600">
              Ao utilizar o nosso Serviço, concorda com a recolha e uso de informações de acordo com esta política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">2. Informações que Recolhemos</h2>
            
            <h3 className="text-lg font-medium text-[#1D1F22] mb-3">2.1 Informações Fornecidas Directamente</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li><strong>Dados de Registo:</strong> Nome, email, telefone, nome do restaurante, NIF</li>
              <li><strong>Dados do Negócio:</strong> Endereço, horários de funcionamento, informações de filiais</li>
              <li><strong>Dados do Cardápio:</strong> Itens do menu, preços, descrições, imagens</li>
              <li><strong>Dados de Funcionários:</strong> Nomes e funções dos utilizadores do sistema</li>
              <li><strong>Dados Financeiros:</strong> Informações de pagamento, histórico de transacções</li>
            </ul>

            <h3 className="text-lg font-medium text-[#1D1F22] mb-3">2.2 Informações Recolhidas Automaticamente</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li><strong>Dados de Uso:</strong> Páginas visitadas, funcionalidades utilizadas, tempo de sessão</li>
              <li><strong>Dados do Dispositivo:</strong> Tipo de dispositivo, sistema operativo, navegador</li>
              <li><strong>Dados de Localização:</strong> Endereço IP, localização aproximada</li>
              <li><strong>Cookies:</strong> Identificadores de sessão e preferências</li>
            </ul>

            <h3 className="text-lg font-medium text-[#1D1F22] mb-3">2.3 Dados de Clientes Finais</h3>
            <p className="text-gray-600">
              Quando os clientes do seu restaurante utilizam o sistema de pedidos por QR Code, podemos recolher 
              informações limitadas como número da mesa e detalhes do pedido. Não recolhemos dados pessoais 
              dos clientes finais sem o seu consentimento explícito.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">3. Como Utilizamos as Informações</h2>
            <p className="text-gray-600 mb-4">Utilizamos as informações recolhidas para:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Fornecer, manter e melhorar o nosso Serviço</li>
              <li>Processar transacções e enviar confirmações</li>
              <li>Enviar comunicações técnicas, actualizações e alertas de segurança</li>
              <li>Responder a comentários, perguntas e pedidos de suporte</li>
              <li>Monitorizar e analisar tendências de uso</li>
              <li>Detectar, investigar e prevenir actividades fraudulentas</li>
              <li>Personalizar a experiência do utilizador</li>
              <li>Gerar relatórios e análises para o seu negócio</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">4. Partilha de Informações</h2>
            <p className="text-gray-600 mb-4">Podemos partilhar as suas informações nas seguintes circunstâncias:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Prestadores de Serviços:</strong> Com terceiros que nos ajudam a operar o Serviço 
                (processadores de pagamento, serviços de alojamento, suporte ao cliente)</li>
              <li><strong>Requisitos Legais:</strong> Quando exigido por lei ou para proteger os nossos direitos</li>
              <li><strong>Transferências de Negócio:</strong> Em caso de fusão, aquisição ou venda de activos</li>
              <li><strong>Com o Seu Consentimento:</strong> Em outras situações com a sua autorização explícita</li>
            </ul>
            <p className="text-gray-600 mt-4">
              <strong>Não vendemos as suas informações pessoais a terceiros.</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">5. Segurança dos Dados</h2>
            <p className="text-gray-600 mb-4">
              Implementamos medidas de segurança técnicas e organizacionais para proteger as suas informações:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Encriptação de dados em trânsito (HTTPS/TLS)</li>
              <li>Encriptação de dados em repouso</li>
              <li>Controlo de acesso baseado em funções</li>
              <li>Backups automáticos diários</li>
              <li>Monitorização contínua de segurança</li>
              <li>Auditorias de segurança regulares</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Apesar dos nossos esforços, nenhum método de transmissão ou armazenamento electrónico é 100% seguro. 
              Não podemos garantir segurança absoluta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">6. Retenção de Dados</h2>
            <p className="text-gray-600 mb-4">
              Retemos as suas informações pelo tempo necessário para:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Fornecer o Serviço enquanto a sua conta estiver activa</li>
              <li>Cumprir obrigações legais (registos fiscais: 7 anos)</li>
              <li>Resolver disputas e fazer cumprir acordos</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Após o encerramento da conta, os dados são eliminados dentro de 90 dias, excepto onde a retenção 
              é exigida por lei.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">7. Os Seus Direitos</h2>
            <p className="text-gray-600 mb-4">Tem direito a:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Acesso:</strong> Solicitar uma cópia das suas informações pessoais</li>
              <li><strong>Rectificação:</strong> Corrigir informações imprecisas ou incompletas</li>
              <li><strong>Eliminação:</strong> Solicitar a eliminação das suas informações</li>
              <li><strong>Portabilidade:</strong> Receber os seus dados num formato estruturado</li>
              <li><strong>Oposição:</strong> Opor-se ao processamento dos seus dados</li>
              <li><strong>Restrição:</strong> Solicitar a limitação do processamento</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Para exercer estes direitos, contacte-nos através de privacy@nabancada.ao.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">8. Cookies e Tecnologias Semelhantes</h2>
            <p className="text-gray-600 mb-4">Utilizamos cookies para:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Cookies Essenciais:</strong> Necessários para o funcionamento do Serviço</li>
              <li><strong>Cookies de Preferências:</strong> Lembrar as suas configurações</li>
              <li><strong>Cookies Analíticos:</strong> Compreender como utiliza o Serviço</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Pode gerir as preferências de cookies através das configurações do seu navegador.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">9. Transferências Internacionais</h2>
            <p className="text-gray-600">
              Os seus dados podem ser transferidos e armazenados em servidores localizados fora de Angola. 
              Garantimos que estas transferências são realizadas com salvaguardas adequadas para proteger 
              as suas informações.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">10. Menores de Idade</h2>
            <p className="text-gray-600">
              O nosso Serviço não se destina a menores de 18 anos. Não recolhemos intencionalmente informações 
              de menores. Se tomarmos conhecimento de que recolhemos dados de um menor, tomaremos medidas para 
              eliminar essas informações.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">11. Alterações a Esta Política</h2>
            <p className="text-gray-600">
              Podemos actualizar esta Política de Privacidade periodicamente. Notificaremos sobre alterações 
              significativas por email ou através de um aviso no Serviço. Recomendamos que reveja esta política 
              regularmente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">12. Contacto</h2>
            <p className="text-gray-600 mb-4">
              Para questões sobre esta Política de Privacidade ou sobre as suas informações pessoais, contacte-nos:
            </p>
            <ul className="list-none text-gray-600 space-y-2">
              <li><strong>Responsável pela Protecção de Dados:</strong> privacy@nabancada.ao</li>
              <li><strong>Email Geral:</strong> info@nabancada.ao</li>
              <li><strong>Telefone:</strong> +244 923 456 789</li>
              <li><strong>Endereço:</strong> Luanda, Angola</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1D1F22] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Na Bancada. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
