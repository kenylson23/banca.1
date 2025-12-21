import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

// Sales Icon - Money with gradient accent
export function SalesIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      <defs>
        <linearGradient id="salesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Coin stack */}
      <ellipse cx="12" cy="8" rx="7" ry="3" fill="url(#salesGradient)" opacity="0.2" />
      <ellipse cx="12" cy="8" rx="7" ry="3" stroke="url(#salesGradient)" strokeWidth="1.5" fill="none" />
      
      <ellipse cx="12" cy="12" rx="7" ry="3" fill="url(#salesGradient)" opacity="0.2" />
      <ellipse cx="12" cy="12" rx="7" ry="3" stroke="url(#salesGradient)" strokeWidth="1.5" fill="none" />
      
      <ellipse cx="12" cy="16" rx="7" ry="3" fill="url(#salesGradient)" opacity="0.3" />
      <ellipse cx="12" cy="16" rx="7" ry="3" stroke="url(#salesGradient)" strokeWidth="1.5" fill="none" />
      
      {/* Dollar sign */}
      <path
        d="M12 3v18M14.5 6.5C14.5 5.12 13.38 4 12 4s-2.5 1.12-2.5 2.5S10.62 9 12 9s2.5 1.12 2.5 2.5S13.38 14 12 14s-2.5-1.12-2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

// Orders Icon - Shopping bag with notification
export function OrdersIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      <defs>
        <linearGradient id="ordersGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      {/* Bag */}
      <path
        d="M6 6h12l1.5 12H4.5L6 6z"
        fill="url(#ordersGradient)"
        opacity="0.15"
      />
      <path
        d="M6 6h12l1.5 12H4.5L6 6z"
        stroke="url(#ordersGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Handle */}
      <path
        d="M8 6V5a4 4 0 0 1 8 0v1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Badge notification */}
      <circle cx="17" cy="4" r="3" fill="#f97316" opacity="0.9" />
      <text x="17" y="5.5" fontSize="5" fill="white" textAnchor="middle" fontWeight="bold">!</text>
    </svg>
  );
}

// Average Ticket Icon - Trending chart
export function TicketIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      <defs>
        <linearGradient id="ticketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      {/* Chart bars */}
      <rect x="4" y="14" width="3" height="6" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="10" y="10" width="3" height="10" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="16" y="6" width="3" height="14" rx="1" fill="url(#ticketGradient)" opacity="0.8" />
      
      {/* Trend line */}
      <path
        d="M4 16 L10 12 L16 8"
        stroke="url(#ticketGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Arrow up */}
      <path
        d="M19 5 L16 8 L19 8 L19 5 L22 8"
        fill="url(#ticketGradient)"
      />
    </svg>
  );
}

// Active Tables Icon - People at table
export function TablesIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      <defs>
        <linearGradient id="tablesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
      </defs>
      {/* Table */}
      <rect
        x="4"
        y="10"
        width="16"
        height="2"
        rx="1"
        fill="url(#tablesGradient)"
        opacity="0.3"
      />
      
      {/* People (circles) */}
      <circle cx="8" cy="6" r="2.5" fill="currentColor" opacity="0.3" />
      <circle cx="12" cy="6" r="2.5" fill="url(#tablesGradient)" opacity="0.7" />
      <circle cx="16" cy="6" r="2.5" fill="currentColor" opacity="0.3" />
      
      {/* Seats indicator */}
      <circle cx="6" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <circle cx="12" cy="14" r="1.5" stroke="url(#tablesGradient)" strokeWidth="1.5" />
      <circle cx="18" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

// Cancellations Icon - X with warning
export function CancellationsIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      <defs>
        <linearGradient id="cancelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
      {/* Circle background */}
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="url(#cancelGradient)"
        opacity="0.1"
      />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="url(#cancelGradient)"
        strokeWidth="1.5"
      />
      
      {/* X mark */}
      <path
        d="M8 8 L16 16 M16 8 L8 16"
        stroke="url(#cancelGradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Warning dot */}
      <circle cx="18" cy="6" r="2" fill="#ef4444" />
    </svg>
  );
}

// Menu Icon - Fork and knife
export function MenuIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Fork */}
      <path
        d="M7 2v8c0 1.1.9 2 2 2h1v9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path d="M7 2v6" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M10 2v6" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      
      {/* Knife */}
      <path
        d="M17 2v20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M14 5h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

// Kitchen Icon - Chef hat
export function KitchenIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Chef hat */}
      <path
        d="M6 12h12v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M6 12h12v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6 12a3 3 0 0 1 3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1 3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      
      {/* Detail lines */}
      <path d="M9 15h6" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <path d="M9 17h6" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

