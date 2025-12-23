import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Zap, ArrowRight, LayoutDashboard, Menu, X } from "lucide-react";

export default function Landing() {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "NA BANCADA | Sistema de Gestão para Restaurantes";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Controle total de restaurante com PDV, QR Code, delivery e análises inteligentes.");
    }
  }, []);

  const handleBeamAnimation = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white overflow-x-hidden pb-10">
      <style>{`
        body { font-family: 'Inter', sans-serif; }
        .glass-nav {
          background: rgba(10, 20, 30, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .spotlight-card {
          --mouse-x: 0px;
          --mouse-y: 0px;
          position: relative;
          background: rgba(255, 255, 255, 0.02);
        }
        .spotlight-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: inherit;
          background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.15), transparent 40%);
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: 0;
          pointer-events: none;
        }
        .spotlight-card:hover::before { opacity: 1; }
        .spotlight-inner {
          position: relative;
          background: #0b0d11;
          border-radius: inherit;
          z-index: 1;
          height: 100%;
          width: 100%;
        }
        .spotlight-inner::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: inherit;
          background: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.06), transparent 40%);
          opacity: 0;
          transition: opacity 0.5s ease;
          z-index: 2;
          pointer-events: none;
        }
        .spotlight-card:hover .spotlight-inner::after { opacity: 1; }
        @keyframes beam-spin { to { transform: rotate(360deg); } }
        @keyframes dots-move { 
          0% { background-position: 0 0; } 
          100% { background-position: 24px 24px; } 
        }
        .beam-button {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-transform: uppercase;
          transition: all 0.5s;
          font-size: 0.875rem;
          font-weight: bold;
          color: white;
          letter-spacing: 0.1em;
          border-radius: 9999px;
          padding: 1rem 2.5rem;
        }
        .beam-button:hover {
          transform: scale(1.02);
          box-shadow: 0 0 40px -10px rgba(59, 130, 246, 0.5);
        }
        .beam-button::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          border-radius: 9999px;
          overflow: hidden;
          padding: 1px;
        }
        .beam-button::after {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: 9999px;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05), transparent);
          z-index: -1;
        }
        .beam-inner {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 66.666%;
          height: 50%;
          background: rgba(59, 130, 246, 0.1);
          filter: blur(32px);
          border-radius: 50%;
          pointer-events: none;
        }
      `}</style>

      {/* Background texture */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")', mixBlendMode: 'overlay'}}></div>

      {/* Fixed Pill Navigation */}
      <div className="fixed top-6 left-0 right-0 flex justify-center z-50 px-4 pointer-events-none">
        <nav className="glass-nav flex w-full max-w-5xl pointer-events-auto rounded-full pt-3 pr-3 pb-3 pl-6 shadow-2xl items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
              <LayoutDashboard size={18} />
            </div>
            <span className="text-xl font-semibold tracking-tight text-gray-100 uppercase">NA BANCADA</span>
          </div>

          {/* Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-8 text-sm text-gray-400 font-medium">
            <a href="#features" className="text-white hover:text-blue-400 transition-colors">Funcionalidades</a>
            <a href="#workflow" className="hover:text-white transition-colors">Como Funciona</a>
            <a href="#pricing" className="hover:text-white transition-colors">Planos</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a href="#" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 transition-colors text-gray-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Sistema Online
            </a>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 rounded-full border border-white/20 bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              data-testid="button-start-now"
            >
              Começar Agora
            </button>
            <button
              className="lg:hidden text-white flex items-center ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed top-24 left-0 right-0 z-40 glass-nav mx-4 rounded-2xl p-4 space-y-4 max-w-5xl mx-auto">
          <a href="#features" className="block text-gray-300 hover:text-white transition">Funcionalidades</a>
          <a href="#workflow" className="block text-gray-300 hover:text-white transition">Como Funciona</a>
          <a href="#pricing" className="block text-gray-300 hover:text-white transition">Planos</a>
          <a href="#faq" className="block text-gray-300 hover:text-white transition">FAQ</a>
        </div>
      )}

      {/* MAIN HERO */}
      <div
        className="spotlight-card group mx-4 sm:mx-6 lg:mt-32 max-w-7xl z-10 rounded-[40px] mt-32 pt-[1px] pr-[1px] pb-[1px] pl-[1px] relative mx-auto"
        onMouseMove={handleBeamAnimation}
      >
        <div className="spotlight-inner overflow-hidden flex flex-col min-h-[800px] z-10 rounded-[40px] justify-center bg-[#080a0f]">
          {/* Version */}
          <div className="absolute top-8 right-8 z-20 pointer-events-none">
            <span className="font-mono text-sm font-bold text-white/10 tracking-widest">V. 2.4.0</span>
          </div>

          {/* Grid Background */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '60px 60px'}}></div>

          {/* Content */}
          <main className="z-10 container max-w-7xl lg:px-12 grid lg:grid-cols-2 gap-16 mx-auto pt-20 pr-6 pb-20 pl-6 items-center">
            {/* Left Column */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
                <Zap size={14} />
                Automação Inteligente
              </div>

              <h1 className="text-5xl lg:text-7xl leading-[1.05] mb-8 tracking-tighter text-white">
                Gestão Completa para <span className="text-blue-500">Restaurantes</span>
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-lg font-light">
                Controle total, desde o pedido na mesa até o fechamento do caixa. O sistema PDV, QR Code e delivery que moderniza o seu negócio e aumenta o lucro.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Main Button */}
                <button
                  onClick={() => navigate("/login")}
                  className="beam-button group"
                  data-testid="button-consul"
                >
                  <div className="beam-inner"></div>
                  <span className="relative z-10 text-white/90 group-hover:text-white">Falar com Consultor</span>
                  <ArrowRight size={16} className="relative z-10 ml-2 transition-transform group-hover:translate-x-1" />
                </button>

                {/* Secondary Button */}
                <button
                  onClick={() => navigate("/login")}
                  className="hover:bg-white/5 transition-all flex text-base font-medium text-gray-300 bg-white/5 rounded-full py-4 px-8 items-center justify-center relative overflow-hidden"
                  style={{boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 20px rgba(0, 0, 0, 0.5)'}}
                  data-testid="button-demo"
                >
                  <span className="text-base font-medium text-gray-200 tracking-tight relative z-10">
                    Ver Demonstração
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-2 opacity-70 relative z-10">
                    <polygon points="6 3 20 12 6 21 6 3"></polygon>
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Column - Device Mockups */}
            <div className="relative w-full h-[500px] lg:h-[650px] flex items-center justify-center">
              {/* Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>

              {/* Mockups Container */}
              <div className="relative w-full max-w-[800px] h-full flex items-center justify-center scale-75 sm:scale-100 lg:scale-85 xl:scale-100">
                {/* Dashboard */}
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[320px] bg-[#0e1015] rounded-xl border border-white/10 shadow-2xl z-10 flex flex-col overflow-hidden transform hover:-translate-y-2 transition-transform">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur border border-blue-400/30 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap z-50">
                    Delivery
                  </div>
                  <div className="h-8 bg-[#1a1d24] border-b border-white/5 flex items-center px-3 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="flex-1 p-3 grid grid-cols-3 gap-2 bg-[#0B0D11]">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-[#16191f]/50 rounded border border-white/5 p-2">
                        <div className="h-2 w-12 bg-white/10 rounded mb-2"></div>
                        <div className="h-16 bg-[#1f232b] rounded border border-white/5"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tablet */}
                <div className="absolute bottom-[10%] left-0 z-20 w-[400px]">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur border border-blue-400/30 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                    Cardápio em Tablet
                  </div>
                  <div className="relative w-full h-[260px] bg-[#111318] rounded-2xl border-[6px] border-[#1f232b] shadow-2xl overflow-hidden flex flex-col">
                    <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#16191f]">
                      <div className="w-20 h-2 bg-white/10 rounded-full"></div>
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">3</div>
                    </div>
                    <div className="flex-1 flex">
                      <div className="w-16 border-r border-white/5 py-4 flex flex-col items-center gap-4 bg-[#13151a]">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20"></div>
                        <div className="w-8 h-8 rounded-lg bg-white/5"></div>
                      </div>
                      <div className="flex-1 p-3 grid grid-cols-2 gap-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="bg-[#1f232b] rounded-lg p-2 border border-white/5">
                            <div className="w-full h-16 bg-white/5 rounded-md"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="absolute bottom-[10%] right-0 z-30 w-[250px]">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur border border-blue-400/30 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                    QR Code
                  </div>
                  <div className="relative w-full aspect-[9/19] bg-[#0e1015] rounded-[30px] border-[8px] border-[#1a1d24] shadow-2xl overflow-hidden flex flex-col">
                    <div className="h-8 bg-[#1a1d24] border-b border-white/5 flex items-center justify-center gap-2 px-4">
                      <div className="w-6 h-6 bg-white/10 rounded-full"></div>
                      <div className="flex-1 h-2 bg-white/10 rounded"></div>
                    </div>
                    <div className="flex-1 p-4 flex items-center justify-center">
                      <div className="w-32 h-32 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded flex items-center justify-center text-white text-2xl font-bold">QR</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-20 mt-20">
        <h2 className="text-4xl font-bold text-center mb-12">Funcionalidades Poderosas</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "PDV Integrado", desc: "Terminal de vendas completo" },
            { title: "QR Code", desc: "Pedidos diretos da mesa" },
            { title: "Delivery", desc: "Gestão de entregas" },
            { title: "Análises", desc: "Relatórios em tempo real" },
            { title: "Multi-Filial", desc: "Controle centralizado" },
            { title: "Suporte 24/7", desc: "Sempre disponível" }
          ].map((feature, i) => (
            <div key={i} className="p-6 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition">
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">Pronto para começar?</h2>
        <button
          onClick={() => navigate("/login")}
          className="px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]"
          data-testid="button-final-cta"
        >
          Falar com Consultor Agora
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2025 NA BANCADA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
