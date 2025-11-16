import { ReactNode } from 'react';

interface AdminLTELayoutProps {
  children: ReactNode;
  pageTitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AdminLTELayout({ children, pageTitle = 'Dashboard', breadcrumbs }: AdminLTELayoutProps) {
  return (
    <div className="app-wrapper">
      {/* Navbar Superior */}
      <nav className="app-header navbar navbar-expand bg-body">
        <div className="container-fluid">
          {/* Links da Esquerda */}
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" data-lte-toggle="sidebar" href="#" role="button">
                <i className="bi bi-list"></i>
              </a>
            </li>
            <li className="nav-item d-none d-md-block">
              <a href="/" className="nav-link">Home</a>
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
                <a href="#" className="dropdown-item">
                  <i className="bi bi-person me-2"></i> Perfil
                </a>
                <div className="dropdown-divider"></div>
                <a href="#" className="dropdown-item">
                  <i className="bi bi-gear me-2"></i> Configurações
                </a>
                <div className="dropdown-divider"></div>
                <a href="#" className="dropdown-item">
                  <i className="bi bi-box-arrow-right me-2"></i> Sair
                </a>
              </div>
            </li>
          </ul>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="app-sidebar bg-body-secondary shadow" data-bs-theme="dark">
        {/* Logo / Brand */}
        <div className="sidebar-brand">
          <a href="/" className="brand-link">
            <img 
              src="/icons/icon-152x152.png" 
              alt="Logo" 
              className="brand-image opacity-75 shadow"
            />
            <span className="brand-text fw-light">Na Bancada</span>
          </a>
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
                <a href="/dashboard" className="nav-link active">
                  <i className="nav-icon bi bi-speedometer"></i>
                  <p>Dashboard</p>
                </a>
              </li>

              {/* PDV */}
              <li className="nav-item">
                <a href="/pdv" className="nav-link">
                  <i className="nav-icon bi bi-cash-register"></i>
                  <p>PDV</p>
                </a>
              </li>

              {/* Menu */}
              <li className="nav-item">
                <a href="/menu" className="nav-link">
                  <i className="nav-icon bi bi-menu-button-wide"></i>
                  <p>Menu</p>
                </a>
              </li>

              {/* Mesas */}
              <li className="nav-item">
                <a href="/tables" className="nav-link">
                  <i className="nav-icon bi bi-table"></i>
                  <p>Mesas</p>
                </a>
              </li>

              {/* Cozinha */}
              <li className="nav-item">
                <a href="/kitchen" className="nav-link">
                  <i className="nav-icon bi bi-fire"></i>
                  <p>Cozinha</p>
                </a>
              </li>

              {/* Usuários */}
              <li className="nav-item">
                <a href="/users" className="nav-link">
                  <i className="nav-icon bi bi-people"></i>
                  <p>Usuários</p>
                </a>
              </li>

              {/* Relatórios */}
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <i className="nav-icon bi bi-bar-chart"></i>
                  <p>
                    Relatórios
                    <i className="nav-arrow bi bi-chevron-right"></i>
                  </p>
                </a>
                <ul className="nav nav-treeview">
                  <li className="nav-item">
                    <a href="/reports" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Geral</p>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="/sales" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Vendas</p>
                    </a>
                  </li>
                </ul>
              </li>

              {/* Financeiro */}
              <li className="nav-item">
                <a href="#" className="nav-link">
                  <i className="nav-icon bi bi-currency-dollar"></i>
                  <p>
                    Financeiro
                    <i className="nav-arrow bi bi-chevron-right"></i>
                  </p>
                </a>
                <ul className="nav nav-treeview">
                  <li className="nav-item">
                    <a href="/financial" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Lançamentos</p>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="/expenses" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Despesas</p>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a href="/financial/cash-registers" className="nav-link">
                      <i className="nav-icon bi bi-circle"></i>
                      <p>Caixa</p>
                    </a>
                  </li>
                </ul>
              </li>

              {/* Configurações */}
              <li className="nav-item">
                <a href="/settings" className="nav-link">
                  <i className="nav-icon bi bi-gear"></i>
                  <p>Configurações</p>
                </a>
              </li>
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
                            <a href={crumb.href}>{crumb.label}</a>
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
          <a href="/" className="text-decoration-none">Na Bancada</a>.
        </strong>
        {' '}Todos os direitos reservados.
      </footer>
    </div>
  );
}
