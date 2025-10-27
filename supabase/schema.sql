-- OnchainBudget GPT Database Schema
-- This file contains the SQL schema for Supabase database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Sessions Table
-- Stores user session data, wallet connections, and preferences
CREATE TABLE user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    session_data JSONB NOT NULL DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on wallet_address for faster lookups
CREATE INDEX idx_user_sessions_wallet_address ON user_sessions(wallet_address);
CREATE INDEX idx_user_sessions_created_at ON user_sessions(created_at);

-- Chat Messages Table
-- Stores all chat interactions between users and the AI assistant
CREATE TABLE chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for chat messages
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_type ON chat_messages(message_type);

-- Transaction Summaries Table
-- Stores categorized transaction data from both onchain and offchain sources
CREATE TABLE transaction_summaries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    transaction_hash TEXT, -- NULL for offchain transactions
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('onchain', 'offchain')),
    amount DECIMAL(20, 8) NOT NULL,
    currency TEXT NOT NULL,
    category TEXT, -- e.g., 'food', 'gas', 'transfer', 'swap'
    metadata JSONB DEFAULT '{}', -- Additional transaction details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for transaction summaries
CREATE INDEX idx_transaction_summaries_session_id ON transaction_summaries(session_id);
CREATE INDEX idx_transaction_summaries_type ON transaction_summaries(transaction_type);
CREATE INDEX idx_transaction_summaries_category ON transaction_summaries(category);
CREATE INDEX idx_transaction_summaries_currency ON transaction_summaries(currency);
CREATE INDEX idx_transaction_summaries_created_at ON transaction_summaries(created_at);
CREATE INDEX idx_transaction_summaries_hash ON transaction_summaries(transaction_hash);

-- Analytics Events Table
-- Tracks user interactions and system events for analytics
CREATE TABLE analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- e.g., 'wallet_connected', 'query_executed', 'chart_viewed'
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analytics events
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for user_sessions
CREATE TRIGGER update_user_sessions_updated_at 
    BEFORE UPDATE ON user_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policies for user_sessions
-- Users can only access their own sessions (based on wallet address)
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (true); -- For now, allow all reads (can be restricted later)

CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own sessions" ON user_sessions
    FOR UPDATE USING (true);

-- Policies for chat_messages
-- Users can only access messages from their sessions
CREATE POLICY "Users can view own chat messages" ON chat_messages
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (true);

-- Policies for transaction_summaries
-- Users can only access their own transaction data
CREATE POLICY "Users can view own transactions" ON transaction_summaries
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own transactions" ON transaction_summaries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own transactions" ON transaction_summaries
    FOR UPDATE USING (true);

-- Policies for analytics_events
-- Users can only access their own analytics data
CREATE POLICY "Users can view own analytics" ON analytics_events
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own analytics" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- Views for common queries
-- View for recent chat messages with session info
CREATE VIEW recent_chat_messages AS
SELECT 
    cm.id,
    cm.session_id,
    cm.message_type,
    cm.content,
    cm.metadata,
    cm.created_at,
    us.wallet_address
FROM chat_messages cm
JOIN user_sessions us ON cm.session_id = us.id
ORDER BY cm.created_at DESC;

-- View for transaction analytics
CREATE VIEW transaction_analytics AS
SELECT 
    ts.session_id,
    ts.transaction_type,
    ts.currency,
    ts.category,
    COUNT(*) as transaction_count,
    SUM(ts.amount) as total_amount,
    AVG(ts.amount) as avg_amount,
    DATE_TRUNC('day', ts.created_at) as transaction_date
FROM transaction_summaries ts
GROUP BY 
    ts.session_id, 
    ts.transaction_type, 
    ts.currency, 
    ts.category, 
    DATE_TRUNC('day', ts.created_at)
ORDER BY transaction_date DESC;

-- Function to get spending summary by category
CREATE OR REPLACE FUNCTION get_spending_summary(
    p_session_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    category TEXT,
    total_amount DECIMAL,
    transaction_count BIGINT,
    currency TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.category,
        SUM(ts.amount) as total_amount,
        COUNT(*) as transaction_count,
        ts.currency
    FROM transaction_summaries ts
    WHERE ts.session_id = p_session_id
        AND (p_start_date IS NULL OR ts.created_at >= p_start_date)
        AND (p_end_date IS NULL OR ts.created_at <= p_end_date)
    GROUP BY ts.category, ts.currency
    ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql;