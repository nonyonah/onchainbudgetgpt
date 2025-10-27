export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_sessions: {
        Row: {
          id: string
          wallet_address: string
          session_data: Json
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          session_data: Json
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          session_data?: Json
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          message_type: 'user' | 'assistant'
          content: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          message_type: 'user' | 'assistant'
          content: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          message_type?: 'user' | 'assistant'
          content?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      transaction_summaries: {
        Row: {
          id: string
          session_id: string
          transaction_hash: string | null
          transaction_type: 'onchain' | 'offchain'
          amount: number
          currency: string
          category: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          transaction_hash?: string | null
          transaction_type: 'onchain' | 'offchain'
          amount: number
          currency: string
          category?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          transaction_hash?: string | null
          transaction_type?: 'onchain' | 'offchain'
          amount?: number
          currency?: string
          category?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_summaries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      analytics_events: {
        Row: {
          id: string
          session_id: string
          event_type: string
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          event_type: string
          event_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          event_type?: string
          event_data?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type UserSession = Database['public']['Tables']['user_sessions']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type TransactionSummary = Database['public']['Tables']['transaction_summaries']['Row']
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row']

export type InsertUserSession = Database['public']['Tables']['user_sessions']['Insert']
export type InsertChatMessage = Database['public']['Tables']['chat_messages']['Insert']
export type InsertTransactionSummary = Database['public']['Tables']['transaction_summaries']['Insert']
export type InsertAnalyticsEvent = Database['public']['Tables']['analytics_events']['Insert']