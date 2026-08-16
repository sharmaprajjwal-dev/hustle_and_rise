export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      email_job_requests: {
        Row: {
          email_hash: string;
          error_code: string | null;
          id: string;
          ip_hash: string;
          job_id: string;
          provider_message_id: string | null;
          requested_at: string;
          sent_at: string | null;
          status: string;
        };
        Insert: {
          email_hash: string;
          error_code?: string | null;
          id?: string;
          ip_hash: string;
          job_id: string;
          provider_message_id?: string | null;
          requested_at?: string;
          sent_at?: string | null;
          status?: string;
        };
        Update: {
          email_hash?: string;
          error_code?: string | null;
          id?: string;
          ip_hash?: string;
          job_id?: string;
          provider_message_id?: string | null;
          requested_at?: string;
          sent_at?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "email_job_requests_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      job_import_runs: {
        Row: {
          created_at: string;
          error_message: string | null;
          finished_at: string | null;
          id: string;
          jobs_deactivated: number;
          jobs_inserted: number;
          jobs_received: number;
          jobs_updated: number;
          source: string;
          started_at: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          finished_at?: string | null;
          id?: string;
          jobs_deactivated?: number;
          jobs_inserted?: number;
          jobs_received?: number;
          jobs_updated?: number;
          source: string;
          started_at?: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          finished_at?: string | null;
          id?: string;
          jobs_deactivated?: number;
          jobs_inserted?: number;
          jobs_received?: number;
          jobs_updated?: number;
          source?: string;
          started_at?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_import_runs_source_fkey";
            columns: ["source"];
            isOneToOne: false;
            referencedRelation: "job_sources";
            referencedColumns: ["key"];
          },
        ];
      };
      job_sources: {
        Row: {
          active: boolean;
          api_name: string | null;
          attribution_text: string | null;
          base_url: string | null;
          created_at: string;
          id: string;
          key: string;
          last_sync_at: string | null;
          name: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          api_name?: string | null;
          attribution_text?: string | null;
          base_url?: string | null;
          created_at?: string;
          id?: string;
          key: string;
          last_sync_at?: string | null;
          name: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          api_name?: string | null;
          attribution_text?: string | null;
          base_url?: string | null;
          created_at?: string;
          id?: string;
          key?: string;
          last_sync_at?: string | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          apply_url: string;
          category: string | null;
          city: string | null;
          company: string | null;
          company_logo_url: string | null;
          country: string | null;
          created_at: string;
          description: string | null;
          description_html: string | null;
          expires_at: string | null;
          external_job_id: string;
          first_seen_at: string;
          id: string;
          is_active: boolean;
          job_type: string | null;
          last_seen_at: string;
          location: string | null;
          published_at: string | null;
          remote_type: string | null;
          salary_currency: string | null;
          salary_max: number | null;
          salary_min: number | null;
          salary_period: string | null;
          slug: string | null;
          source: string;
          source_url: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          apply_url: string;
          category?: string | null;
          city?: string | null;
          company?: string | null;
          company_logo_url?: string | null;
          country?: string | null;
          created_at?: string;
          description?: string | null;
          description_html?: string | null;
          expires_at?: string | null;
          external_job_id: string;
          first_seen_at?: string;
          id?: string;
          is_active?: boolean;
          job_type?: string | null;
          last_seen_at?: string;
          location?: string | null;
          published_at?: string | null;
          remote_type?: string | null;
          salary_currency?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          salary_period?: string | null;
          slug?: string | null;
          source: string;
          source_url?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          apply_url?: string;
          category?: string | null;
          city?: string | null;
          company?: string | null;
          company_logo_url?: string | null;
          country?: string | null;
          created_at?: string;
          description?: string | null;
          description_html?: string | null;
          expires_at?: string | null;
          external_job_id?: string;
          first_seen_at?: string;
          id?: string;
          is_active?: boolean;
          job_type?: string | null;
          last_seen_at?: string;
          location?: string | null;
          published_at?: string | null;
          remote_type?: string | null;
          salary_currency?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          salary_period?: string | null;
          slug?: string | null;
          source?: string;
          source_url?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_source_fkey";
            columns: ["source"];
            isOneToOne: false;
            referencedRelation: "job_sources";
            referencedColumns: ["key"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
export type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];
export type JobSource = Database["public"]["Tables"]["job_sources"]["Row"];
export type JobImportRun = Database["public"]["Tables"]["job_import_runs"]["Row"];
export type EmailJobRequest = Database["public"]["Tables"]["email_job_requests"]["Row"];
