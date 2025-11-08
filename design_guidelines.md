# Design Guidelines: Energia+Publicidade Smart City App

## Design Approach
**Selected Approach:** Reference-based with Smart City/Fitness App inspiration
- Primary references: Fitness tracking apps (Strava, Nike Run Club) for the walking interface
- Smart city dashboards for admin panels
- Modern fintech apps for clean, trust-building aesthetics

**Core Principle:** Mobile-first smart city application with gamification. Design for 360-430px width first, then scale up.

## Typography System
**Font Family:** Inter or Poppins from Google Fonts

**Hierarchy:**
- Page Titles: text-2xl to text-3xl, font-semibold
- Section Headers: text-xl, font-semibold  
- Metric Values (distance, energy): text-4xl to text-5xl, font-bold (these need to be very prominent)
- Body Text: text-base, font-normal
- Secondary Text: text-sm, text-gray-600

## Layout System
**Spacing Units:** Use Tailwind units of 4, 6, 8, and 12 consistently
- Card padding: p-6 to p-8
- Section spacing: space-y-6 for mobile, space-y-8 for larger screens
- Bottom navigation height: h-16
- Button minimum height: h-12 (48px touch target)

**Container Strategy:**
- Mobile: px-4, full-width cards with subtle margins
- Tablet/Desktop: max-w-md centered for single-column, max-w-6xl for two-column layouts

## Component Library

### Navigation
**Bottom Bar (Fixed):** 4 icon buttons with labels below
- Icons: Heroicons outline style
- Active state: Fill icon with accent color
- Height: h-16, safe area padding for mobile
- Items: Início (Home), Caminhada (Walk), Ranking, Painéis (Dashboards)

### Cards
- Border radius: rounded-2xl (16-24px)
- Shadow: subtle (shadow-sm to shadow-md)
- Background: white
- Padding: p-6 mobile, p-8 tablet+
- Full-width on mobile with mx-4, stacked vertically

### Buttons
**Primary:** 
- Full-width on mobile (w-full)
- Height: h-12 minimum
- Rounded: rounded-full (pill shape)
- Background: gradient or solid accent color
- Text: text-base, font-semibold

**Secondary:**
- Same sizing as primary
- Outline style with border-2
- Transparent background

### Form Inputs
- Height: h-12 minimum
- Rounded: rounded-xl
- Border: border-gray-300
- Focus state: ring accent color
- Full-width on mobile

### Metric Display Cards
Large number displays for walking stats:
- Value typography: text-5xl, font-bold
- Label below: text-sm, text-gray-600
- Icon above value: w-8 h-8 in accent color
- Background: light accent color tint (bg-green-50 or bg-blue-50)

### Lists (Ranking)
- Vertical scroll list
- Each item: px-4 py-4
- Dividers: border-b border-gray-200
- Top 3: Highlighted background (subtle yellow/gold tint)
- Medal icons for positions 1-3

## Screen-Specific Layouts

### Tela 1 - Home
- Single column, centered content
- Logo text at top (text-xl, font-bold)
- Hero section: Large title (text-3xl), subtitle (text-xl), 2-3 line description
- Two stacked buttons with space-y-4
- No hero image needed (text-focused for clarity)

### Tela 2 - Walking Tracker
- Permission card first visit: Icon (w-16 h-16), explanation text, permission button
- Active tracking: One large card showing distance (text-5xl), two smaller metric cards below in 2-column grid
- Fixed bottom button: "Encerrar caminhada"

### Tela 3 - Ranking
- Simple list view, optimized for thumb scroll
- White background, clean dividers
- Each item shows: position badge, name, distance, energy value

### Tela 4 - Store Dashboard  
- Vertical scroll form
- Input fields stacked (space-y-4)
- Upload card: dashed border, centered icon and text
- Metric cards below form
- Bottom CTA button

### Tela 5 - City Dashboard
- Stacked metric cards (space-y-4)
- Simple chart (bar or line, minimal design)
- Explanatory text in smaller card at bottom

## Color Palette
**Base:**
- Background: #F9FAFB or #F5F5F7
- Card background: #FFFFFF
- Text primary: #111827
- Text secondary: #6B7280
- Borders: #E5E7EB

**Accent (Choose one consistently):**
- Tech Green: #22C55E (primary choice for energy theme)
- Tech Blue: #3B82F6 (alternative)
- Use for: buttons, active states, metric highlights, icons

**Status:**
- Top 3 ranking: Subtle gold/yellow background (#FEF3C7)

## Responsive Behavior
**Mobile (< 768px):** Single column, stacked cards, bottom navigation
**Tablet (768px+):** Can use 2-column grid for metric cards, maintain single-column forms
**Desktop (1024px+):** Max-width container, dashboards can show 2-column layouts

## Images
**No hero images required** - this is a functional app focused on clarity and data display. 

**Icons only:** Use Heroicons outline throughout for:
- Navigation icons (home, walking person, trophy, chart)
- Feature indicators (location pin, energy bolt, store)
- Empty states and permissions

**Logo upload area:** Dashed border placeholder with upload icon, for store dashboard only

## Interactions
- **Touch targets:** Minimum 48px height/width
- **Feedback:** Subtle opacity change on tap (opacity-90)
- **Loading states:** Skeleton loaders for data fetching
- **Animations:** Minimal - only for metric value updates (count-up animation) and screen transitions

## Accessibility
- High contrast text (WCAG AA minimum)
- Large touch targets throughout
- Clear focus states for navigation
- Icon + text labels for all navigation items