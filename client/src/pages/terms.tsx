import { Button } from "@/components/ui/button";
import { ArrowLeft, Utensils } from "lucide-react";
import { useLocation } from "wouter";

export default function Terms() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-3" data-testid="logo-terms">
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
        <h1 className="text-3xl lg:text-4xl font-bold text-[#1D1F22] mb-8" data-testid="text-terms-title">
          Termos de Uso
        </h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6" data-testid="text-terms-updated">
            Última atualização: {new Date().toLocaleDateString('pt-AO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">1. Aceitação dos Termos</h2>
            <p className="text-gray-600 mb-4">
              Ao aceder e utilizar a plataforma Na Bancada ("Serviço"), o utilizador ("Você", "Cliente" ou "Utilizador") 
              concorda em cumprir e estar vinculado a estes Termos de Uso. Se não concordar com qualquer parte destes 
              termos, não deverá utilizar o nosso Serviço.
            </p>
            <p className="text-gray-600">
              Estes termos aplicam-se a todos os visitantes, utilizadores e outros que acedem ou utilizam o Serviço, 
              incluindo proprietários de restaurantes, funcionários e clientes finais.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">2. Descrição do Serviço</h2>
            <p className="text-gray-600 mb-4">
              O Na Bancada é uma plataforma de gestão de restaurantes que oferece:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li>Sistema de pedidos por QR Code</li>
              <li>Gestão de mesas e reservas</li>
              <li>Painel de controlo para cozinha</li>
              <li>Relatórios e análises de vendas</li>
              <li>Gestão de cardápio digital</li>
              <li>Sistema de pagamentos integrado</li>
              <li>Gestão multi-filiais</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">3. Registo e Conta</h2>
            <p className="text-gray-600 mb-4">
              Para utilizar certas funcionalidades do Serviço, deve criar uma conta. Ao criar uma conta, concorda em:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Fornecer informações precisas, actuais e completas</li>
              <li>Manter a segurança da sua palavra-passe</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
              <li>Ser responsável por todas as actividades que ocorram na sua conta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">4. Planos e Pagamentos</h2>
            <p className="text-gray-600 mb-4">
              O Na Bancada oferece diferentes planos de subscrição. Ao subscrever um plano:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li>Concorda em pagar as taxas aplicáveis ao plano escolhido</li>
              <li>Autoriza a cobrança automática no início de cada ciclo de facturação</li>
              <li>Pode cancelar a subscrição a qualquer momento, sendo o cancelamento efectivo no final do período actual</li>
              <li>Não terá direito a reembolso por períodos parciais não utilizados</li>
            </ul>
            <p className="text-gray-600">
              Os preços podem ser alterados mediante aviso prévio de 30 dias. As alterações de preço não afectam 
              o ciclo de facturação em curso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">5. Uso Aceitável</h2>
            <p className="text-gray-600 mb-4">
              Ao utilizar o Serviço, concorda em não:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Violar quaisquer leis ou regulamentos aplicáveis</li>
              <li>Infringir direitos de propriedade intelectual</li>
              <li>Transmitir vírus ou código malicioso</li>
              <li>Tentar aceder a áreas não autorizadas do sistema</li>
              <li>Interferir com o funcionamento normal do Serviço</li>
              <li>Utilizar o Serviço para fins fraudulentos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">6. Propriedade Intelectual</h2>
            <p className="text-gray-600 mb-4">
              O Serviço e o seu conteúdo original, funcionalidades e design são propriedade exclusiva do Na Bancada 
              e estão protegidos por direitos de autor, marcas registadas e outras leis de propriedade intelectual.
            </p>
            <p className="text-gray-600">
              Os dados e conteúdos que introduz no sistema (menus, preços, informações de clientes) permanecem 
              sua propriedade. Concede-nos uma licença limitada para processar estes dados conforme necessário 
              para fornecer o Serviço.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">7. Limitação de Responsabilidade</h2>
            <p className="text-gray-600 mb-4">
              O Serviço é fornecido "tal como está" e "conforme disponível". Não garantimos que:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
              <li>O Serviço funcionará ininterruptamente ou sem erros</li>
              <li>Os defeitos serão corrigidos</li>
              <li>O Serviço estará livre de vírus ou componentes prejudiciais</li>
            </ul>
            <p className="text-gray-600">
              Em nenhuma circunstância seremos responsáveis por danos indirectos, incidentais, especiais ou 
              consequenciais resultantes do uso ou incapacidade de usar o Serviço.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">8. Rescisão</h2>
            <p className="text-gray-600 mb-4">
              Podemos suspender ou encerrar a sua conta imediatamente, sem aviso prévio, por qualquer razão, 
              incluindo violação destes Termos. Após a rescisão:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>O seu direito de usar o Serviço cessará imediatamente</li>
              <li>Poderá solicitar a exportação dos seus dados dentro de 30 dias</li>
              <li>Após 30 dias, os seus dados serão eliminados permanentemente</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">9. Alterações aos Termos</h2>
            <p className="text-gray-600">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos sobre alterações 
              significativas por email ou através do Serviço. O uso continuado do Serviço após as alterações 
              constitui aceitação dos novos termos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">10. Lei Aplicável</h2>
            <p className="text-gray-600">
              Estes Termos são regidos pelas leis da República de Angola. Qualquer disputa será resolvida 
              nos tribunais competentes de Luanda, Angola.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1D1F22] mb-4">11. Contacto</h2>
            <p className="text-gray-600 mb-4">
              Para questões sobre estes Termos de Uso, contacte-nos:
            </p>
            <ul className="list-none text-gray-600 space-y-2">
              <li><strong>Email:</strong> legal@nabancada.ao</li>
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
