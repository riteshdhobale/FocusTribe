// ─── Supabase Database Types ───────────────────────────────────────
// Auto-generated types for Supabase tables.
// In production, run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;                     // UUID, references auth.users(id)
          name: string;
          age: number;
          gender: "male" | "female" | "non-binary";
          city: string;
          college: string;
          year: string;
          exam_focus: string[];           // text[]
          career_goal: string;
          bio: string;
          study_style: "visual" | "audio" | "reading" | "hands-on";
          intent: string;                 // "study-partner" | "accountability" | etc.
          study_formats: string[];        // text[]
          interests: string[];            // text[]
          availability: string;
          looking_for_prompt: string;
          avatar_color: string;
          avatar_emoji: string;
          is_online: boolean;
          hours_studied: number;
          streak: number;
          group_pref: "1v1" | "small-group" | "any";
          gender_pref: "male" | "female" | "any";
          student_email: string | null;
          is_verified: boolean;
          is_pro: boolean;
          photo_urls: string[];           // text[] — Supabase Storage URLs
          created_at: string;
          updated_at: string;
          last_seen: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at" | "last_seen"> & {
          created_at?: string;
          updated_at?: string;
          last_seen?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      matches: {
        Row: {
          id: string;                     // UUID
          profile_a: string;              // UUID, references profiles(id)
          profile_b: string;              // UUID, references profiles(id)
          status: "pending" | "matched" | "study-date" | "completed" | "unmatched";
          created_at: string;
          updated_at: string;
          last_message: string | null;
          unread_a: number;               // unread count for profile_a
          unread_b: number;               // unread count for profile_b
        };
        Insert: Omit<Database["public"]["Tables"]["matches"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["matches"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;                     // UUID
          match_id: string;              // UUID, references matches(id)
          sender_id: string;             // UUID, references profiles(id)
          text: string;
          is_filtered: boolean;           // true if content was blocked
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at" | "is_filtered"> & {
          id?: string;
          created_at?: string;
          is_filtered?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      swipe_history: {
        Row: {
          id: string;                     // UUID
          swiper_id: string;             // who swiped
          swiped_id: string;             // who was swiped on
          action: "like" | "pass" | "super-like";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["swipe_history"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["swipe_history"]["Insert"]>;
      };
      study_sessions: {
        Row: {
          id: string;                     // UUID
          match_id: string;              // UUID, references matches(id)
          started_by: string;            // UUID
          duration_minutes: number;
          pomodoros_completed: number;
          tasks_completed: number;
          created_at: string;
          ended_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["study_sessions"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["study_sessions"]["Insert"]>;
      };
      contact_unlocks: {
        Row: {
          id: string;
          match_id: string;
          level: number;                  // 1 = IG, 2 = phone, 3 = full
          unlocked_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contact_unlocks"]["Row"], "id" | "unlocked_at"> & {
          id?: string;
          unlocked_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_unlocks"]["Insert"]>;
      };
    };
    Functions: {
      get_filtered_deck: {
        Args: {
          user_id: string;
          age_min?: number;
          age_max?: number;
          gender_filter?: string;
          exam_filter?: string[];
          city_filter?: string[];
          college_filter?: string[];
        };
        Returns: Database["public"]["Tables"]["profiles"]["Row"][];
      };
    };
  };
};
