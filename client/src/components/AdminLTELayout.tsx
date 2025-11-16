import { ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface AdminLTELayoutProps {
  children: ReactNode;
  pageTitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AdminLTELayout({ children, pageTitle = 'Dashboard', breadcrumbs }: AdminLTELayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Inicializar funcionalidade do AdminLTE após montagem
    if (typeof window !== 'undefined' && (window as any).AdminLTE) {
      (window as any).AdminLTE.SidebarToggle?.init();
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '/');
  };

  return (
    <div className="app-wrapper">
      {/* Navbar Superior */}
      <nav className="app-header navbar navbar-expand bg-body">
        <div className="container-fluid">
          {/* Links da Esquerda */}
          <ul className="navbar-nav">
            <li className="nav-item">
              <button 
                className="nav-link" 
                data-lte-toggle="sidebar" 
                role="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="Toggle sidebar"
              >
                <i className="bi bi-list"></i>
              </button>
            </li>
            <li className="nav-item d-none d-md-block">
              <Link href="/dashboard" className="nav-link">Home</Link>
            </li>
          </ul>

          {/* Links da Direita */}
          <ul className="navbar-nav ms-auto">
            {/* Notificações */}
            <li className="nav-item dropdown">
              <a className="nav-link" data-bs-toggle="dropdown" href="#" aria-label="Notificações">
                <i className="bi bi-bell"></i>
                <span className="navbar-badge badge text-bg-warning">15</span>
              </a>
              <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                <span className="dropdown-item dropdown-header">15 Notificações</span>
                <div className="dropdown-divider"></div>
                <a href="#" className="dropdown-item">
                  <i className="bi bi-envelope me-2"></i> 4 novas mensagens
                </a>
                <div className="dropdown-divider"></div>
                <a href="#" className="dropdown-item dropdown-footer">Ver Todas</a>
              </div>
            </li>

            {/* Usuário */}
            <li className="nav-item dropdown">
              <a className="nav-link" data-bs-toggle="dropdown" href="#" aria-label="Perfil do usuário">
                <i className="bi bi-person-circle"></i>
              </a>
              <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                <Link href="/profile" className="dropdown-item">
                  <i className="bi bi-person me-2"></i> Perfil
                </Link>
                <div className="dropdown-divider"></div>
                <Link href="/settings" className="dropdown-item">
                  <i className="bi bi-gear me-2"></i> Configurações
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                  <i className="bi bi-box-arrow-right me-2"></i> Sair
                </button>
              </div>
            </li>
          </ul>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
        {/* Logo / Brand */}
        <div className="sidebar-brand">
          <Link href="/dashboard" className="brand-link">
            <img 
              src="/icons/icon-152x152.png" 
              alt="Logo" 
              className="brand-image opacity-75 shadow"
            />
            <span className="brand-text fw-light">Na Bancada</span>
          </Link>
        </div>

        {/* Menu Sidebar */}
        <div className="sidebar-wrapper">
          <nav className="mt-2">
            <ul 
              className="nav sidebar-menu flex-column" 
              data-lte-toggle="treeview" 
              role="navigation" 
              aria-label="Menu principal"
            >
              {/* Dashboard */}
              <li className="nav-item">
                <Link href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  <i className="nav-icon bi bi-speedometer"></i>
                  <p>Dashboard</p>
                </Link>
              </li>

              {/* PDV */}
              <li className="nav-item">
                <Link href="/pdv" className={`nav-link ${isActive('/pdv') ? 'active' : ''}`}>
                  <i className="nav-icon bi bi-cash-register"></i>
                  <p>PDV</p>
                </Link>
              </li>

              {/* Menu */}
              <li className="nav-item">
                <Link href="/menu" className={`nav-link ${isActive('/menu') ? 'active' : ''}`}>
                  <i className="nav-icon bi bi-menu-button-wide"></i>
                  <p>Menu</p>
                </Link>
              </li>

              {/* Mesas */}
              <li className="nav-item">
                <Link href="/tables" className={`nav-link ${isActive('/tables') ? 'active' : ''}`}>
                  <i className="nav-icon bi bi-table"></i>
                  <p>Mesas</p>
                </Link>
              </li>

              {/* Cozinha */}
              <li className="nav-item">
                <Link href="/kitchen" className={`nav-link ${isActive('/kitchen') ? 'active' : ''}`}>
                  <i className="nav-icon bi bi-fire"></i>
                  <p>Cozinha</p>
                </Link>
              </li>

              {/* Usuários */}
              {user?.role === 'admin' && (
                <li className="nav-item">
                  <Link href="/users" className={`nav-link ${isActive('/users') ? 'active' : ''}`}>
                    <i className="nav-icon bi bi-people"></i>
                    <p>Usuários</p>
                  </Link>
                </li>
              )}

              {/* Relatórios */}
              <li className={`nav-item ${isActive('/reports') || isActive('/sales') ? 'menu-open' : ''}`}>
                <a href="#" className={`nav-link ${isActive('/reports') || isActive('/sales') ? 'active' : ''}`}>
                  <i className="nav-icon bi bi-bar-chart"></i>
                  <p>
                    Relatórios
                    <i className="nav-arrow bi bi-chevron-right"></i>
                  </p>
                </a>
                <ul className="nav nav-treeview">
                  <li className="nav-item">
                    <Link href="/reports" className={`nav-link ${isActive('/reports') ? 'active' : ''}`}>
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Geral</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/sales" className={`nav-link ${isActive('/sales') ? 'active' : ''}`}>
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Vendas</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Financeiro */}
              <li className={`nav-item ${isActive('/financial') || isActive('/expenses') ? 'menu-open' : ''}`}>
                <a href="#" className={`nav-link ${isActive('/financial') || isActive('/expenses') ? 'active' : ''}`}>
                  <i className="nav-icon bi bi-currency-dollar"></i>
                  <p>
                    Financeiro
                    <i className="nav-arrow bi bi-chevron-right"></i>
                  </p>
                </a>
                <ul className="nav nav-treeview">
                  <li className="nav-item">
                    <Link href="/financial" className={`nav-link ${isActive('/financial') ? 'active' : ''}`}>
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Lançamentos</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/expenses" className={`nav-link ${isActive('/expenses') ? 'active' : ''}`}>
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Despesas</p>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/financial/cash-registers" className={`nav-link ${location.startsWith('/financial/cash') ? 'active' : ''}`}>
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Caixa</p>
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Configurações */}
              {user?.role === 'admin' && (
                <li className="nav-item">
                  <Link href="/settings" className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>
                    <i className="nav-icon bi bi-gear"></i>
                    <p>Configurações</p>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="app-main">
        {/* Cabeçalho do Conteúdo (Breadcrumbs) */}
        {(pageTitle || breadcrumbs) && (
          <div className="app-content-header">
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm-6">
                  <h3 className="mb-0">{pageTitle}</h3>
                </div>
                {breadcrumbs && (
                  <div className="col-sm-6">
                    <ol className="breadcrumb float-sm-end">
                      {breadcrumbs.map((crumb, index) => (
                        <li 
                          key={index}
                          className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                          {...(index === breadcrumbs.length - 1 ? { 'aria-current': 'page' } : {})}
                        >
                              {crumb.href ? (
                            <Link href={crumb.href}>{crumb.label}</Link>
                          ) : (
                            crumb.label
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo da Página */}
        <div className="app-content">
          <div className="container-fluid">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="float-end d-none d-sm-inline">
          Versão 4.0
        </div>
        <strong>
          Copyright &copy; 2025{' '}
          <Link href="/dashboard" className="text-decoration-none">Na Bancada</Link>.
        </strong>
        {' '}Todos os direitos reservados.
      </footer>
    </div>
  );
}
