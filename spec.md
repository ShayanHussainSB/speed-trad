# Speed Gauge Specification

## Overview
The **Speed Gauge** is a signature visual component for the Speed platform. It reflects the "intensity" or "velocity" of the current market (SOL/USDC) by measuring price volatility and momentum in real-time. It should feel like a high-performance supercar dashboard, providing immediate visceral feedback on market activity.

## 1. Visual Design & Aesthetics
*   **Form Factor**: Semi-circular or 270-degree arc gauge (Speedometer style).
*   **Theme**: Cyberpunk / High-Performance (Glassmorphism, Neon Glow).
*   **Needle**: A sharp, glowing needle with a "light trail" effect.
*   **Dial Zones**:
    *   **0-30% (Chill)**: Subtle blue/cyan glow.
    *   **30-70% (Cruising)**: Vibrant electric purple/blue.
    *   **70-90% (Overdrive)**: Blazing amber/orange.
    *   **90-100% (NITRO)**: Pulsing neon red with screen-shake/blur effects on the gauge itself.
*   **Center Display**: Digital readout of the current "Speed" (calculated in BPS/sec or Ticks/sec).

## 2. Technical Requirements

### Data Mapping
The gauge should consume the live price stream.
*   **Primary Metric**: `MarketVelocity`
*   **Formua**: `abs(Price_t - Price_t-1) / Price_t-1 * 10000` (BPS change per tick).
*   **Smoothing**: A windowed average of the last 5-10 ticks to prevent the needle from flickering too wildly, while maintaining responsiveness.

### Animation Logic
*   **Needle Physics**: Use a "Spring" animation (e.g., `framer-motion` or `react-spring`) with high stiffness and moderate damping to simulate mechanical inertia.
*   **Glow Intensity**: The brightness of the gauge's outer glow should be tied to the needle's position (higher speed = higher intensity).
*   **Nitrous Effect**: When velocity exceeds the 90th percentile, trigger a "Turbo" animation (subtle CSS chromatic aberration or a motion blur filter on the needle).

### Component Structure
```tsx
<SpeedGauge 
  value={currentVelocity} 
  min={0} 
  max={100} 
  unit="BPS"
  status="NITRO" | "NORMAL"
/>
```

## 3. Interaction
*   **Hover**: On hover, show a tooltip explaining the current calculation (e.g., "Market Volatility over last 5 seconds").
*   **Contextual Feedback**: If the user has an open position, the gauge could subtly shift hue (Greener if pnl is positive, Redder if negative) while still maintaining the speed arc.

## 4. Performance Goals
*   **Refresh Rate**: 60fps (RequestAnimationFrame).
*   **CPU Usage**: Minimal; use SVG for the arc and needle, using CSS transforms for rotation to leverage GPU acceleration.
*   **Latency**: Zero perceived lag between price ticker updates and needle movement.

## 5. Implementation Roadmap
1.  **Draft 1**: Basic SVG Arc + Needle.
2.  **Draft 2**: Integration with `useLivePrice` hook.
3.  **Draft 3**: Add "NITRO" state and advanced glow shaders.
4.  **Draft 4**: Refinement of smoothing algorithms.
