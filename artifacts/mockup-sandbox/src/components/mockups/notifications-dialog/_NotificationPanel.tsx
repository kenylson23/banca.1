import {
  Bell,
  Check,
  CheckCheck,
  Package,
  Settings,
  Trash2,
} from 'lucide-react';

const notifications = [
  ['3A7CD70B', 'há 7 dias'],
  ['A7122497', 'há 7 dias'],
  ['74C1F306', 'há 7 dias'],
  ['B951DE20', 'há 8 dias'],
];

export function NotificationPanel({ refined = false }: { refined?: boolean }) {
  return (
    <div className="min-h-screen bg-[#0b1220] p-5 text-[#f5f7fb]">
      <div className="mx-auto max-w-[420px] overflow-hidden rounded-2xl bg-[#182438] shadow-2xl shadow-black/30">
        <div
          className={`overflow-hidden rounded-2xl border border-white/10 bg-[#182438] ${
            refined ? '' : 'outline outline-[3px] outline-[#d0aa32] shadow-[0_0_12px_rgba(208,170,50,.28)]'
          }`}
        >
          <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Bell size={18} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold tracking-tight">Notificações</h2>
                <p className="mt-0.5 text-xs text-slate-400">8 por ler</p>
              </div>
            </div>
            <button className="flex h-9 shrink-0 items-center gap-2 rounded-lg px-2.5 text-xs text-slate-200 hover:bg-white/5">
              <CheckCheck size={15} aria-hidden="true" />
              Ler tudo
            </button>
          </header>

          <div className="max-h-[390px] space-y-2 overflow-y-auto p-2.5">
            {notifications.map(([code, time]) => (
              <article
                key={code}
                className="flex items-start gap-3 rounded-xl border border-blue-400/15 bg-blue-400/[0.045] p-3.5 transition-colors hover:bg-blue-400/[0.08]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                  <Package size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="line-clamp-2 text-sm font-medium">Novo pedido recebido</h3>
                    <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                    Pedido {code} aguarda confirmação.
                  </p>
                  <p className="mt-1.5 text-[11px] text-slate-500">{time}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-slate-300">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10" aria-label="Marcar como lida">
                    <Check size={15} aria-hidden="true" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-red-300" aria-label="Apagar">
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <footer className="border-t border-white/10 p-2.5">
            <button className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-slate-200 hover:bg-white/5">
              <Settings size={16} aria-hidden="true" />
              Configurações de notificação
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
