"use client";

import { memo } from "react";

// Avatar component props
interface AvatarIconProps {
  avatarId: string;
  size?: number;
  className?: string;
}

// Pepe Avatar
const PepeAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#4A7C4E" />
    <ellipse cx="22" cy="26" rx="8" ry="10" fill="#6B9E6F" />
    <ellipse cx="42" cy="26" rx="8" ry="10" fill="#6B9E6F" />
    <circle cx="22" cy="26" r="4" fill="#1A1A1A" />
    <circle cx="42" cy="26" r="4" fill="#1A1A1A" />
    <circle cx="24" cy="24" r="1.5" fill="#FFF" />
    <circle cx="44" cy="24" r="1.5" fill="#FFF" />
    <path d="M20 42 Q32 50 44 42" stroke="#2D5A30" strokeWidth="3" fill="none" strokeLinecap="round" />
    <ellipse cx="14" cy="36" rx="4" ry="3" fill="#FF9999" opacity="0.5" />
    <ellipse cx="50" cy="36" rx="4" ry="3" fill="#FF9999" opacity="0.5" />
  </svg>
);

// Rocket Avatar
const RocketAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#1E1E3F" />
    <path d="M32 12 L40 36 H24 Z" fill="#E8E8E8" />
    <ellipse cx="32" cy="36" rx="8" ry="12" fill="#E8E8E8" />
    <circle cx="32" cy="32" r="4" fill="#00D4FF" />
    <path d="M24 40 L20 50 L28 44 Z" fill="#FF6B35" />
    <path d="M40 40 L44 50 L36 44 Z" fill="#FF6B35" />
    <path d="M28 48 L32 58 L36 48 Z" fill="#FFB800" />
    <path d="M30 52 L32 58 L34 52 Z" fill="#FF6B35" />
    <circle cx="18" cy="20" r="2" fill="#FFD700" />
    <circle cx="48" cy="44" r="1.5" fill="#FFD700" />
    <circle cx="12" cy="40" r="1" fill="#FFF" />
  </svg>
);

// Diamond Avatar
const DiamondAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#1A1A2E" />
    <path d="M32 14 L48 28 L32 54 L16 28 Z" fill="url(#diamondGrad)" />
    <path d="M32 14 L48 28 L32 28 Z" fill="#B8E6FF" />
    <path d="M32 14 L16 28 L32 28 Z" fill="#7DD3FC" />
    <path d="M32 28 L48 28 L32 54 Z" fill="#38BDF8" />
    <path d="M32 28 L16 28 L32 54 Z" fill="#0EA5E9" />
    <path d="M16 28 L32 14 L48 28" stroke="#E0F2FE" strokeWidth="1" fill="none" />
    <defs>
      <linearGradient id="diamondGrad" x1="16" y1="14" x2="48" y2="54">
        <stop offset="0%" stopColor="#7DD3FC" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
    </defs>
  </svg>
);

// Fire Avatar
const FireAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#1A0A00" />
    <path d="M32 8 Q44 20 44 32 Q44 48 32 56 Q20 48 20 32 Q20 20 32 8" fill="#FF6B00" />
    <path d="M32 16 Q40 24 40 32 Q40 44 32 50 Q24 44 24 32 Q24 24 32 16" fill="#FF9500" />
    <path d="M32 24 Q36 28 36 34 Q36 42 32 46 Q28 42 28 34 Q28 28 32 24" fill="#FFD700" />
    <path d="M32 32 Q34 34 34 38 Q34 42 32 44 Q30 42 30 38 Q30 34 32 32" fill="#FFF5CC" />
  </svg>
);

// Skull Avatar
const SkullAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#1A1A1A" />
    <ellipse cx="32" cy="30" rx="18" ry="20" fill="#F5F5F5" />
    <ellipse cx="24" cy="28" rx="5" ry="7" fill="#1A1A1A" />
    <ellipse cx="40" cy="28" rx="5" ry="7" fill="#1A1A1A" />
    <path d="M32 34 L30 42 L34 42 Z" fill="#1A1A1A" />
    <path d="M24 48 L24 54" stroke="#F5F5F5" strokeWidth="3" strokeLinecap="round" />
    <path d="M32 48 L32 54" stroke="#F5F5F5" strokeWidth="3" strokeLinecap="round" />
    <path d="M40 48 L40 54" stroke="#F5F5F5" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Money Face Avatar
const MoneyAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#FFD700" />
    <circle cx="32" cy="32" r="26" fill="#FFEB3B" />
    <text x="18" y="32" fontSize="14" fill="#2E7D32" fontWeight="bold">$</text>
    <text x="38" y="32" fontSize="14" fill="#2E7D32" fontWeight="bold">$</text>
    <path d="M24 42 Q32 48 40 42" stroke="#2E7D32" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M28 20 Q32 16 36 20" stroke="#8B4513" strokeWidth="2" fill="none" />
    <ellipse cx="16" cy="32" rx="3" ry="4" fill="#FF9999" opacity="0.6" />
    <ellipse cx="48" cy="32" rx="3" ry="4" fill="#FF9999" opacity="0.6" />
  </svg>
);

// Gorilla/Ape Avatar
const GorillaAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#2D2D2D" />
    <ellipse cx="32" cy="34" rx="20" ry="18" fill="#4A4A4A" />
    <circle cx="14" cy="30" r="6" fill="#4A4A4A" />
    <circle cx="50" cy="30" r="6" fill="#4A4A4A" />
    <ellipse cx="32" cy="38" rx="12" ry="10" fill="#8B7355" />
    <ellipse cx="26" cy="28" rx="4" ry="5" fill="#1A1A1A" />
    <ellipse cx="38" cy="28" rx="4" ry="5" fill="#1A1A1A" />
    <circle cx="27" cy="27" r="1.5" fill="#FFF" />
    <circle cx="39" cy="27" r="1.5" fill="#FFF" />
    <ellipse cx="28" cy="40" rx="2" ry="3" fill="#5A4A3A" />
    <ellipse cx="36" cy="40" rx="2" ry="3" fill="#5A4A3A" />
    <path d="M28 48 Q32 52 36 48" stroke="#5A4A3A" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

// Alien Avatar
const AlienAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#0A0A2E" />
    <ellipse cx="32" cy="34" rx="18" ry="22" fill="#90EE90" />
    <ellipse cx="22" cy="28" rx="8" ry="12" fill="#1A1A1A" />
    <ellipse cx="42" cy="28" rx="8" ry="12" fill="#1A1A1A" />
    <ellipse cx="22" cy="28" rx="4" ry="6" fill="#00FF00" />
    <ellipse cx="42" cy="28" rx="4" ry="6" fill="#00FF00" />
    <ellipse cx="32" cy="48" rx="4" ry="2" fill="#6B8E6B" />
  </svg>
);

// Robot Avatar
const RobotAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#1E3A5F" />
    <rect x="16" y="20" width="32" height="32" rx="4" fill="#C0C0C0" />
    <rect x="20" y="24" width="10" height="8" rx="1" fill="#00FFFF" />
    <rect x="34" y="24" width="10" height="8" rx="1" fill="#00FFFF" />
    <rect x="26" y="38" width="12" height="4" rx="1" fill="#4A4A4A" />
    <rect x="28" y="38" width="2" height="4" fill="#00FFFF" />
    <rect x="32" y="38" width="2" height="4" fill="#00FFFF" />
    <rect x="36" y="38" width="2" height="4" fill="#00FFFF" />
    <circle cx="32" cy="12" r="4" fill="#FF0000" />
    <rect x="30" y="14" width="4" height="6" fill="#808080" />
    <rect x="12" y="30" width="4" height="12" rx="2" fill="#808080" />
    <rect x="48" y="30" width="4" height="12" rx="2" fill="#808080" />
  </svg>
);

// Ghost Avatar
const GhostAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#1A1A2E" />
    <path d="M18 54 L18 28 Q18 12 32 12 Q46 12 46 28 L46 54 L40 48 L34 54 L28 48 L22 54 L18 50 Z" fill="#F5F5F5" />
    <ellipse cx="26" cy="28" rx="4" ry="6" fill="#1A1A1A" />
    <ellipse cx="38" cy="28" rx="4" ry="6" fill="#1A1A1A" />
    <ellipse cx="32" cy="38" rx="4" ry="3" fill="#FFB6C1" />
  </svg>
);

