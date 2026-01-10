import confetti from "canvas-confetti";

/**
 * Professional confetti effect for winning trades
 * Triggers a celebratory but tasteful confetti animation
 */
export function triggerWinConfetti() {
  const duration = 3000; // 3 seconds
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: NodeJS.Timeout = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Launch confetti from multiple points for a more professional effect
    // Left side
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#00FF66", "#00F5A0", "#FFD700", "#FFFFFF"],
    });

    // Right side
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#00FF66", "#00F5A0", "#FFD700", "#FFFFFF"],
    });

    // Center burst (less frequent)
    if (Math.random() > 0.7) {
      confetti({
        ...defaults,
        particleCount: particleCount * 0.5,
        origin: { x: 0.5, y: 0.5 },
        colors: ["#00FF66", "#00F5A0", "#FFD700"],
        angle: randomInRange(55, 125),
      });
    }
  }, 250);
}

/**
 * Enhanced confetti for big wins (100%+ profit)
 */
export function triggerBigWinConfetti() {
  const duration = 4000; // 4 seconds
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 40, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: NodeJS.Timeout = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 80 * (timeLeft / duration);

    // More intense confetti from all sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#00FF66", "#00F5A0", "#FFD700", "#FFFFFF", "#FF6B9D"],
    });

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#00FF66", "#00F5A0", "#FFD700", "#FFFFFF", "#FF6B9D"],
    });

    // Center bursts more frequently
    if (Math.random() > 0.5) {
      confetti({
        ...defaults,
        particleCount: particleCount * 0.8,
        origin: { x: 0.5, y: 0.5 },
        colors: ["#00FF66", "#00F5A0", "#FFD700"],
        angle: randomInRange(55, 125),
      });
    }
  }, 200);

  // Initial burst
  confetti({
    ...defaults,
    particleCount: 100,
    origin: { x: 0.5, y: 0.5 },
    colors: ["#00FF66", "#00F5A0", "#FFD700"],
    angle: 90,
    spread: 70,
  });
}

