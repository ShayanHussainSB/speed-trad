# updn.trade Design System

## Brand Identity

**Product Name:** updn.trade

**Tagline:** "Race the Market"

**Positioning:** Speed trading reimagined as a racing experience for Gen-Z and crypto-native traders

---

## Design Philosophy

### Core Aesthetic: OutRun/Synthwave Sunset

The updn.trade brand embraces a retrofuturistic aesthetic inspired by 1980s Miami, OutRun arcade games, and California sunset culture. This creates a **warm, inviting, energetic** atmosphere that differentiates from:

- Generic dark mode crypto exchanges
- Soft pastel consumer fintech apps (like Euphoria)
- Complex trading terminals

### Key Principles

1. **Warm & Inviting** - Not cold or intimidating
2. **Racing Energy** - Speed, motion, excitement
3. **Retro-Future** - Nostalgic yet forward-looking
4. **Simple & Accessible** - Clean despite bold aesthetics
5. **Crypto-Credible** - Feels native to on-chain culture
6. **Readable First** - High contrast text against dark panels

---

## Color Palette

### Primary Colors

| Color Name | Hex Code | CSS Variable | Usage |
| --- | --- | --- | --- |
| Sunset Orange | `#FF6B35` | `--sunset-orange` | Primary accent, CTAs, brand elements |
| Hot Pink | `#FF006E` | `--hot-pink` | Secondary accent, "short" direction |
| Electric Purple | `#8338EC` | `--electric-purple` | Tertiary accent, gradients |
| Warm Yellow | `#FFBE0B` | `--warm-yellow` | Highlights, "long" direction, sun |
| Deep Purple | `#3A0CA3` | `--deep-purple` | Dark accents, text on light buttons |
| Peach | `#FB5607` | `--peach` | Supporting warm tone |

### Accent Colors (New)

| Color Name | Hex Code | CSS Variable | Usage |
| --- | --- | --- | --- |
| Cyan Glow | `#00F5FF` | `--cyan-glow` | Live indicators, neon accents |
| Miami Teal | `#00CED1` | `--miami-teal` | Secondary neon accents |

### Neutral Colors

| Color Name | Hex Code | CSS Variable | Usage |
| --- | --- | --- | --- |
| White | `#FFFFFF` | `--white` | Primary text on dark backgrounds |
| Off-White | `#FFF8F0` | `--off-white` | Subtle backgrounds |

### Text Hierarchy Colors (Solid - Not Opacity-Based)

| Purpose | Hex Code | CSS Variable | Usage |
| --- | --- | --- | --- |
| Primary | `#FFFFFF` | `--text-primary` | Main content, headings, active text |
| Secondary | `#E8E4EC` | `--text-secondary` | Body text, emphasis |
| Tertiary | `#B8A8C8` | `--text-tertiary` | Labels, captions, less important |
| Muted | `#8B7A9E` | `--text-muted` | Placeholders, hints |
| Disabled | `#5E4F70` | `--text-disabled` | Disabled elements |

### Inactive State Colors

| Purpose | Hex Code | CSS Variable | Usage |
| --- | --- | --- | --- |
| Inactive Text | `#9A8AAD` | `--inactive-text` | Unselected tabs, inactive items |
| Inactive Border | `#4A3D5C` | `--inactive-border` | Borders on inactive elements |
| Inactive Background | `rgba(90, 70, 110, 0.3)` | `--inactive-bg` | Background for disabled buttons |

**Why Solid Colors?** The sunset gradient background means opacity-based text colors become invisible or washed out. Solid lavender-purple tones maintain visibility across all background areas while fitting the synthwave aesthetic.

### Background Colors

| Purpose | Value | CSS Variable |
| --- | --- | --- |
| Primary | `#0a0014` | `--bg-primary` |
| Secondary | `rgba(10, 0, 20, 0.85)` | `--bg-secondary` |
| Tertiary | `rgba(15, 5, 30, 0.7)` | `--bg-tertiary` |
| Card | `rgba(10, 0, 20, 0.92)` | `--bg-card` |
| Elevated | `rgba(5, 0, 15, 0.95)` | `--bg-elevated` |

### Semantic Colors

| Purpose | Variable | Value |
| --- | --- | --- |
| Long/Up | `--color-long` | `#FFBE0B` (Warm Yellow) |
| Short/Down | `--color-short` | `#FF006E` (Hot Pink) |

### Color Applications

