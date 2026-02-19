# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast
- Respect reduced motion preferences

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# Content Garden - Development Blueprint

Content Garden is a creator-first workspace that treats content like a living knowledge garden: users capture “Seeds” (notes, links, voice, screenshots) into an intelligent drive, curate via a soft-clustered Garden, compose narratives on visual Canvases with grounded AI assistance, and ship weekly “Drops” (3–10 post bundles) through a Runway slot-based timeline. The product emphasizes a ritual flow (Capture → Curate → Compose → Package → Runway) with fast capture, low-friction triage, provenance-backed AI generation, and reusable Snippets to compound creator systems over time.

## 1. Pages (UI Screens)

- Home
  - Purpose: Primary quick-capture hub and entry to ritual flows.
  - Key sections/components:
    - Quick Capture Bar: single input with icons for Paste link, Voice note, Screenshot upload, Quick thought.
    - Quick Buttons: four prominent capture buttons.
    - Recent Seeds Carousel: horizontal scroll with preview + triage actions.
    - Continue Canvas CTA: last-active Canvas card.
    - Prepare Drop CTA.
    - Notifications / In-app Tips (ritual reminders).
    - Top Nav: Garden, Canvases, Drops, Runway, Snippets, Library, Profile.

- Garden (Seeds)
  - Purpose: Repository for Seeds with soft-clustered view and triage workflow.
  - Key sections/components:
    - Clustered Feed: algorithmic clusters labeled by topic.
    - Seed Card: title, snippet, tags, type icon, extracted bullets, timestamp, actions (Keep, Merge, Ignore, Open).
    - Triage Mode: swipe or multi-select actions.
    - Merge Modal: preview combined Seed, editable title/tags, provenance list.
    - Filter & Sort Bar.
    - Describe-to-Find Search input.
    - Bulk Actions Toolbar.
    - Empty State Guidance.

- Canvas Workspace
  - Purpose: Visual workspace to compose narratives, drag Seeds as nodes, and use AI tied to selected materials.
  - Key sections/components:
    - Left Pane (Seeds Panel): searchable list + "Propose related" suggestions.
    - Center Canvas: nodes, edges, text blocks, grid, zoom/pan, autosave.
    - Node Types: Seed node, Text block, Image/Video asset, Outline block.
    - Right Pane (AI Panel): actions like Draft 5 angles, Generate hooks, Turn selection into thread, Summarize selected Seeds (tone/length controls).
    - Version History timeline.
    - Publish/Export Button to create Drop.
    - Collaboration presence indicators (cursors, comments, mentions).
    - Canvas Templates Picker.

- Drops
  - Purpose: Create and manage Drop bundles (3–10 posts) generated from a Canvas.
  - Key sections/components:
    - Drop List: Drop cards (title, Canvas source, post count, status).
    - Drop Editor: structured posts area with fields Hook → Value → Example → CTA.
    - Post Variants Panel: LinkedIn, X, Short Video Script, Carousel.
    - Assets Panel: attach images/videos with provenance.
    - Auto-suggest Mix and AI re-run controls.
    - Publish Buttons: Export to Runway, CSV/JSON, scheduler integrations.

- Runway
  - Purpose: Slot-based manual scheduling timeline (Next 7 posts) for ordering posts and manual posting.
  - Key sections/components:
    - Vertical Slots Lane: date/time, status, checklist.
    - Drag Target Area: accepts post cards from Drops/Library.
    - Slot Detail Panel: preview copy, assets, checklist, Mark Posted.
    - Undo/History and Quick Post Controls.
    - Empty Slot Suggest section.

- Snippets
  - Purpose: Library of reusable hooks, CTAs, prompts, frameworks.
  - Key sections/components:
    - Snippets List: items with tags and usage counts.
    - Create Snippet Modal.
    - Insert Controls: quick-insert into Canvas/Drop.
    - Analytics: usage frequency/effectiveness.
    - Share & Import controls.

