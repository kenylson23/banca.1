import { ReactNode, useEffect } from 'react';
import { Link } from 'wouter';
import { Sidebar } from '@/components/Sidebar';

interface AdminLTELayoutProps {
  children: ReactNode;
  pageTitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AdminLTELayout({ children, pageTitle = 'Dashboard', breadcrumbs }: AdminLTELayoutProps) {
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
      <Sidebar />

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