// Reports Icon - Document with chart
export function ReportsIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Document */}
      <path
        d="M6 4h8l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        fill="currentColor"
        opacity="0.1"
      />
      <path
        d="M6 4h8l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M14 4v4h4" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      
      {/* Mini chart */}
      <path
        d="M8 14 L10 12 L12 15 L14 11 L16 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

// PDV Icon - Cash register
export function PDVIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      <defs>
        <linearGradient id="pdvGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      {/* Cash register body */}
      <rect x="4" y="8" width="16" height="12" rx="2" fill="url(#pdvGradient)" opacity="0.2" />
      <rect x="4" y="8" width="16" height="12" rx="2" stroke="url(#pdvGradient)" strokeWidth="1.5" />
      
      {/* Display */}
      <rect x="7" y="4" width="10" height="3" rx="0.5" fill="currentColor" opacity="0.3" />
      <rect x="7" y="4" width="10" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      
      {/* Buttons */}
      <circle cx="8" cy="12" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="16" cy="12" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="8" cy="16" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="12" cy="16" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="16" cy="16" r="1" fill="currentColor" opacity="0.4" />
      
      {/* Dollar sign */}
      <text x="12" y="15" fontSize="6" fill="url(#pdvGradient)" textAnchor="middle" fontWeight="bold">$</text>
    </svg>
  );
}

// Customers Icon - Multiple people
export function CustomersIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* People circles */}
      <circle cx="9" cy="7" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      
      <circle cx="15" cy="7" r="3" fill="currentColor" opacity="0.2" />
      <circle cx="15" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      
      {/* Bodies */}
      <path
        d="M3 18c0-2.5 2.5-4 6-4s6 1.5 6 4v2H3v-2z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M3 18c0-2.5 2.5-4 6-4s6 1.5 6 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      
      <path
        d="M15 14c2 0 4 1 4 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

// Users Icon - Team/employees
export function UsersIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Badge/ID card */}
      <rect x="6" y="4" width="12" height="16" rx="2" fill="currentColor" opacity="0.1" />
      <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Photo */}
      <circle cx="12" cy="10" r="2.5" fill="currentColor" opacity="0.3" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Lines */}
      <path d="M9 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M9 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

// Loyalty Icon - Heart with star
export function LoyaltyIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      <defs>
        <linearGradient id="loyaltyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      {/* Heart */}
      <path
        d="M12 21l-1.5-1.35C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.5 11.15L12 21z"
        fill="url(#loyaltyGradient)"
        opacity="0.2"
      />
      <path
        d="M12 21l-1.5-1.35C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.5 11.15L12 21z"
        stroke="url(#loyaltyGradient)"
        strokeWidth="1.5"
      />
      {/* Star */}
      <path
        d="M12 8l1 2h2l-1.5 1.5L14 14l-2-1-2 1 .5-2.5L9 10h2l1-2z"
        fill="#fbbf24"
        stroke="#f59e0b"
        strokeWidth="1"
      />
    </svg>
  );
}

// Expenses Icon - Receipt/invoice
export function ExpensesIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Receipt with zigzag bottom */}
      <path
        d="M6 4h12v16l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 20V4z"
        fill="currentColor"
        opacity="0.1"
      />
      <path
        d="M6 4h12v16l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 20V4z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Lines */}
      <path d="M9 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M9 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M9 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      {/* Dollar */}
      <circle cx="15" cy="11" r="2" fill="#ef4444" opacity="0.9" />
      <text x="15" y="12.5" fontSize="3" fill="white" textAnchor="middle" fontWeight="bold">$</text>
    </svg>
  );
}

// Cash Register Icon - Open drawer
export function CashRegisterIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Drawer */}
      <rect x="4" y="10" width="16" height="8" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="4" y="10" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Money compartments */}
      <path d="M8 10v8M12 10v8M16 10v8" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      
      {/* Bills */}
      <rect x="5" y="6" width="4" height="2" rx="0.5" fill="#10b981" opacity="0.6" />
      <rect x="10" y="6" width="4" height="2" rx="0.5" fill="#10b981" opacity="0.6" />
      <rect x="15" y="6" width="4" height="2" rx="0.5" fill="#10b981" opacity="0.6" />
      
      {/* Handle */}
      <rect x="10" y="14" width="4" height="1" rx="0.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

// Coupons Icon - Ticket
export function CouponsIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      <defs>
        <linearGradient id="couponGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      {/* Ticket body */}
      <path
        d="M3 7h18v4c-1 0-2 1-2 2s1 2 2 2v4H3v-4c1 0 2-1 2-2s-1-2-2-2V7z"
        fill="url(#couponGradient)"
        opacity="0.2"
      />
      <path
        d="M3 7h18v4c-1 0-2 1-2 2s1 2 2 2v4H3v-4c1 0 2-1 2-2s-1-2-2-2V7z"
        stroke="url(#couponGradient)"
        strokeWidth="1.5"
      />
      {/* Dashed line */}
      <path d="M12 7v12" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
      {/* Percentage */}
      <text x="8" y="14" fontSize="6" fill="currentColor" fontWeight="bold">%</text>
    </svg>
  );
}