**Logo:**
- "up" = Warm Yellow (`#FFBE0B`) with neon glow
- "dn" = Hot Pink (`#FF006E`) with neon glow
- ".trade" = White (`#FFFFFF`)

**Buttons:**
- Primary CTA: Animated gradient (Yellow → Orange → Pink)
- Outline: Orange border with dark background
- Neon: Cyan border with cyan glow
- Hover: Lift effect + increased shadow + racing stripe

**Backgrounds:**
- Main: Vertical sunset gradient with scanlines overlay
- Cards/Panels: Dark gradient with blur + neon border accents

---

## Typography

### Font Families

**Primary (Headings & Display):** Rajdhani
- Weights: 300, 400, 500, 600, 700
- CSS Variable: `--font-display`, `--font-rajdhani`
- Usage: Headlines, taglines, buttons, labels, navigation
- Characteristics: Geometric, slightly condensed, modern racing aesthetic
- **Letter Spacing:** Use `--tracking-tight` for large text, `--tracking-normal` for medium

**Secondary (Body Text):** Inter
- Weights: 400, 500, 600, 700
- CSS Variable: `--font-body`, `--font-inter`
- Usage: Body text, descriptions, form inputs
- Characteristics: Clean, readable, neutral
- **Letter Spacing:** Use `--tracking-wide` (0.025em) for improved readability

**Tertiary (Code & Numbers):** Space Mono
- Weights: 400, 700
- CSS Variable: `--font-code`, `--font-space-mono`
- Usage: Prices, balances, technical data, timestamps
- Characteristics: Monospace, retro-tech feel
- **Letter Spacing:** Use `-0.02em` (tighter than normal for monospace)

### Typography Scale

| Size Name | Value | CSS Variable | Usage |
| --- | --- | --- | --- |
| 2XS | 11px (0.6875rem) | `--text-2xs` | Minimum readable - badges, tiny labels |
| XS | 12px (0.75rem) | `--text-xs` | Small labels, captions |
| SM | 13px (0.8125rem) | `--text-sm` | Body small, secondary text |
| Base | 15px (0.9375rem) | `--text-base` | Default body text |
| LG | 17px (1.0625rem) | `--text-lg` | Emphasis, larger body |
| XL | 20px (1.25rem) | `--text-xl` | Subheadings |
| 2XL | 24px (1.5rem) | `--text-2xl` | Section headings |
| 3XL | 32px (2rem) | `--text-3xl` | Display, hero text |

### Letter Spacing Scale

| Name | Value | CSS Variable | Usage |
| --- | --- | --- | --- |
| Tighter | -0.025em | `--tracking-tighter` | Large display text only |
| Tight | -0.01em | `--tracking-tight` | Headings |
| Normal | 0em | `--tracking-normal` | Default |
| Wide | 0.025em | `--tracking-wide` | Body text (recommended) |
| Wider | 0.05em | `--tracking-wider` | Buttons, labels |
| Widest | 0.1em | `--tracking-widest` | Uppercase text, badges |

### Font Weight Guidelines

| Context | Weight | Notes |
| --- | --- | --- |
| Body text | 500 (medium) | Slightly heavier for better contrast |
| Labels | 600 (semibold) | Clear hierarchy |
| Buttons | 600-700 | Bold and scannable |
| Headings | 700 (bold) | Strong presence |
| Small text (<12px) | 600+ | Compensate for small size |
| Uppercase text | 600+ | Compensate for perceived thinness |

### Line Height

| Name | Value | CSS Variable | Usage |
| --- | --- | --- | --- |
| None | 1 | `--leading-none` | Single-line display text |
| Tight | 1.2 | `--leading-tight` | Headings |
| Snug | 1.35 | `--leading-snug` | Subheadings, short text |
| Normal | 1.5 | `--leading-normal` | Body text (default) |
| Relaxed | 1.625 | `--leading-relaxed` | Long-form content |

### Font Loading (Next.js)

```typescript
import { Rajdhani, Space_Mono, Inter } from "next/font/google";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});
```

---

## Visual Elements

### Background Elements

**Sunset Gradient Sky (Enhanced)**

```css
background: 
  /* Scanlines overlay for retro CRT effect */
  repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  ),
  /* Neon glow spots */
  radial-gradient(ellipse 120% 60% at 50% 0%, rgba(131, 56, 236, 0.25) 0%, transparent 50%),
  radial-gradient(ellipse 80% 50% at 20% 100%, rgba(255, 0, 110, 0.3) 0%, transparent 45%),
  radial-gradient(ellipse 80% 50% at 80% 100%, rgba(255, 107, 53, 0.25) 0%, transparent 45%),
  /* Main sunset gradient */
  linear-gradient(180deg, 
    #0a0014 0%,
    #3A0CA3 15%,
    #8338EC 35%,
    #FF006E 55%,
    #FF6B35 75%,
    #FFBE0B 100%
  );
```

**Horizon Grid (Enhanced)**

- Position: Fixed, bottom 55% of viewport
- Grid: Cyan primary lines (`#00F5FF`) + Pink secondary lines
- Background sizes: 60px primary, 120px secondary
- Transform: `perspective(400px) rotateX(70deg)` for deeper 3D effect
- Animation: Scrolling toward viewer (2s loop)
- Mask: Gradient fade to transparent at top
- Purpose: Classic retrofuturism depth cue

```css
.horizon-grid {
  background-image: 
    linear-gradient(rgba(0, 245, 255, 0.4) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 245, 255, 0.3) 1px, transparent 1px),
    linear-gradient(rgba(255, 0, 110, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 0, 110, 0.15) 1px, transparent 1px);
  background-size: 60px 60px, 60px 60px, 120px 120px, 120px 120px;
  transform: perspective(400px) rotateX(70deg);
  mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%);
}
```

**Sun Disc (Enhanced with OutRun Bands)**

- Size: 220px diameter
- Position: Fixed, bottom 18%, centered
- Features: Horizontal bands (classic OutRun style)
- Gradient: White center → Yellow → Orange → Pink → Purple edge
- Glow: Multi-layered box-shadows
- Animation: Subtle pulsing (6s loop, scale 1.0 to 1.05)
- Reflection: Vertical gradient line below sun

```css
.sun {
  background: 
    /* Sun bands - classic OutRun style */
    repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 8px,
      rgba(0, 0, 0, 0.3) 8px,
      rgba(0, 0, 0, 0.3) 10px
    ),
    radial-gradient(circle, 
      #FFFFFF 0%,
      #FFBE0B 20%,
      #FF6B35 50%,
      #FF006E 80%,
      #8338EC 100%
    );
  box-shadow: 
    0 0 60px rgba(255, 190, 11, 0.8),
    0 0 120px rgba(255, 190, 11, 0.5),
    0 0 180px rgba(255, 107, 53, 0.4),
    0 0 240px rgba(255, 0, 110, 0.3),
    0 0 300px rgba(131, 56, 236, 0.2);
}
```

**Floating Particles**

- 9 particles positioned across viewport
- Colors: Rotating through palette (yellow, orange, pink, purple)
- Animation: Float upward with rotation (12-17s staggered)
- Size: 4px diameter with matching glow

### Racing Line Visualization

The racing line is the **signature interactive element** that represents the live trading chart.

**Specifications:**

```css
.racing-line {
  height: 4px;
  background: linear-gradient(90deg, 
    var(--warm-yellow) 0%, 
    var(--sunset-orange) 25%, 
    var(--hot-pink) 50%, 
    var(--electric-purple) 75%, 
    var(--warm-yellow) 100%
  );
  background-size: 200% 100%;
  border-radius: 9999px;
  box-shadow: 
    0 0 10px rgba(255, 107, 53, 0.5),
    0 0 20px rgba(255, 107, 53, 0.3);
  animation: racingLineGradient 3s linear infinite;
}
```

---

## Glass Morphism

### Standard Glass

```css
.glass {
  background: linear-gradient(135deg, rgba(10, 0, 20, 0.9) 0%, rgba(20, 5, 35, 0.85) 100%);
  backdrop-filter: blur(24px) saturate(1.2);
  border: 1px solid rgba(255, 107, 53, 0.25);
  border-top-color: rgba(255, 190, 11, 0.3);
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 60px rgba(255, 0, 110, 0.08);
}
```

### Dark Glass

```css
.glass-dark {
  background: linear-gradient(180deg, rgba(5, 0, 15, 0.95) 0%, rgba(15, 0, 30, 0.92) 100%);
  backdrop-filter: blur(32px) saturate(1.3);
  border: 1px solid rgba(255, 107, 53, 0.2);
  box-shadow: 
    0 8px 40px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}
```

### Animated Glass

```css
.glass-animated {
  animation: neonBorderPulse 4s ease-in-out infinite;
}

@keyframes neonBorderPulse {
  0%, 100% { border-color: rgba(255, 107, 53, 0.3); }
  50% { border-color: rgba(255, 0, 110, 0.4); }
}
```

---

## Button Styles

