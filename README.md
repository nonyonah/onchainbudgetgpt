# OnchainBudgetGPT 🤖💰

An AI-powered financial dashboard that combines traditional banking data with Web3 onchain analytics to provide comprehensive financial insights and budgeting assistance.

## 🌟 Features

### 🤖 AI-Powered Financial Assistant
- **Intelligent Chat Interface**: Conversational AI that understands your complete financial picture
- **Contextual Analysis**: AI has access to both traditional banking and blockchain data for comprehensive insights
- **Smart Recommendations**: Personalized budgeting advice and financial planning suggestions

### 🏦 Traditional Banking Integration
- **Mono Connect Integration**: Secure connection to traditional bank accounts
- **Transaction Analysis**: Automatic categorization and analysis of spending patterns
- **Account Aggregation**: View all your bank accounts in one unified dashboard

### ⛓️ Web3 & Onchain Analytics
- **Coinbase OnchainKit Integration**: Real-time token balances and portfolio tracking
- **Multi-Chain Support**: Ethereum, Base, Optimism, Arbitrum, and Polygon networks
- **ENS Resolution**: Ethereum Name Service profile integration
- **DeFi Portfolio Tracking**: Comprehensive view of your onchain assets

### 📊 Advanced Data Visualization
- **Interactive Charts**: Built with Recharts for responsive, beautiful visualizations
- **Spending Analysis**: Category breakdowns, trend analysis, and monthly comparisons
- **Portfolio Performance**: Token allocation, performance tracking, and asset distribution
- **Real-time Updates**: Live data synchronization across all connected accounts

### 🔒 Security & Privacy
- **Secure Authentication**: Industry-standard security practices
- **Data Encryption**: All sensitive data is encrypted and securely stored
- **Privacy First**: Your financial data never leaves your control

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **AI Integration**: Google Gemini AI for intelligent financial analysis
- **Banking**: Mono Connect API for traditional banking data
- **Web3**: Coinbase OnchainKit for blockchain integration
- **Charts**: Recharts for data visualization
- **Database**: Supabase for secure data storage
- **Deployment**: Vercel-ready configuration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Mono Connect API credentials
- Coinbase Developer Platform API key
- Google AI Studio API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nonyonah/onchainbudgetgpt.git
   cd onchainbudgetgpt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Mono Connect API
   MONO_SECRET_KEY=your_mono_secret_key
   NEXT_PUBLIC_MONO_PUBLIC_KEY=your_mono_public_key

   # Coinbase OnchainKit
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_coinbase_api_key

   # Google AI (Gemini)
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. **Database Setup**
   ```bash
   # Run the Supabase schema
   npx supabase db reset
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Connecting Your Accounts
1. **Bank Accounts**: Use the "Connect Bank" button to securely link your traditional bank accounts via Mono Connect
2. **Crypto Wallets**: Connect your Web3 wallet to automatically import token balances and transaction history
3. **AI Chat**: Start chatting with the AI assistant for personalized financial insights

### Dashboard Features
- **Overview**: Get a bird's-eye view of your complete financial picture
- **Spending Analysis**: Dive deep into your spending patterns with interactive charts
- **Portfolio Tracking**: Monitor your crypto investments and DeFi positions
- **Chat Interface**: Ask questions and get AI-powered financial advice

## 🔧 API Endpoints

### Banking APIs
- `GET /api/mono/accounts` - Fetch connected bank accounts
- `GET /api/mono/accounts/[id]/transactions` - Get account transactions

### Onchain APIs
- `GET /api/onchain/balance/[address]` - Get native token balance
- `GET /api/onchain/token-balance/[address]` - Get ERC-20 token balances
- `GET /api/onchain/ens/[address]` - Resolve ENS profile

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Mono](https://mono.co) for banking infrastructure
- [Coinbase](https://www.coinbase.com/developer-platform) for Web3 tools
- [Google AI](https://ai.google.dev) for AI capabilities
- [Supabase](https://supabase.com) for backend infrastructure

## 📞 Support

If you have any questions or need help getting started, please open an issue or reach out to the maintainers.

---

**Built with ❤️ for the future of personal finance**
