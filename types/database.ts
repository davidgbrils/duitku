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
          receipt_image_url: string | null;
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
          receipt_image_url?: string | null;
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
          receipt_image_url?: string | null;
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
      debts: {
        Row: {
          id: string;
          user_id: string;
          lender_name: string;
          amount: number;
          remaining_amount: number;
          due_date: string | null;
          status: "unpaid" | "partially_paid" | "paid";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lender_name: string;
          amount: number;
          remaining_amount: number;
          due_date?: string | null;
          status: "unpaid" | "partially_paid" | "paid";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lender_name?: string;
          amount?: number;
          remaining_amount?: number;
          due_date?: string | null;
          status?: "unpaid" | "partially_paid" | "paid";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      debt_payments: {
        Row: {
          id: string;
          user_id: string;
          debt_id: string;
          wallet_id: string;
          amount: number;
          payment_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          debt_id: string;
          wallet_id: string;
          amount: number;
          payment_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          debt_id?: string;
          wallet_id?: string;
          amount?: number;
          payment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      receivables: {
        Row: {
          id: string;
          user_id: string;
          borrower_name: string;
          amount: number;
          remaining_amount: number;
          due_date: string | null;
          status: "unpaid" | "partially_paid" | "paid";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          borrower_name: string;
          amount: number;
          remaining_amount: number;
          due_date?: string | null;
          status: "unpaid" | "partially_paid" | "paid";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          borrower_name?: string;
          amount?: number;
          remaining_amount?: number;
          due_date?: string | null;
          status?: "unpaid" | "partially_paid" | "paid";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      receivable_payments: {
        Row: {
          id: string;
          user_id: string;
          receivable_id: string;
          wallet_id: string;
          amount: number;
          payment_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          receivable_id: string;
          wallet_id: string;
          amount: number;
          payment_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          receivable_id?: string;
          wallet_id?: string;
          amount?: number;
          payment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount_limit: number;
          month_year: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount_limit: number;
          month_year: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          amount_limit?: number;
          month_year?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      split_bills: {
        Row: {
          id: string;
          user_id: string;
          transaction_id: string;
          split_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_id: string;
          split_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          transaction_id?: string;
          split_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "split_bills_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: true;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
        ];
      };
      split_bill_members: {
        Row: {
          id: string;
          split_bill_id: string;
          member_name: string;
          amount: number;
          is_settled: boolean;
          receivable_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          split_bill_id: string;
          member_name: string;
          amount: number;
          is_settled?: boolean;
          receivable_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          split_bill_id?: string;
          member_name?: string;
          amount?: number;
          is_settled?: boolean;
          receivable_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "split_bill_members_split_bill_id_fkey";
            columns: ["split_bill_id"];
            isOneToOne: false;
            referencedRelation: "split_bills";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "split_bill_members_receivable_id_fkey";
            columns: ["receivable_id"];
            isOneToOne: false;
            referencedRelation: "receivables";
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
          p_receipt_image_url?: string | null;
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
          p_receipt_image_url?: string | null;
        };
        Returns: undefined;
      };
      create_split_bill: {
        Args: {
          p_transaction_id: string;
          p_members: Record<string, unknown>[];
          p_create_receivables?: boolean;
          p_notes?: string | null;
        };
        Returns: string;
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
      pay_debt: {
        Args: {
          p_debt_id: string;
          p_wallet_id: string;
          p_amount: number;
          p_payment_date: string;
          p_notes?: string | null;
        };
        Returns: undefined;
      };
      pay_receivable: {
        Args: {
          p_receivable_id: string;
          p_wallet_id: string;
          p_amount: number;
          p_payment_date: string;
          p_notes?: string | null;
        };
        Returns: undefined;
      };
      adjust_wallet_balance: {
        Args: {
          p_wallet_id: string;
          p_new_balance: number;
          p_notes?: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