// Inventory Icon - Boxes/stock
export function InventoryIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Boxes stacked */}
      <path
        d="M4 14l8-4 8 4v6l-8 4-8-4v-6z"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M4 14l8-4 8 4M4 14v6l8 4M20 14v6l-8 4M12 10v10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* Top box */}
      <path
        d="M4 8l8-4 8 4-8 4-8-4z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M4 8l8-4 8 4-8 4-8-4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Products Icon - Package/box
export function ProductsIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Box */}
      <path
        d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
        fill="currentColor"
        opacity="0.1"
      />
      <path
        d="M12 3l8 4.5M12 3L4 7.5M12 3v9M20 7.5v9l-8 4.5M4 7.5v9l8 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      
      {/* Barcode */}
      <rect x="9" y="13" width="1" height="4" fill="currentColor" opacity="0.4" />
      <rect x="11" y="13" width="0.5" height="4" fill="currentColor" opacity="0.4" />
      <rect x="12" y="13" width="1" height="4" fill="currentColor" opacity="0.4" />
      <rect x="14" y="13" width="1" height="4" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

// Branches Icon - Multiple stores
export function BranchesIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Buildings */}
      <rect x="3" y="10" width="7" height="10" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="3" y="10" width="7" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      
      <rect x="14" y="6" width="7" height="14" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="14" y="6" width="7" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Windows */}
      <rect x="5" y="12" width="1.5" height="1.5" fill="currentColor" opacity="0.4" />
      <rect x="7.5" y="12" width="1.5" height="1.5" fill="currentColor" opacity="0.4" />
      <rect x="5" y="15" width="1.5" height="1.5" fill="currentColor" opacity="0.4" />
      <rect x="7.5" y="15" width="1.5" height="1.5" fill="currentColor" opacity="0.4" />
      
      <rect x="16" y="9" width="1.5" height="1.5" fill="currentColor" opacity="0.4" />
      <rect x="18.5" y="9" width="1.5" height="1.5" fill="currentColor" opacity="0.4" />
      <rect x="16" y="12" width="1.5" height="1.5" fill="currentColor" opacity="0.4" />
      <rect x="18.5" y="12" width="1.5" height="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

// Settings Icon - Gears
export function SettingsIconCustom({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Large gear */}
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.2" />
      <path
        d="M12 8v-1.5M12 17.5V16M8 12H6.5M17.5 12H16M9.17 9.17l-1.06-1.06M15.89 15.89l-1.06-1.06M9.17 14.83l-1.06 1.06M15.89 8.11l-1.06 1.06"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Small gear */}
      <circle cx="18" cy="6" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="18" cy="6" r="1.5" stroke="currentColor" strokeWidth="1" />
      <path d="M18 4.5v-0.5M18 7.5v0.5M16.5 6h-0.5M19.5 6h0.5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

// Subscription Icon - Crown/premium
export function SubscriptionIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      <defs>
        <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* Crown */}
      <path
        d="M4 18h16v2H4v-2zM3 14l3-6 3.5 4 2.5-4 2.5 4 3.5-4 3 6H3z"
        fill="url(#crownGradient)"
        opacity="0.3"
      />
      <path
        d="M4 18h16M3 14l3-6 3.5 4 2.5-4 2.5 4 3.5-4 3 6H3z"
        stroke="url(#crownGradient)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Jewels */}
      <circle cx="6" cy="8" r="1.5" fill="#ef4444" />
      <circle cx="12" cy="6" r="1.5" fill="#3b82f6" />
      <circle cx="18" cy="8" r="1.5" fill="#10b981" />
    </svg>
  );
}

// Profile Icon - User avatar
export function ProfileIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Circle background */}
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Head */}
      <circle cx="12" cy="10" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Body */}
      <path
        d="M6 19c0-3 2.5-5 6-5s6 2 6 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Printer Icon - Modern printer
export function PrinterIconCustom({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
    >
      {/* Paper */}
      <rect x="7" y="2" width="10" height="4" fill="currentColor" opacity="0.2" />
      <rect x="7" y="2" width="10" height="4" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Printer body */}
      <rect x="5" y="6" width="14" height="8" rx="1" fill="currentColor" opacity="0.1" />
      <rect x="5" y="6" width="14" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Output paper */}
      <rect x="7" y="14" width="10" height="6" fill="currentColor" opacity="0.2" />
      <rect x="7" y="14" width="10" height="6" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Lines on paper */}
      <path d="M9 17h6M9 19h4" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      
      {/* Button */}
      <circle cx="16" cy="9" r="1" fill="#10b981" />
    </svg>
  );
}
