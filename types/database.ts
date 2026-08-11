/**
 * Duitku — Database types (hand-written, sinkron dengan
 * supabase/migrations/0001_init.sql).
 *
 * Dapat diganti dengan hasil `supabase gen types typescript`
 * ketika Supabase project tersedia.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "income" | "expense";
          icon: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: "income" | "expense";
          icon?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: "income" | "expense";
          icon?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: "cash" | "bank" | "ewallet" | "other";
          currency: string;
          initial_balance: number;
          current_balance: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: "cash" | "bank" | "ewallet" | "other";
          currency?: string;
          initial_balance?: number;
          current_balance?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: "cash" | "bank" | "ewallet" | "other";
          currency?: string;
          initial_balance?: number;
          current_balance?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          wallet_id: string;
          category_id: string | null;
          type: "income" | "expense";
          amount: number;
          description: string | null;
          transaction_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_id: string;
          category_id?: string | null;
          type: "income" | "expense";
          amount: number;
          description?: string | null;
          transaction_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallet_id?: string;
          category_id?: string | null;
          type?: "income" | "expense";
          amount?: number;
          description?: string | null;
          transaction_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      transfers: {
        Row: {
          id: string;
          user_id: string;
          source_wallet_id: string;
          destination_wallet_id: string;
          amount: number;
          description: string | null;
          transfer_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_wallet_id: string;
          destination_wallet_id: string;
          amount: number;
          description?: string | null;
          transfer_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_wallet_id?: string;
          destination_wallet_id?: string;
          amount?: number;
          description?: string | null;
          transfer_date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transfers_source_wallet_id_fkey";
            columns: ["source_wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transfers_destination_wallet_id_fkey";
            columns: ["destination_wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_wallet: {
        Args: {
          p_name: string;
          p_type: "cash" | "bank" | "ewallet" | "other";
          p_currency: string;
          p_initial_balance: number;
        };
        Returns: string;
      };
      update_wallet: {
        Args: {
          p_wallet_id: string;
          p_name: string;
          p_type: "cash" | "bank" | "ewallet" | "other";
          p_currency: string;
          p_is_active: boolean;
        };
        Returns: undefined;
      };
      delete_wallet: {
        Args: { p_wallet_id: string };
        Returns: undefined;
      };
      create_transaction: {
        Args: {
          p_type: "income" | "expense";
          p_wallet_id: string;
          p_category_id: string | null;
          p_amount: number;
          p_description?: string | null;
          p_transaction_date?: string | null;
        };
        Returns: string;
      };
      update_transaction: {
        Args: {
          p_tx_id: string;
          p_type: "income" | "expense";
          p_wallet_id: string;
          p_category_id: string | null;
          p_amount: number;
          p_description?: string | null;
          p_transaction_date?: string | null;
        };
        Returns: undefined;
      };
      delete_transaction: {
        Args: { p_tx_id: string };
        Returns: undefined;
      };
      create_transfer: {
        Args: {
          p_source_wallet_id: string;
          p_destination_wallet_id: string;
          p_amount: number;
          p_description?: string | null;
          p_transfer_date?: string | null;
        };
        Returns: string;
      };
      update_transfer: {
        Args: {
          p_transfer_id: string;
          p_source_wallet_id: string;
          p_destination_wallet_id: string;
          p_amount: number;
          p_description?: string | null;
          p_transfer_date?: string | null;
        };
        Returns: undefined;
      };
      delete_transfer: {
        Args: { p_transfer_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
