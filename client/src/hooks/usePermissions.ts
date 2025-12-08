import { useAuth } from './useAuth';
import { ROLE_PERMISSIONS, type UserRole } from '@shared/schema';

export function usePermissions() {
  const { user } = useAuth();
  
  const role = (user?.role || 'kitchen') as UserRole;
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.kitchen;
  
  const hasPermission = (permission: keyof typeof ROLE_PERMISSIONS.admin) => {
    return permissions[permission] === true;
  };
  
  const canAccess = (section: string): boolean => {
    switch (section) {
      case 'dashboard':
        return permissions.canAccessDashboard;
      case 'tables':
      case 'open-tables':
        return permissions.canAccessTables;
      case 'menu':
        return permissions.canAccessMenu;
      case 'pdv':
        return permissions.canAccessPDV;
      case 'kitchen':
        return permissions.canAccessKitchen;
      case 'reports':
      case 'sales':
        return permissions.canAccessReports;
      case 'financial':
      case 'financial-categories':
      case 'financial-cash-registers':
      case 'financial-shifts':
      case 'financial-reports':
      case 'expenses':
        return permissions.canAccessFinancial;
      case 'users':
        return permissions.canAccessUsers;
      case 'settings':
        return permissions.canAccessSettings;
      case 'branches':
        return permissions.canAccessBranches;
      case 'customers':
      case 'loyalty':
      case 'coupons':
        return permissions.canAccessCustomers;
      case 'inventory':
        return permissions.canAccessInventory;
      case 'subscription':
        return permissions.canManageSubscription;
      case 'superadmin':
        return role === 'superadmin';
      case 'profile':
        return true;
      default:
        return false;
    }
  };
  
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isManager = role === 'manager';
  const isCashier = role === 'cashier';
  const isWaiter = role === 'waiter';
  const isKitchen = role === 'kitchen';
  const isSuperAdmin = role === 'superadmin';
  
  const canManageOrders = isAdmin || isManager || isCashier || isWaiter;
  const canReceivePayments = isAdmin || isManager || isCashier;
  const canApplyDiscounts = permissions.canApplyDiscounts;
  const canCancelOrders = permissions.canCancelOrders;
  const canCloseShifts = permissions.canCloseShifts;
  const canEditMenu = permissions.canEditMenu;
  
  return {
    role,
    permissions,
    hasPermission,
    canAccess,
    isAdmin,
    isManager,
    isCashier,
    isWaiter,
    isKitchen,
    isSuperAdmin,
    canManageOrders,
    canReceivePayments,
    canApplyDiscounts,
    canCancelOrders,
    canCloseShifts,
    canEditMenu,
    roleLabel: permissions.label,
    roleDescription: permissions.description,
  };
}