- Library
  - Purpose: Archive of published content and assets for repurpose.
  - Key sections/components:
    - Published Items Grid: thumbnails, platform, date, performance.
    - Asset Manager: images/videos with provenance.
    - Repurpose Suggestions (AI).
    - Export & Sync controls.

- Describe-to-Find Search
  - Purpose: Natural-language search across Seeds, Canvases, Drops, media moments.
  - Key sections/components:
    - NL Search Input with example prompts.
    - Results Tiers: exact matches, contextual snippets, related Drops.
    - Result Cards with provenance and timecode.
    - Refinement Controls and Open in Context.

- Auth: Login / Signup / Password Reset / Email Verification
  - Purpose: Secure onboarding and authentication.
  - Key sections/components:
    - Email Signup, Social Login (Google, Apple, LinkedIn), Magic Link.
    - Password Reset flow and Email Verification status/resend.

- User Profile & Settings
  - Purpose: Account management, billing, integrations, preferences.
  - Key sections/components:
    - Account Info, Billing & Subscription, Connected Integrations.
    - Security Settings (2FA), Workspace Settings, AI & Capture Defaults.

- Landing Page
  - Purpose: Public marketing and acquisition.
  - Key sections/components:
    - Hero, Feature Highlights, How It Works, Pricing, Testimonials, Footer.

- Admin Dashboard
  - Purpose: Internal admin for users, moderation, billing, analytics.
  - Key sections/components:
    - User Management, Moderation Queue, Billing & Usage, Product Analytics, System Logs.

- Legal & Support
  - Purpose: Policies and help resources.
  - Key sections/components:
    - Privacy Policy, Terms, Cookie Policy, About & Help (guides, FAQs, support form), 404/500 pages, Loading & Success states.

## 2. Features

- User Authentication
  - Technical details:
    - OAuth2 for Google/Apple/LinkedIn, email/password, magic link.
    - JWT access & refresh tokens; secure HttpOnly cookies or Authorization header.
    - Password hashing (bcrypt/argon2), rate-limiting, audit logs.
  - Implementation notes: support SSO/team flows and store refresh tokens securely; implement 2FA option.

- Seed Capture & Storage
  - Technical details:
    - File storage: S3-compatible with CDN and signed URLs.
    - Seed model: id, user_id, type, title, content, tags, extracted_bullets, source_url, attachments[], created_at.
    - Background workers for scraping links, audio/video transcription, OCR, metadata extraction.
    - Encryption-at-rest; quotas and upload throttling.
  - Implementation notes: capture endpoints optimized for low-latency UX (30s ritual). Store provenance links to sources.

- Soft Clustering & Triage
  - Technical details:
    - Embeddings pipeline + vector DB for clustering; incremental re-clustering.
    - Confidence scoring for cluster assignments.
    - Merge operation consolidates metadata, attachments, and provenance; audit trail with undo.
  - Implementation notes: expose Merge preview UI; surface “Propose related” seeds in Canvas.

- Canvas Workspace
  - Technical details:
    - Real-time collaboration via WebSockets (Socket.IO) or WebRTC with CRDT/OT.
    - Canvas persisted model: nodes[], edges[], metadata, version snapshots.
    - Drag-and-drop ingestion of Seeds; autosave and version history.
    - AI actions API accepts selected node IDs, returns structured outputs with citations.
  - Implementation notes: implement pan/zoom performance optimizations, lazy-load node content, and client-side caching.

- AI Tools (Generation & Extraction)
  - Technical details:
    - LLM provider integration for generation and embeddings; configurable provider.
    - Speech-to-text for audio/video transcripts.
    - OCR for screenshots.
    - Prompt templates embedding Seed provenance and constraints to reduce hallucination.
    - AI credits accounting, rate-limits, and provenance metadata for outputs.
  - Implementation notes: show provenance and confidence on all AI outputs; cache LLM responses for repeatability.

- Drop Generator & Editor
  - Technical details:
    - Drop model linking Canvas, Seeds, and posts[] where each post has fields Hook, Value, Example, CTA, variants[].
    - Platform variant templates (LinkedIn/X/video/carousel).
    - Export endpoints for Runway and third-party schedulers.
  - Implementation notes: validate asset sizes/formats; allow inline AI re-run with user-adjustable tone/length.

