# Speed Trad

A gamified Solana trading platform with perpetual and spot trading capabilities. Built with Next.js 16 and featuring a premium dark theme inspired by Euphoria aesthetics.

## Features

### Trading
- **Perpetuals Trading** - Leveraged trading up to 1000x
- **Spot Trading** - Direct token swaps
- **Interactive Price Charts** - Candlestick and line charts with real-time updates
- **Token Selector** - Quick token switching with keyboard shortcut (Cmd/Ctrl + K)
- **Position Management** - Track open positions, PnL, entry/liquidation prices

### Wallet Integration
- **Multi-wallet Support** - Phantom, Solflare, Coinbase Wallet, Torus, Ledger
- **Real-time Balance** - Live SOL balance from blockchain with WebSocket updates
- **Network Support** - Mainnet and Devnet with Solscan explorer integration

### Gamification
- **Points System** - Earn points from trading activity
- **Tier Rankings** - Bronze, Silver, Gold, Platinum, Diamond, Legendary
- **Leaderboards** - Rankings by 24h, 7d, 30d, and all-time performance
- **Quests** - Daily, weekly, and milestone challenges
- **Referral Program** - Earn commission from referred traders

### User Experience
- **Responsive Design** - Optimized for desktop and mobile
- **Custom Profiles** - Usernames and avatar selection
- **Skeleton Loaders** - Smooth loading states
- **Premium Dark Theme** - Euphoria-inspired UI with neon accents

## Tech Stack

- **Framework**: Next.js 16.1.0 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **Charts**: Lightweight Charts
- **Icons**: Lucide React
- **Performance**: TanStack Virtual for virtualized lists

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- Yarn or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Aliyanishere/speed-trad.git
cd speed-trad

# Install dependencies
yarn install

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file:

```env
# Set to "true" for mainnet, omit or "false" for devnet
NEXT_PUBLIC_IS_PRODUCTION=false

# Optional: Custom RPC endpoint
NEXT_PUBLIC_RPC_ENDPOINT=your_rpc_url
```

## Scripts

```bash
yarn dev      # Start development server
yarn build    # Build for production
yarn start    # Start production server
yarn lint     # Run ESLint
```

## Project Structure

```
app/
├── components/
│   ├── avatars/      # Avatar display components
│   ├── layout/       # Header, Footer, Navigation
│   ├── mobile/       # Mobile-specific views
│   ├── rewards/      # Points and rewards UI
│   ├── trading/      # Trading interface
│   ├── ui/           # Reusable components
│   └── wallet/       # Wallet connection
├── config/           # Network configuration
├── hooks/            # Custom React hooks
├── providers/        # Context providers
├── utils/            # Utility functions
├── globals.css       # Theme and styles
├── layout.tsx        # Root layout
└── page.tsx          # Main trading page
```

## Custom Hooks

- `useWalletBalance` - Fetches real SOL balance with auto-refresh
- `usePositions` - Manages trading positions state
- `useUserProfile` - User profile with localStorage persistence
- `useRewards` - Points, quests, and tier management
- `useTokenSelector` - Token selection with keyboard shortcuts

## Supported Wallets

- Phantom
- Solflare
- Coinbase Wallet
- Torus
- Ledger

## License

Private - All rights reserved