### Primary Button (CTA)

```css
.btn-primary {
  font-family: var(--font-display);
  background: linear-gradient(135deg, var(--warm-yellow) 0%, var(--sunset-orange) 50%, var(--hot-pink) 100%);
  background-size: 200% 100%;
  color: #1a0a2e;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 
    0 4px 20px rgba(255, 107, 53, 0.5),
    0 0 0 1px rgba(255, 190, 11, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: gradientFlow 3s ease-in-out infinite;
}

.btn-primary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 6px 30px rgba(255, 107, 53, 0.7),
    0 0 40px rgba(255, 0, 110, 0.3);
}
```

### Outline Button

```css
.btn-outline {
  background: rgba(10, 0, 20, 0.8);
  color: var(--white);
  border: 2px solid rgba(255, 107, 53, 0.4);
  backdrop-filter: blur(8px);
}

.btn-outline:hover {
  border-color: var(--sunset-orange);
  background: rgba(255, 107, 53, 0.1);
  box-shadow: 0 0 30px rgba(255, 107, 53, 0.2);
}
```

### Neon Button

```css
.btn-neon {
  background: transparent;
  color: var(--cyan-glow);
  border: 2px solid var(--cyan-glow);
  box-shadow: 
    0 0 10px rgba(0, 245, 255, 0.3),
    inset 0 0 10px rgba(0, 245, 255, 0.1);
}

.btn-neon:hover {
  background: rgba(0, 245, 255, 0.1);
  box-shadow: 
    0 0 20px rgba(0, 245, 255, 0.5),
    0 0 40px rgba(0, 245, 255, 0.3);
}
```

### Disabled/Inactive Button

**Important:** Use solid colors, not opacity, for disabled states. Opacity-based states become invisible on gradient backgrounds.

```css
.btn:disabled,
.btn-disabled {
  background: var(--inactive-bg);           /* rgba(90, 70, 110, 0.3) */
  color: var(--inactive-text);              /* #9A8AAD */
  border-color: var(--inactive-border);     /* #4A3D5C */
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 1;  /* Never use opacity for disabled - use solid colors */
}
```

### Ghost Button (Inactive Tab/Option)

```css
.btn-ghost {
  background: transparent;
  color: var(--inactive-text);
  border: 1px solid transparent;
}

.btn-ghost:hover {
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
}

.btn-ghost.active {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.08);
}
```

### Racing Stripe Effect (All Buttons)

```css
.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn:hover::before {
  left: 100%;
}
```

---

## Neon Text Effects

```css
.neon-glow-orange {
  text-shadow: 
    0 0 5px rgba(255, 107, 53, 0.9),
    0 0 10px rgba(255, 107, 53, 0.7),
    0 0 20px rgba(255, 107, 53, 0.5),
    0 0 40px rgba(255, 107, 53, 0.3);
}

.neon-glow-yellow {
  text-shadow: 
    0 0 5px rgba(255, 190, 11, 0.9),
    0 0 10px rgba(255, 190, 11, 0.7),
    0 0 20px rgba(255, 190, 11, 0.5),
    0 0 40px rgba(255, 190, 11, 0.3);
}

.neon-glow-pink {
  text-shadow: 
    0 0 5px rgba(255, 0, 110, 0.9),
    0 0 10px rgba(255, 0, 110, 0.7),
    0 0 20px rgba(255, 0, 110, 0.5),
    0 0 40px rgba(255, 0, 110, 0.3);
}

.neon-glow-cyan {
  text-shadow: 
    0 0 5px rgba(0, 245, 255, 0.9),
    0 0 10px rgba(0, 245, 255, 0.7),
    0 0 20px rgba(0, 245, 255, 0.5),
    0 0 40px rgba(0, 245, 255, 0.3);
}
```

---

## Component Specifications

### Header

**Structure:**
```
[Racing Line Accent]
[Logo: updn.trade] ---- [Points Badge] [Connect Wallet]
```

**Features:**
- Racing line accent at top (2px animated gradient)
- Logo with Rajdhani font and neon glows
- "Mainnet Live" indicator with cyan pulsing dot
- Glass morphism background

### Price Ticker

**Features:**
- Glass dark styling with scanlines overlay
- Coin icons with neon border on selection
- Price change badges with neon glow
- Racing line indicator for selected coin
- Horizontal scroll on mobile

### Trading Panel

**Features:**
- Gradient header with racing line accent
- Direction toggle (Long/Short) with neon underlines
- Amount presets with Rajdhani font
- Leverage slider with neon accents
- Position summary with card styling
- Action buttons with Miami synthwave gradients