- Runway Slot Timeline
  - Technical details:
    - Slot model: id, date, status (empty/filled/posted), post_id, checklist[].
    - Drag-and-drop endpoints; client collision handling.
    - Mark Posted with timestamp, history and optional webhook for integrations.
  - Implementation notes: implement optimistic UI and offline sync for brief network loss.

- Describe-to-Find Search
  - Technical details:
    - Semantic search via embeddings stored in vector DB; index Seeds, transcripts, Canvas metadata.
    - Search endpoint supporting NL input, filters, and confidence scoring; stream progressive results.
  - Implementation notes: enable result provenance links and "open in context" deep links.

- Snippets Library
  - Technical details:
    - CRUD API with sharing and usage metrics; insert API for Canvas/Drop.
  - Implementation notes: provide import/export for snippet sets and team visibility controls.

- Asset Manager
  - Technical details:
    - S3 storage, image processing (thumbnails, conversion), video transcoding and preview generation.
    - Asset metadata links to Seeds/Canvases/Drops.
  - Implementation notes: lifecycle policies, quota enforcement, and fast thumbnailing for UI.

- Notifications & Alerts
  - Technical details:
    - Transactional email (SendGrid/SES), in-app notifications service, push optional.
    - Template system, retries, and DLQ.
  - Implementation notes: user preference controls and ritual reminder scheduler.

- Admin & Analytics
  - Technical details:
    - RBAC, moderation queue, analytics pipeline (DAU, Drops/week, retention, AI usage), billing via Stripe.
  - Implementation notes: surfaced dashboards and exportable reports for product metrics.

- Security & Privacy
  - Technical details:
    - Encryption-at-rest for files and PII fields, RBAC and workspace isolation, GDPR/CCPA export/deletion flows.
    - Logging & monitoring (Sentry), rate-limit, brute-force protections.
  - Implementation notes: anonymize logs with PII filters and secure data access patterns.

- Third-party Integrations
  - Technical details:
    - OAuth connectors for Drive providers, social auth, connector framework for schedulers, webhook endpoints.
  - Implementation notes: token refresh and secure storage, permissions scope UI.

## 3. User Journeys

- New User — Quick Start
  1. Sign up via email or social login; verify email.
  2. Onboarding modal: guided micro-rituals (capture first Seed, triage a cluster, open Canvas, create first Drop).
  3. Capture: use Quick Capture bar to paste a link — backend scrapes and creates Seed with extracted bullets and tags.
  4. Curate: open Garden, use Triage Mode to Keep/Merge/Ignore suggested cluster.
  5. Compose: open Canvas, drag Seed nodes, call “Draft 5 angles” in AI Panel, pick an angle and expand into outline blocks.
  6. Package: Publish Canvas → Generate Drop; review suggested mix and edit post cards.
  7. Runway: drag best post into a Runway slot, complete checklist, and mark posted (manual post).
  8. Library: view published item and repurpose suggestions.

- Daily Triager (DAU)
  1. Open Home; complete Capture (quick thought or voice note).
  2. Enter Garden; use swipe triage for clusters (Keep/Merge/Ignore).
  3. Accept merges recommended by confidence scoring; undo if needed.
  4. Continue Canvas from Home CTA, open AI Panel, generate hooks grounded in selected Seeds.

- Canvas Collaborator (Team)
  1. Open shared Canvas; see collaborator cursors and comments.
  2. Insert team Seed(s) from left pane; AI suggests related Seeds across workspace.
  3. Create nodes, assign mentions, leave comments for co-author.
  4. Export Canvas to Drop; assign posts to team member for Runway placement.

- Drop Creator (Weekly Ritual)
  1. Open recent Canvas; run Drop generator (app suggests editorial mix).
  2. Edit post cards and attach assets from Seed provenance or Asset Manager.
  3. Create variants per platform; preview.
  4. Export to Runway or CSV; push selected posts to Runway slots.

