import{j as e}from"./ui-lib-C48LFfsC.js";import{r as l}from"./react-vendor-S6w1S69P.js";import{u as x}from"./react-router-CGHTlbGn.js";import{L as c,Z as m}from"./zap-CuN4tgSw.js";import{c as b,X as h}from"./index-Dvhn9OVW.js";import{A as p}from"./arrow-right-DU_qBopq.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=b("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);function y(){const[,s]=x(),[a,i]=l.useState(!1);l.useEffect(()=>{document.title="NA BANCADA | Sistema de Gestão para Restaurantes";const t=document.querySelector('meta[name="description"]');t&&t.setAttribute("content","Controle total de restaurante com PDV, QR Code, delivery e análises inteligentes.")},[]);const o=t=>{const r=t.currentTarget.getBoundingClientRect(),n=t.clientX-r.left,d=t.clientY-r.top;t.currentTarget.style.setProperty("--mouse-x",`${n}px`),t.currentTarget.style.setProperty("--mouse-y",`${d}px`)};return e.jsxs("div",{className:"min-h-screen bg-[#020408] text-white overflow-x-hidden pb-10",children:[e.jsx("style",{children:`
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
      `}),e.jsx("div",{className:"fixed inset-0 z-0 pointer-events-none opacity-20",style:{backgroundImage:'url("https://www.transparenttextures.com/patterns/cubes.png")',mixBlendMode:"overlay"}}),e.jsx("div",{className:"fixed top-6 left-0 right-0 flex justify-center z-50 px-4 pointer-events-none",children:e.jsxs("nav",{className:"glass-nav flex w-full max-w-5xl pointer-events-auto rounded-full pt-3 pr-3 pb-3 pl-6 shadow-2xl items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-2 cursor-pointer",onClick:()=>s("/"),children:[e.jsx("div",{className:"w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white",children:e.jsx(c,{size:18})}),e.jsx("span",{className:"text-xl font-semibold tracking-tight text-gray-100 uppercase",children:"NA BANCADA"})]}),e.jsxs("div",{className:"hidden lg:flex items-center gap-8 text-sm text-gray-400 font-medium",children:[e.jsx("a",{href:"#features",className:"text-white hover:text-blue-400 transition-colors",children:"Funcionalidades"}),e.jsx("a",{href:"#workflow",className:"hover:text-white transition-colors",children:"Como Funciona"}),e.jsx("a",{href:"#pricing",className:"hover:text-white transition-colors",children:"Planos"}),e.jsx("a",{href:"#faq",className:"hover:text-white transition-colors",children:"FAQ"})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("a",{href:"#",className:"hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 transition-colors text-gray-300",children:[e.jsxs("span",{className:"relative flex h-2 w-2",children:[e.jsx("span",{className:"animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"}),e.jsx("span",{className:"relative inline-flex rounded-full h-2 w-2 bg-blue-500"})]}),"Sistema Online"]}),e.jsx("button",{onClick:()=>s("/login"),className:"px-5 py-2 rounded-full border border-white/20 bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]","data-testid":"button-start-now",children:"Começar Agora"}),e.jsx("button",{className:"lg:hidden text-white flex items-center ml-2",onClick:()=>i(!a),children:a?e.jsx(h,{size:24}):e.jsx(u,{size:24})})]})]})}),a&&e.jsxs("div",{className:"fixed top-24 left-0 right-0 z-40 glass-nav mx-4 rounded-2xl p-4 space-y-4 max-w-5xl mx-auto",children:[e.jsx("a",{href:"#features",className:"block text-gray-300 hover:text-white transition",children:"Funcionalidades"}),e.jsx("a",{href:"#workflow",className:"block text-gray-300 hover:text-white transition",children:"Como Funciona"}),e.jsx("a",{href:"#pricing",className:"block text-gray-300 hover:text-white transition",children:"Planos"}),e.jsx("a",{href:"#faq",className:"block text-gray-300 hover:text-white transition",children:"FAQ"})]}),e.jsx("div",{className:"spotlight-card group mx-4 sm:mx-6 lg:mt-32 max-w-7xl z-10 rounded-[40px] mt-32 pt-[1px] pr-[1px] pb-[1px] pl-[1px] relative mx-auto",onMouseMove:o,children:e.jsxs("div",{className:"spotlight-inner overflow-hidden flex flex-col min-h-[800px] z-10 rounded-[40px] justify-center bg-[#080a0f]",children:[e.jsx("div",{className:"absolute top-8 right-8 z-20 pointer-events-none",children:e.jsx("span",{className:"font-mono text-sm font-bold text-white/10 tracking-widest",children:"V. 2.4.0"})}),e.jsx("div",{className:"absolute inset-0 z-0 pointer-events-none opacity-20",style:{backgroundImage:"linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",backgroundSize:"60px 60px"}}),e.jsxs("main",{className:"z-10 container max-w-7xl lg:px-12 grid lg:grid-cols-2 gap-16 mx-auto pt-20 pr-6 pb-20 pl-6 items-center",children:[e.jsxs("div",{className:"max-w-2xl",children:[e.jsxs("div",{className:"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6",children:[e.jsx(m,{size:14}),"Automação Inteligente"]}),e.jsxs("h1",{className:"text-5xl lg:text-7xl leading-[1.05] mb-8 tracking-tighter text-white",children:["Gestão Completa para ",e.jsx("span",{className:"text-blue-500",children:"Restaurantes"})]}),e.jsx("p",{className:"text-gray-400 text-lg leading-relaxed mb-10 max-w-lg font-light",children:"Controle total, desde o pedido na mesa até o fechamento do caixa. O sistema PDV, QR Code e delivery que moderniza o seu negócio e aumenta o lucro."}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-4",children:[e.jsxs("button",{onClick:()=>s("/login"),className:"beam-button group","data-testid":"button-consul",children:[e.jsx("div",{className:"beam-inner"}),e.jsx("span",{className:"relative z-10 text-white/90 group-hover:text-white",children:"Falar com Consultor"}),e.jsx(p,{size:16,className:"relative z-10 ml-2 transition-transform group-hover:translate-x-1"})]}),e.jsxs("button",{onClick:()=>s("/login"),className:"hover:bg-white/5 transition-all flex text-base font-medium text-gray-300 bg-white/5 rounded-full py-4 px-8 items-center justify-center relative overflow-hidden",style:{boxShadow:"0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 20px rgba(0, 0, 0, 0.5)"},"data-testid":"button-demo",children:[e.jsx("span",{className:"text-base font-medium text-gray-200 tracking-tight relative z-10",children:"Ver Demonstração"}),e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"currentColor",className:"w-4 h-4 ml-2 opacity-70 relative z-10",children:e.jsx("polygon",{points:"6 3 20 12 6 21 6 3"})})]})]})]}),e.jsxs("div",{className:"relative w-full h-[500px] lg:h-[650px] flex items-center justify-center",children:[e.jsx("div",{className:"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen"}),e.jsxs("div",{className:"relative w-full max-w-[800px] h-full flex items-center justify-center scale-75 sm:scale-100 lg:scale-85 xl:scale-100",children:[e.jsxs("div",{className:"absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[320px] bg-[#0e1015] rounded-xl border border-white/10 shadow-2xl z-10 flex flex-col overflow-hidden transform hover:-translate-y-2 transition-transform",children:[e.jsx("div",{className:"absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur border border-blue-400/30 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap z-50",children:"Delivery"}),e.jsx("div",{className:"h-8 bg-[#1a1d24] border-b border-white/5 flex items-center px-3 gap-2",children:e.jsxs("div",{className:"flex gap-1.5",children:[e.jsx("div",{className:"w-2 h-2 rounded-full bg-red-500"}),e.jsx("div",{className:"w-2 h-2 rounded-full bg-yellow-500"}),e.jsx("div",{className:"w-2 h-2 rounded-full bg-green-500"})]})}),e.jsx("div",{className:"flex-1 p-3 grid grid-cols-3 gap-2 bg-[#0B0D11]",children:[1,2,3].map(t=>e.jsxs("div",{className:"bg-[#16191f]/50 rounded border border-white/5 p-2",children:[e.jsx("div",{className:"h-2 w-12 bg-white/10 rounded mb-2"}),e.jsx("div",{className:"h-16 bg-[#1f232b] rounded border border-white/5"})]},t))})]}),e.jsxs("div",{className:"absolute bottom-[10%] left-0 z-20 w-[400px]",children:[e.jsx("div",{className:"absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur border border-blue-400/30 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap",children:"Cardápio em Tablet"}),e.jsxs("div",{className:"relative w-full h-[260px] bg-[#111318] rounded-2xl border-[6px] border-[#1f232b] shadow-2xl overflow-hidden flex flex-col",children:[e.jsxs("div",{className:"h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#16191f]",children:[e.jsx("div",{className:"w-20 h-2 bg-white/10 rounded-full"}),e.jsx("div",{className:"w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold",children:"3"})]}),e.jsxs("div",{className:"flex-1 flex",children:[e.jsxs("div",{className:"w-16 border-r border-white/5 py-4 flex flex-col items-center gap-4 bg-[#13151a]",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-orange-500/20"}),e.jsx("div",{className:"w-8 h-8 rounded-lg bg-white/5"})]}),e.jsx("div",{className:"flex-1 p-3 grid grid-cols-2 gap-3",children:[1,2,3].map(t=>e.jsx("div",{className:"bg-[#1f232b] rounded-lg p-2 border border-white/5",children:e.jsx("div",{className:"w-full h-16 bg-white/5 rounded-md"})},t))})]})]})]}),e.jsxs("div",{className:"absolute bottom-[10%] right-0 z-30 w-[250px]",children:[e.jsx("div",{className:"absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur border border-blue-400/30 text-white px-5 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap",children:"QR Code"}),e.jsxs("div",{className:"relative w-full aspect-[9/19] bg-[#0e1015] rounded-[30px] border-[8px] border-[#1a1d24] shadow-2xl overflow-hidden flex flex-col",children:[e.jsxs("div",{className:"h-8 bg-[#1a1d24] border-b border-white/5 flex items-center justify-center gap-2 px-4",children:[e.jsx("div",{className:"w-6 h-6 bg-white/10 rounded-full"}),e.jsx("div",{className:"flex-1 h-2 bg-white/10 rounded"})]}),e.jsx("div",{className:"flex-1 p-4 flex items-center justify-center",children:e.jsx("div",{className:"w-32 h-32 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center",children:e.jsx("div",{className:"w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded flex items-center justify-center text-white text-2xl font-bold",children:"QR"})})})]})]})]})]})]})]})}),e.jsxs("section",{id:"features",className:"max-w-7xl mx-auto px-4 py-20 mt-20",children:[e.jsx("h2",{className:"text-4xl font-bold text-center mb-12",children:"Funcionalidades Poderosas"}),e.jsx("div",{className:"grid md:grid-cols-2 lg:grid-cols-3 gap-6",children:[{title:"PDV Integrado",desc:"Terminal de vendas completo"},{title:"QR Code",desc:"Pedidos diretos da mesa"},{title:"Delivery",desc:"Gestão de entregas"},{title:"Análises",desc:"Relatórios em tempo real"},{title:"Multi-Filial",desc:"Controle centralizado"},{title:"Suporte 24/7",desc:"Sempre disponível"}].map((t,r)=>e.jsxs("div",{className:"p-6 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition",children:[e.jsx("h3",{className:"font-bold text-lg mb-2",children:t.title}),e.jsx("p",{className:"text-gray-400 text-sm",children:t.desc})]},r))})]}),e.jsxs("section",{className:"max-w-7xl mx-auto px-4 py-20 text-center",children:[e.jsx("h2",{className:"text-4xl font-bold mb-8",children:"Pronto para começar?"}),e.jsx("button",{onClick:()=>s("/login"),className:"px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]","data-testid":"button-final-cta",children:"Falar com Consultor Agora"})]}),e.jsx("footer",{className:"border-t border-white/10 py-12",children:e.jsx("div",{className:"max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm",children:e.jsx("p",{children:"© 2025 NA BANCADA. Todos os direitos reservados."})})})]})}export{y as default};