// Clown Avatar
const ClownAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#FFE4B5" />
    <circle cx="32" cy="32" r="26" fill="#FFDAB9" />
    <circle cx="32" cy="34" r="8" fill="#FF0000" />
    <circle cx="20" cy="28" r="6" fill="#FFF" />
    <circle cx="44" cy="28" r="6" fill="#FFF" />
    <circle cx="20" cy="28" r="3" fill="#1A1A1A" />
    <circle cx="44" cy="28" r="3" fill="#1A1A1A" />
    <path d="M24 44 Q32 52 40 44" stroke="#FF0000" strokeWidth="4" fill="none" strokeLinecap="round" />
    <ellipse cx="14" cy="32" rx="4" ry="5" fill="#FF69B4" />
    <ellipse cx="50" cy="32" rx="4" ry="5" fill="#FF69B4" />
    <path d="M16 10 Q32 0 48 10" stroke="#00FF00" strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M20 8 Q32 2 44 8" stroke="#FFFF00" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

// Devil Avatar
const DevilAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#2D0A0A" />
    <circle cx="32" cy="34" r="20" fill="#9B2335" />
    <path d="M14 20 L20 30 L16 34 Z" fill="#9B2335" />
    <path d="M50 20 L44 30 L48 34 Z" fill="#9B2335" />
    <ellipse cx="24" cy="30" rx="4" ry="5" fill="#1A1A1A" />
    <ellipse cx="40" cy="30" rx="4" ry="5" fill="#1A1A1A" />
    <circle cx="25" cy="29" r="1.5" fill="#FF6B6B" />
    <circle cx="41" cy="29" r="1.5" fill="#FF6B6B" />
    <path d="M24 44 Q32 50 40 44" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M20 18 L22 12 L26 16" stroke="#FFD700" strokeWidth="2" fill="none" />
    <path d="M44 18 L42 12 L38 16" stroke="#FFD700" strokeWidth="2" fill="none" />
  </svg>
);

// Nerd Avatar
const NerdAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#FFE4B5" />
    <circle cx="32" cy="34" r="22" fill="#FFDAB9" />
    <rect x="14" y="24" width="16" height="12" rx="2" stroke="#1A1A1A" strokeWidth="2" fill="none" />
    <rect x="34" y="24" width="16" height="12" rx="2" stroke="#1A1A1A" strokeWidth="2" fill="none" />
    <line x1="30" y1="30" x2="34" y2="30" stroke="#1A1A1A" strokeWidth="2" />
    <circle cx="22" cy="30" r="3" fill="#1A1A1A" />
    <circle cx="42" cy="30" r="3" fill="#1A1A1A" />
    <circle cx="23" cy="29" r="1" fill="#FFF" />
    <circle cx="43" cy="29" r="1" fill="#FFF" />
    <path d="M28 44 L36 44" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
    <rect x="18" y="10" width="28" height="14" fill="#8B4513" />
    <rect x="20" y="14" width="24" height="10" fill="#A0522D" />
  </svg>
);

// Cool Avatar
const CoolAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#FFE4B5" />
    <circle cx="32" cy="34" r="22" fill="#FFDAB9" />
    <path d="M12 28 L20 24 L32 28 L44 24 L52 28 L52 32 L44 30 L32 34 L20 30 L12 32 Z" fill="#1A1A1A" />
    <path d="M24 44 Q32 50 40 44" stroke="#FF6B6B" strokeWidth="3" fill="none" strokeLinecap="round" />
    <rect x="16" y="8" width="32" height="16" rx="2" fill="#FFD700" />
    <rect x="18" y="10" width="28" height="12" fill="#FFA500" />
  </svg>
);