### Mobile Navigation

**Features:**
- Glass dark background
- Neon top border accent
- Each tab has unique neon color:
  - Perps: Yellow
  - Spot: Cyan
  - Positions: Orange
  - Activity: Purple
  - Account: Pink
- Active indicator with colored glow and dot

### Footer

**Features:**
- Glass dark background
- Pink neon top border accent
- Status indicators with matching glows
- Connection mode display

---

## Animation Guidelines

### Timing Functions

- **Ease-out** for entrances: `ease-out`
- **Ease-in-out** for loops: `ease-in-out`
- **Linear** for continuous motion: `linear`

### Key Animations

| Animation | Duration | Description |
| --- | --- | --- |
| `backgroundShift` | 20s | Subtle hue rotation on body |
| `gridMove` | 2s | Horizon grid scrolling |
| `sunPulse` | 6s | Sun scale breathing |
| `gradientFlow` | 3s | Button gradient movement |
| `neonBorderPulse` | 4s | Glass border color cycle |
| `livePulse` | 1.5s | Live indicator pulse |
| `floatParticle` | 12-17s | Particle float animation |
| `racingLineGradient` | 3s | Racing line gradient flow |

---

## Utility Classes

### Layout
- `.glass` - Standard glass morphism
- `.glass-dark` - Darker glass variant
- `.glass-animated` - Animated border pulse
- `.panel-bg` - Panel background gradient
- `.panel-bg-dark` - Darker panel variant

### Text Effects
- `.neon-glow-orange` - Orange text glow
- `.neon-glow-yellow` - Yellow text glow
- `.neon-glow-pink` - Pink text glow
- `.neon-glow-cyan` - Cyan text glow
- `.font-display` - Rajdhani font
- `.chrome-text` - Metallic gradient text
- `.gradient-text-sunset` - Sunset gradient text

### Text State Classes
- `.text-muted` - Muted text (`#8B7A9E`) for placeholders
- `.text-inactive` - Inactive text (`#9A8AAD`) for unselected items
- `.text-disabled` - Disabled text (`#5E4F70`) for disabled controls
- `.state-active` - Active state styling
- `.state-inactive` - Inactive state styling
- `.state-disabled` - Disabled state (also blocks pointer events)

### Typography Utilities
- `.label` - Uppercase label style (Rajdhani, 12px, wide tracking)
- `.label-sm` - Small label style (11px)
- `.value` - Value display (Space Mono, tabular nums)
- `.value-lg` - Large value (20px)
- `.value-sm` - Small value (13px)
- `.heading-1/.heading-2/.heading-3` - Heading hierarchy

### Effects
- `.racing-line` - Animated gradient line
- `.neon-underline` - Neon underline on element
- `.miami-hover` - Lift and glow on hover
- `.live-pulse` - Pulsing animation
- `.crt-glow` - CRT screen inner glow
- `.scanlines` - Scanlines overlay
- `.speed-lines-effect` - Horizontal speed lines

### Borders
- `.neon-border` - Orange neon border
- `.neon-border-yellow` - Yellow neon border
- `.neon-border-pink` - Pink neon border
- `.border-gradient-miami` - Gradient border

---

## Responsive Breakpoints

### Mobile (< 768px)

**Changes:**
- Font sizes increased for readability
- Buttons: Full width, stacked
- Navigation: Bottom tab bar with neon accents
- Panels: Single column layout
- Sun: 180px diameter
- Grid: Reduced opacity

### Desktop (≥ 768px)

**Changes:**
- Three-column layout (Left panel, Chart, Trading panel)
- Full header with all elements
- Bottom panel for positions/orders
- Footer visible

---

## Brand Voice & Messaging

### Tone

- **Energetic** - Fast-paced, exciting
- **Confident** - Bold claims, no hedging
- **Accessible** - Simple language, no jargon
- **Playful** - Racing metaphors, gaming vibes
- **Crypto-Native** - Speaks the language of degens

### Key Messages

**Primary:** "Trade Like You're Racing"

**Supporting:**
- "The chart moves. You react."
- "Up to 1000x leverage"
- "Deposit $5 and feel the rush"
- "Race the Market"

---

## Implementation Status

### ✅ Completed (v2.0)

