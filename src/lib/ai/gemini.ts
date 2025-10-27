import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '@/lib/config';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// System prompt for OnchainBudget GPT
const SYSTEM_PROMPT = `You are OnchainBudget GPT, an AI financial assistant that helps users manage and understand their finances across onchain (crypto) and offchain (traditional banking) platforms.

Your personality:
- Smart, casual, and slightly witty (like Grok AI)
- Warm and conversational with a touch of humor
- Concise but informative responses
- Use emojis sparingly but effectively
- Be helpful and encouraging about financial wellness

Your capabilities:
- Analyze crypto wallet transactions and balances
- Categorize spending across DeFi, NFTs, transfers, swaps, etc.
- Connect traditional bank accounts for comprehensive financial view
- Provide spending insights, trends, and budgeting advice
- Generate charts and visualizations for financial data
- Answer questions about crypto markets, DeFi protocols, and financial planning

Guidelines:
- Keep responses conversational and engaging
- Provide actionable financial insights
- Suggest specific actions when appropriate
- Be encouraging about financial goals
- Explain crypto concepts in simple terms
- Always prioritize user financial security and privacy

When users ask about their finances, you can:
1. Analyze their transaction history
2. Categorize their spending
3. Provide budget recommendations
4. Explain market trends
5. Suggest optimization strategies
6. Generate helpful charts and summaries

Remember: You're here to make financial management fun, insightful, and accessible!`;

export interface GeminiResponse {
  content: string;
  actions?: Array<{
    id: string;
    label: string;
    type: 'primary' | 'secondary' | 'outline';
  }>;
  chartData?: any;
  metadata?: any;
}

export class GeminiAI {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });
  }

  async generateResponse(
    userMessage: string,
    context?: {
      walletData?: any;
      bankData?: any;
      transactionHistory?: any[];
      userPreferences?: any;
      sessionHistory?: string[];
    }
  ): Promise<GeminiResponse> {
    try {
      // Build context-aware prompt
      let prompt = userMessage;

      if (context) {
        const contextInfo = [];

        if (context.walletData) {
          contextInfo.push(`Wallet Info: ${JSON.stringify(context.walletData, null, 2)}`);
        }

        if (context.bankData) {
          contextInfo.push(`Bank Info: ${JSON.stringify(context.bankData, null, 2)}`);
        }

        if (context.transactionHistory && context.transactionHistory.length > 0) {
          contextInfo.push(`Recent Transactions: ${JSON.stringify(context.transactionHistory.slice(0, 10), null, 2)}`);
        }

        if (context.sessionHistory && context.sessionHistory.length > 0) {
          contextInfo.push(`Previous conversation: ${context.sessionHistory.slice(-5).join('\n')}`);
        }

        if (contextInfo.length > 0) {
          prompt = `Context:\n${contextInfo.join('\n\n')}\n\nUser Question: ${userMessage}`;
        }
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Parse response for actions and metadata
      const parsedResponse = this.parseResponse(content, userMessage);

      return parsedResponse;
    } catch (error) {
      console.error('Gemini AI Error:', error);
      return {
        content: "I'm having trouble processing your request right now. Could you try asking again? 🤔",
      };
    }
  }

  private parseResponse(content: string, userMessage: string): GeminiResponse {
    // Determine if we should suggest actions based on the user's message
    const actions = this.suggestActions(userMessage, content);

    return {
      content,
      actions: actions.length > 0 ? actions : undefined,
    };
  }

  private suggestActions(userMessage: string, response: string): Array<{
    id: string;
    label: string;
    type: 'primary' | 'secondary' | 'outline';
  }> {
    const message = userMessage.toLowerCase();
    const actions = [];

    // Suggest wallet connection if not connected
    if (message.includes('wallet') || message.includes('crypto') || message.includes('balance')) {
      actions.push({
        id: 'connect-wallet',
        label: 'Connect Wallet',
        type: 'primary' as const,
      });
    }

    // Suggest bank connection for spending analysis
    if (message.includes('spending') || message.includes('budget') || message.includes('bank')) {
      actions.push({
        id: 'connect-bank',
        label: 'Connect Bank',
        type: 'secondary' as const,
      });
    }

    // Suggest portfolio view for investment questions
    if (message.includes('portfolio') || message.includes('investment') || message.includes('holdings')) {
      actions.push({
        id: 'view-portfolio',
        label: 'View Portfolio',
        type: 'secondary' as const,
      });
    }

    // Suggest charts for data visualization requests
    if (message.includes('chart') || message.includes('graph') || message.includes('breakdown') || message.includes('analysis')) {
      actions.push({
        id: 'generate-chart',
        label: 'Generate Chart',
        type: 'outline' as const,
      });
    }

    return actions;
  }

  async categorizeTransactions(transactions: any[]): Promise<any[]> {
    try {
      const prompt = `Analyze and categorize these financial transactions. For each transaction, provide:
1. Category (e.g., "Food & Dining", "Gas Fees", "DeFi", "NFT", "Transfer", "Shopping", etc.)
2. Subcategory if applicable
3. Brief description
4. Risk level (low/medium/high) for crypto transactions

Transactions:
${JSON.stringify(transactions, null, 2)}

Return the analysis in JSON format with the same structure but added categorization fields.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Try to parse JSON response
      try {
        return JSON.parse(content);
      } catch {
        // If JSON parsing fails, return original transactions with basic categorization
        return transactions.map(tx => ({
          ...tx,
          category: 'Uncategorized',
          subcategory: null,
          description: tx.description || 'Transaction',
          riskLevel: 'low',
        }));
      }
    } catch (error) {
      console.error('Transaction categorization error:', error);
      return transactions;
    }
  }

  async generateSpendingInsights(data: {
    transactions: any[];
    timeframe: string;
    totalSpent: number;
    categories: Record<string, number>;
  }): Promise<string> {
    try {
      const prompt = `Generate spending insights for this financial data:

Timeframe: ${data.timeframe}
Total Spent: $${data.totalSpent}
Categories: ${JSON.stringify(data.categories, null, 2)}
Transaction Count: ${data.transactions.length}

Provide:
1. Key spending patterns
2. Largest expense categories
3. Potential savings opportunities
4. Budget recommendations
5. Trends and observations

Keep it conversational, insightful, and encouraging. Use emojis sparingly.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Spending insights error:', error);
      return "I couldn't generate spending insights right now, but your financial data looks interesting! Try connecting your accounts for better analysis.";
    }
  }
}

// Export singleton instance
export const geminiAI = new GeminiAI();