// Brain Avatar
const BrainAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#1A1A2E" />
    <ellipse cx="32" cy="32" rx="20" ry="22" fill="#FFB6C1" />
    <path d="M20 24 Q16 28 20 32 Q16 36 20 40" stroke="#FF69B4" strokeWidth="2" fill="none" />
    <path d="M28 20 Q24 24 28 28 Q24 32 28 36 Q24 40 28 44" stroke="#FF69B4" strokeWidth="2" fill="none" />
    <path d="M36 20 Q40 24 36 28 Q40 32 36 36 Q40 40 36 44" stroke="#FF69B4" strokeWidth="2" fill="none" />
    <path d="M44 24 Q48 28 44 32 Q48 36 44 40" stroke="#FF69B4" strokeWidth="2" fill="none" />
    <circle cx="26" cy="30" r="2" fill="#FF1493" />
    <circle cx="38" cy="30" r="2" fill="#FF1493" />
    <ellipse cx="32" cy="38" rx="4" ry="2" fill="#FF1493" opacity="0.5" />
  </svg>
);

// Unicorn Avatar
const UnicornAvatar = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill="#FFE4E1" />
    <ellipse cx="32" cy="38" rx="18" ry="16" fill="#FFF" />
    <polygon points="32,4 28,24 36,24" fill="url(#unicornHorn)" />
    <ellipse cx="24" cy="34" rx="4" ry="5" fill="#1A1A1A" />
    <ellipse cx="40" cy="34" rx="4" ry="5" fill="#1A1A1A" />
    <circle cx="25" cy="33" r="1.5" fill="#FFF" />
    <circle cx="41" cy="33" r="1.5" fill="#FFF" />
    <ellipse cx="18" cy="38" rx="4" ry="3" fill="#FFB6C1" />
    <ellipse cx="46" cy="38" rx="4" ry="3" fill="#FFB6C1" />
    <path d="M28 46 Q32 50 36 46" stroke="#FF69B4" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M14 20 Q8 28 14 36" stroke="#FF69B4" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M50 20 Q56 28 50 36" stroke="#9370DB" strokeWidth="4" fill="none" strokeLinecap="round" />
    <defs>
      <linearGradient id="unicornHorn" x1="32" y1="4" x2="32" y2="24">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FF69B4" />
        <stop offset="100%" stopColor="#9370DB" />
      </linearGradient>
    </defs>
  </svg>
);

// Avatar mapping
const AVATAR_COMPONENTS: Record<string, React.FC<{ size: number }>> = {
  pepe: PepeAvatar,
  rocket: RocketAvatar,
  diamond: DiamondAvatar,
  fire: FireAvatar,
  skull: SkullAvatar,
  money: MoneyAvatar,
  gorilla: GorillaAvatar,
  alien: AlienAvatar,
  robot: RobotAvatar,
  ghost: GhostAvatar,
  clown: ClownAvatar,
  devil: DevilAvatar,
  nerd: NerdAvatar,
  cool: CoolAvatar,
  brain: BrainAvatar,
  unicorn: UnicornAvatar,
};

// Avatar data for selection UI
export const AVATAR_OPTIONS = [
  { id: "pepe", label: "Pepe" },
  { id: "rocket", label: "To The Moon" },
  { id: "diamond", label: "Diamond Hands" },
  { id: "fire", label: "On Fire" },
  { id: "skull", label: "Rekt" },
  { id: "money", label: "Money Face" },
  { id: "gorilla", label: "Ape" },
  { id: "alien", label: "Alien" },
  { id: "robot", label: "Bot" },
  { id: "ghost", label: "Ghost" },
  { id: "clown", label: "Clown" },
  { id: "devil", label: "Degen" },
  { id: "nerd", label: "Nerd" },
  { id: "cool", label: "Cool" },
  { id: "brain", label: "Galaxy Brain" },
  { id: "unicorn", label: "Unicorn" },
];

// Main AvatarIcon component
function AvatarIconComponent({ avatarId, size = 40, className = "" }: AvatarIconProps) {
  const AvatarComponent = AVATAR_COMPONENTS[avatarId] || AVATAR_COMPONENTS.pepe;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <AvatarComponent size={size} />
    </div>
  );
}

export const AvatarIcon = memo(AvatarIconComponent);
export default AvatarIcon;