- Admin (Workspace Owner)
  1. Sign in to Admin Dashboard.
  2. Manage user roles and team invites.
  3. Review moderation queue; approve or remove flagged Seeds/Drops.
  4. View analytics and billing; adjust plan or export invoices.

- Describe-to-Find Flow
  1. Enter Describe-to-Find search query (natural language).
  2. Results stream: Seeds, Canvas snippets, timecode moments.
  3. User opens result in Garden/Canvas context and inserts into current Canvas or Drop.

## 4. UI Guide

Implementation of the UI must strictly follow the Visual Style spec below. Use the provided palette, typography scales, spacing, and interactive behaviors consistently across components. Components should be built as a reusable design system and documented in a component library (Storybook or similar). All interactive states must include micro-interactions and accessible focus styles.

---

## Visual Style

### Color Palette:
- Backgrounds: deep charcoal (#18181B, #232329) for main workspace; panels/cards #26262C, #292932.
- Accent/background separation: pure black (#000000).
- Text & icons: white (#FFFFFF) and very light gray (#EDEDED).
- Accent colors:
  - Electric green #39FF90
  - Vibrant orange #FF7F3F
  - Vivid purple #A259FF
  - Neon yellow #F7E06E
  - Signal red #FF5757
- Effects: subtle gradients/glows (blue-purple/magenta/green) used sparingly; transparent overlays and soft drop shadows.

### Typography & Layout:
- Font family: Inter / SF Pro / similar sans-serif.
- Weights: Regular 400 (body), Medium 500 (labels), Bold 700 (headlines).
- Sizes: Titles 24–32px, Section headers 18–20px, Body/caption 13–16px.
- Spacing: gutters 24–32px; card padding 16–24px.
- Alignment: left-aligned content; centered elements for primary canvas area.
- Subtle letter-spacing for readability on dark backgrounds.

### Key Design Elements

- Card Design:
  - Rounded corners 10–16px radius.
  - Soft ambient glows, faint border outlines #36363C.
  - Hover: elevated shadow, slight brightening, neon-accent outline.
  - Layout: title top, secondary below, icons/avatars in corners, actions at bottom/side.
  - Drag affordances: cursor change, scaling, glowing border on hover/drag.

- Navigation:
  - Fixed vertical sidebar (collapsible sections), nested tree views for folders/tags.
  - Top nav: minimalist with underline/color highlight for active state.
  - Pinned icons with tooltips; animated expand/collapse.

- Data Visualization:
  - Canvas nodes: rounded rectangles, soft connector lines, glowing accents.
  - Charts: minimalist, accent color highlights, no gridlines.
  - Selection feedback: glowing halo or subtle pulse.

- Interactive Elements:
  - Buttons: rounded/pill shapes. Primary fills use accent colors (#39FF90 for confirm, #A259FF for actions); white text; soft glows on hover.
  - Inputs: dark backgrounds, thin high-contrast borders, rounded corners, glowing focus states.
  - Toggles/checkboxes: minimalist with accent fill when active.
  - Micro-interactions: smooth transitions, slight scaling, color glows.

### Design Philosophy
- Modern, futuristic dark UI with neon accents.
- Minimalist, focus-first layouts to reduce visual noise.
- Visual delight through micro-interactions while maintaining accessible contrast.
- Build ritual-focused UX that supports quick capture and low-friction flow.

---

Implementation Notes:
- Build a component library reflecting this design system; enforce tokens for colors, spacing, and typography.
- Ensure accessibility: contrast ratios, keyboard navigation, and screen reader labels for dynamic Canvas elements.
- After every development step, validate against this blueprint: pages, features, user journeys, and UI Guide must be satisfied before marking the step complete.

Instructions to AI Development Tool:
- At each implementation milestone, reference this blueprint and run an acceptance checklist:
  - Pages implemented with specified sections/components.
  - Core features present and functioning (auth, capture, clustering, Canvas, Drops, Runway, search).
  - AI outputs show provenance and confidence metadata.
  - Visual style tokens applied consistently.
  - Security, privacy, and quotas implemented per spec.
- Only proceed when all checklist items pass validation.



## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
