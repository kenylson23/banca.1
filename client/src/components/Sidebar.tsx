import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '/');
  };

  const isMenuOpen = (paths: string[]) => {
    return paths.some(path => location.startsWith(path));
  };

  return (
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
              <Link 
                href="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                data-testid="link-dashboard"
              >
                <i className="nav-icon bi bi-speedometer"></i>
                <p>Dashboard</p>
              </Link>
            </li>

            {/* PDV */}
            <li className="nav-item">
              <Link 
                href="/pdv" 
                className={`nav-link ${isActive('/pdv') ? 'active' : ''}`}
                data-testid="link-pdv"
              >
                <i className="nav-icon bi bi-cash-register"></i>
                <p>PDV</p>
              </Link>
            </li>

            {/* Menu */}
            <li className="nav-item">
              <Link 
                href="/menu" 
                className={`nav-link ${isActive('/menu') ? 'active' : ''}`}
                data-testid="link-menu"
              >
                <i className="nav-icon bi bi-menu-button-wide"></i>
                <p>Menu</p>
              </Link>
            </li>

            {/* Mesas */}
            <li className="nav-item">
              <Link 
                href="/tables" 
                className={`nav-link ${isActive('/tables') ? 'active' : ''}`}
                data-testid="link-tables"
              >
                <i className="nav-icon bi bi-table"></i>
                <p>Mesas</p>
              </Link>
            </li>

            {/* Cozinha */}
            <li className="nav-item">
              <Link 
                href="/kitchen" 
                className={`nav-link ${isActive('/kitchen') ? 'active' : ''}`}
                data-testid="link-kitchen"
              >
                <i className="nav-icon bi bi-fire"></i>
                <p>Cozinha</p>
              </Link>
            </li>

            {/* Usuários */}
            {user?.role === 'admin' && (
              <li className="nav-item">
                <Link 
                  href="/users" 
                  className={`nav-link ${isActive('/users') ? 'active' : ''}`}
                  data-testid="link-users"
                >
                  <i className="nav-icon bi bi-people"></i>
                  <p>Usuários</p>
                </Link>
              </li>
            )}

            {/* Relatórios - Menu com Submenu */}
            <li className={`nav-item ${isMenuOpen(['/reports', '/sales']) ? 'menu-open' : ''}`}>
              <a 
                href="#" 
                className={`nav-link ${isMenuOpen(['/reports', '/sales']) ? 'active' : ''}`}
                data-testid="nav-reports-toggle"
              >
                <i className="nav-icon bi bi-bar-chart"></i>
                <p>
                  Relatórios
                  <i className="nav-arrow bi bi-chevron-right"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link 
                    href="/reports" 
                    className={`nav-link ${isActive('/reports') ? 'active' : ''}`}
                    data-testid="link-reports-general"
                  >
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Geral</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    href="/sales" 
                    className={`nav-link ${isActive('/sales') ? 'active' : ''}`}
                    data-testid="link-reports-sales"
                  >
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Vendas</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Financeiro - Menu com Submenu */}
            <li className={`nav-item ${isMenuOpen(['/financial', '/expenses']) ? 'menu-open' : ''}`}>
              <a 
                href="#" 
                className={`nav-link ${isMenuOpen(['/financial', '/expenses']) ? 'active' : ''}`}
                data-testid="nav-financial-toggle"
              >
                <i className="nav-icon bi bi-currency-dollar"></i>
                <p>
                  Financeiro
                  <i className="nav-arrow bi bi-chevron-right"></i>
                </p>
              </a>
              <ul className="nav nav-treeview">
                <li className="nav-item">
                  <Link 
                    href="/financial" 
                    className={`nav-link ${isActive('/financial') && !location.startsWith('/financial/') ? 'active' : ''}`}
                    data-testid="link-financial-transactions"
                  >
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Lançamentos</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    href="/expenses" 
                    className={`nav-link ${isActive('/expenses') ? 'active' : ''}`}
                    data-testid="link-financial-expenses"
                  >
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Despesas</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    href="/financial/cash-registers" 
                    className={`nav-link ${location.startsWith('/financial/cash') ? 'active' : ''}`}
                    data-testid="link-financial-cash"
                  >
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Caixa</p>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    href="/financial/reports" 
                    className={`nav-link ${location.startsWith('/financial/reports') ? 'active' : ''}`}
                    data-testid="link-financial-reports"
                  >
                    <i className="nav-icon bi bi-circle"></i>
                    <p>Relatórios</p>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Configurações */}
            {user?.role === 'admin' && (
              <li className="nav-item">
                <Link 
                  href="/settings" 
                  className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
                  data-testid="link-settings"
                >
                  <i className="nav-icon bi bi-gear"></i>
                  <p>Configurações</p>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
