# Layout System Documentation

## Design Tokens

### Spacing Scale
- `--space-1`: 4px
- `--space-2`: 8px  
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-12`: 48px

### Border Radius
- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px

### Shadows
- `--shadow-subtle`: Cards and subtle elements
- `--shadow-medium`: Menus and dropdowns
- `--shadow-strong`: Modals and overlays

### Z-Index Scale
- `--z-header`: 1000 (Header and navigation)
- `--z-menu`: 1100 (Dropdowns and menus)
- `--z-modal`: 1200 (Modals and overlays)

### Container Max Widths
- `--container-sm`: 640px
- `--container-md`: 768px
- `--container-lg`: 1024px
- `--container-xl`: 1280px

### Layout Dimensions
- `--header-height`: 64px
- `--sidebar-width`: 256px (16rem)
- `--sidebar-collapsed`: 72px (4.5rem)

## Grid System

### Breakpoints
- Mobile: < 640px (1 column)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (4 columns)

### Grid Layouts
- **Stats Cards**: 1×4 (mobile) → 2×2 (tablet) → 1×4 (desktop)
- **Charts**: 1×2 (mobile/tablet) → 2×1 (desktop)
- **Main Container**: max-width 1280px, centered with 24px horizontal padding

## App Shell Structure

```
┌─────────────────────────────────────────┐
│ Header (fixed, 64px height)            │
├─────────┬───────────────────────────────┤
│ Sidebar │ Main Content                  │
│ (256px) │ (flex-1, max-width 1280px)   │
│         │                               │
│         │ ┌─────────────────────────┐   │
│         │ │ Welcome Section         │   │
│         │ └─────────────────────────┘   │
│         │ ┌─┬─┬─┬─┐                   │
│         │ │1│2│3│4│ Stats Cards       │
│         │ └─┴─┴─┴─┘                   │
│         │ ┌─────┬─────┐               │
│         │ │Chart│Bank │ Charts        │
│         │ └─────┴─────┘               │
│         │ ┌─────────────────────────┐   │
│         │ │ Transactions Table      │   │
│         │ └─────────────────────────┘   │
│         │ ┌─────────────────────────┐   │
│         │ │ System Status           │   │
│         │ └─────────────────────────┘   │
└─────────┴───────────────────────────────┘
```

## Component Specifications

### Header
- Fixed position, full width
- Height: 64px
- Background: `bg-black/20 backdrop-blur-xl`
- Z-index: 1000
- Contains: Menu button (mobile), Search, User actions

### Sidebar
- Fixed width: 256px
- Background: `bg-black/20 backdrop-blur-xl`
- Z-index: 50
- Contains: Logo, Navigation items

### Cards
- Border radius: 8px (`rounded-lg`)
- Padding: 24px (`p-6`)
- Background: `bg-white/20 backdrop-blur-md`
- Shadow: `shadow-lg hover:shadow-2xl`
- Min-height: 140px (metrics), 350px (charts/tables)

### Typography
- Headings: `text-white` with `drop-shadow-lg`
- Body text: `text-white/90`
- Secondary text: `text-white/80`
- Muted text: `text-white/60`

## Responsive Behavior

### Mobile (< 640px)
- Sidebar: Hidden, accessible via menu button
- Header: Full width with mobile menu button
- Grid: Single column layout
- Cards: Full width, stacked vertically

### Tablet (640px - 1024px)
- Sidebar: Hidden, accessible via menu button
- Header: Full width
- Grid: 2 columns for stats, single column for charts
- Cards: Responsive widths

### Desktop (> 1024px)
- Sidebar: Visible, fixed width
- Header: Offset by sidebar width
- Grid: 4 columns for stats, 2 columns for charts
- Cards: Optimized for larger screens

## Accessibility

### Keyboard Navigation
- Tab order: Header → Sidebar → Main content
- Focus states: Visible with `focus:ring-2 focus:ring-white/30`
- Skip links: Available for main content

### Color Contrast
- White text on dark glass backgrounds
- Minimum contrast ratio: 4.5:1
- Drop shadows for text readability

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for interactive elements
- Proper heading hierarchy (h1 → h2 → h3)

## Performance Considerations

### Animations
- Hardware accelerated transforms
- Reduced motion support
- Staggered animations for better UX

### Layout Stability
- Fixed dimensions prevent layout shifts
- Consistent spacing prevents content jumping
- Optimized re-renders with React.memo where appropriate