| Component | Status | Notes |
| --- | --- | --- |
| Typography | ✅ | Rajdhani + Inter + Space Mono |
| Color System | ✅ | Full palette with CSS variables |
| Background Effects | ✅ | Sunset gradient, grid, sun, particles |
| Glass Morphism | ✅ | Standard, dark, animated variants |
| Button Styles | ✅ | Primary, outline, neon with racing stripe |
| Header | ✅ | Logo with neon glows, racing line accent |
| Price Ticker | ✅ | Scanlines, neon badges, racing line indicator |
| Trading Panel | ✅ | Miami gradients, improved buttons |
| Mobile Navigation | ✅ | Unique colors per tab, neon indicators |
| Footer | ✅ | Neon accent, status glows |
| Neon Text Effects | ✅ | Full palette of text shadows |
| Utility Classes | ✅ | Comprehensive set of helpers |

---

## Future Improvement Plan

### Phase 1: Polish (Priority: High)

| Task | Description | Effort |
| --- | --- | --- |
| Position Cards | Add neon accents to position/order cards | Small |
| Chart Styling | Style TradingView/chart with synthwave theme | Medium |
| Modal Styling | Update all modals with glass + neon borders | Medium |
| Loading States | Synthwave-themed skeleton loaders | Small |
| Toast Notifications | Neon-styled success/error toasts | Small |

### Phase 2: Animation (Priority: Medium)

| Task | Description | Effort |
| --- | --- | --- |
| Page Transitions | Fade in up with staggered delays | Small |
| Button Ripples | Neon ripple effect on click | Medium |
| Price Flash | Neon flash on price updates | Small |
| Trade Confirmation | Celebratory animation on trade | Medium |
| Racing Car | Animated car along trading line | Large |

### Phase 3: Advanced Features (Priority: Low)

| Task | Description | Effort |
| --- | --- | --- |
| Sound Effects | Optional trading sounds (toggleable) | Medium |
| Theme Toggle | Night racing variant (cooler tones) | Large |
| Custom Cursor | Crosshair or racing-themed cursor | Small |
| Particle Burst | Particles on significant events | Medium |
| Leaderboard Flames | Animated flames for top traders | Medium |

### Phase 4: Mobile Excellence (Priority: High)

| Task | Description | Effort |
| --- | --- | --- |
| Haptic Feedback | Vibration on trades (if supported) | Small |
| Swipe Gestures | Swipe between chart views | Medium |
| Pull to Refresh | With racing line animation | Small |
| Touch Effects | Larger touch targets with neon feedback | Medium |

### Phase 5: Performance (Priority: Medium)

| Task | Description | Effort |
| --- | --- | --- |
| Animation Optimization | Use `will-change` hints | Small |
| Reduced Motion | Respect `prefers-reduced-motion` | Small |
| Lazy Loading | Load background effects progressively | Medium |
| GPU Acceleration | Optimize transforms for GPU | Medium |

---

## Design Tokens Reference

### Spacing

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### Transitions

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Shadows

```css
--shadow-glow-orange: 0 0 20px rgba(255, 107, 53, 0.4), 0 0 40px rgba(255, 107, 53, 0.2);
--shadow-glow-yellow: 0 0 15px rgba(255, 190, 11, 0.4);
--shadow-glow-pink: 0 0 15px rgba(255, 0, 110, 0.4);
--shadow-glow-cyan: 0 0 20px rgba(0, 245, 255, 0.3);
--shadow-elevated: 0 4px 20px rgba(0, 0, 0, 0.6);
--shadow-card: 0 8px 32px rgba(0, 0, 0, 0.5);
```

---

## Quick Reference

**Primary Gradient:**
```css
linear-gradient(180deg, #0a0014 0%, #3A0CA3 15%, #8338EC 35%, #FF006E 55%, #FF6B35 75%, #FFBE0B 100%)
```

**Logo Colors:**
- up: `#FFBE0B` with `neon-glow-yellow`
- dn: `#FF006E` with `neon-glow-pink`
- .trade: `#FFFFFF`

**Button Gradient:**
```css
linear-gradient(135deg, #FFBE0B 0%, #FF6B35 50%, #FF006E 100%)
```

**Racing Line Gradient:**
```css
linear-gradient(90deg, #FFBE0B 0%, #FF6B35 25%, #FF006E 50%, #8338EC 75%, #FFBE0B 100%)
```

**Glass Background:**
```css
linear-gradient(135deg, rgba(10, 0, 20, 0.9) 0%, rgba(20, 5, 35, 0.85) 100%)
```

---

*Document Version: 2.0*

*Last Updated: December 30, 2024*

*Design System for updn.trade - Miami Synthwave Aesthetic*
