# Design Guidelines: Na Bancada Restaurant Management System

## Design Approach

**Selected Approach:** Material Design System with dashboard optimization
**Justification:** This is a utility-focused, information-dense application requiring efficiency and clarity. The system serves two distinct user groups (admin and kitchen staff) who need quick access to real-time data with minimal cognitive load. Material Design provides robust patterns for data display, status indicators, and real-time updates.

**Key Design Principles:**
- Efficiency over decoration: Every element serves a functional purpose
- Scannable hierarchy: Information organized for rapid comprehension
- Status-driven design: Clear visual feedback for order states
- Contextual interfaces: Different optimizations for admin vs. kitchen panels

---

## Core Design Elements

### A. Color Palette

**Primary Colors:**
- Primary: 34 85% 47% (deep teal - professional, calming for kitchen environment)
- Primary Light: 34 70% 60%
- Primary Dark: 34 90% 35%

**Status Colors:**
- Pending: 45 93% 58% (amber - attention needed)
- In Progress: 221 83% 53% (blue - active work)
- Ready: 142 71% 45% (green - completed)
- Served: 215 20% 65% (neutral gray - archived)
- Error/Alert: 0 84% 60% (red - urgent)

**Background Colors (Dark Mode Primary):**
- Background: 222 47% 11%
- Surface: 217 33% 17%
- Surface Elevated: 217 33% 21%

**Background Colors (Light Mode):**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Border: 214 32% 91%

**Text Colors:**
- Primary Text (Dark): 210 40% 98%
- Secondary Text (Dark): 215 20% 65%
- Primary Text (Light): 222 47% 11%
- Secondary Text (Light): 215 16% 47%

### B. Typography

**Font Families:**
- Primary: 'Inter' (via Google Fonts) - excellent for UI and data display
- Monospace: 'JetBrains Mono' - for order numbers, table IDs, prices

**Hierarchy:**
- Hero/Page Titles: text-4xl font-bold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Card Headers: text-lg font-semibold (18px)
- Body Text: text-base font-normal (16px)
- Small Text/Meta: text-sm font-normal (14px)
- Table Data: text-sm font-medium (14px)
- Monospace Data: font-mono text-sm

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing (within components): p-2, gap-2
- Component padding: p-4, p-6
- Section spacing: p-8, py-12
- Page margins: px-4 md:px-8

**Grid System:**
- Admin Dashboard: 12-column grid with responsive breakpoints
- Kitchen Panel: Full-width single column (maximizes order visibility)
- Menu Management: 2-3 column grid for menu items

### D. Component Library

**Navigation:**
- Top navigation bar: Fixed, h-16, with logo left, user menu right
- Admin sidebar: w-64, collapsible on mobile, icon + label navigation
- Kitchen: Minimal top bar with filters only

**Data Display:**
- Order Cards: Elevated surface with clear status badge, table number, time, items list
- Statistics Cards: Grid layout with icon, large number, label, trend indicator
- Menu Item Cards: Image thumbnail (if available), title, price, edit/delete actions
- Table List: Grid of cards showing table number, QR code preview, status (occupied/free)

**Forms:**
- Input fields: Outlined style with floating labels
- Selects: Material-style dropdowns
- File upload: Drag-and-drop zone for menu images
- Buttons: Contained (primary), outlined (secondary), text (tertiary)

**Status Indicators:**
- Order Status Badge: Pill-shaped, color-coded, positioned top-right of order cards
- Real-time Indicator: Pulsing dot for active connections
- Alert Badge: Red dot with count for new orders (kitchen panel)

**Modals & Overlays:**
- Modal dialogs: Centered, max-w-2xl, backdrop blur
- Toast notifications: Top-right, auto-dismiss, with action buttons
- Confirmation dialogs: Small, centered, clear action buttons

### E. Specific Panel Designs

**Admin Panel:**
- Dashboard: 4-column statistics cards, recent orders table below
- Tables Management: Grid of table cards with QR preview, generate/download buttons
- Menu Management: Filterable by category, add/edit in modal or side panel
- Dark/Light mode toggle available

**Kitchen Panel:**
- Optimized for dark mode (default)
- Large, scannable order cards
- Filter tabs at top: All | Pending | In Progress | Ready
- Order cards show: Table #, timestamp, items (with quantities), status update buttons
- New order: Sound alert + visual flash animation on card entry
- Full-width layout for maximum information density

**QR Code Features:**
- Generated QR codes: 300x300px minimum
- Download as PNG with table number labeled
- Preview in modal before download
- Bulk download option (generates ZIP)

### F. Interaction Patterns

**Real-time Updates:**
- Orders appear with subtle slide-in animation
- Status changes update card color and position (moving between filter views)
- Optimistic UI updates (show change immediately, rollback on error)

**Animations:** Minimal and purposeful only
- Page transitions: None (instant)
- Card entry: Slide-in from top (200ms)
- Status change: Color transition (150ms)
- Hover states: Subtle elevation increase (100ms)
- Alert pulse: Slow pulse on notification badge

**Audio Alerts (Kitchen):**
- New order: Pleasant chime (not jarring)
- Mute toggle available
- Visual alternative: Screen border flash in primary color

---

## Images

**Menu Item Images:**
- Aspect ratio: 4:3 or 16:9
- Minimum size: 800x600px
- Placeholder: Subtle gradient with utensils icon for items without images
- Display: Rounded corners (rounded-lg), object-cover

**No Hero Images:** This is a utility application. Focus on immediate functionality, not marketing visuals.

---

## Responsive Behavior

- Desktop (lg): Full sidebar, multi-column grids
- Tablet (md): Collapsible sidebar, 2-column grids
- Mobile (base): Bottom navigation, single column, swipe gestures for order status