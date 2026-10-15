export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      academic_years: {
        Row: {
          ends_on: string;
          id: string;
          school_id: string;
          starts_on: string;
          year: number;
        };
        Insert: {
          ends_on: string;
          id?: string;
          school_id: string;
          starts_on: string;
          year: number;
        };
        Update: {
          ends_on?: string;
          id?: string;
          school_id?: string;
          starts_on?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'academic_years_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
        ];
      };
      class_subjects: {
        Row: {
          class_id: string;
          curriculum_offering_id: string;
          grade_code: string;
          id: string;
          school_id: string;
        };
        Insert: {
          class_id: string;
          curriculum_offering_id: string;
          grade_code: string;
          id?: string;
          school_id: string;
        };
        Update: {
          class_id?: string;
          curriculum_offering_id?: string;
          grade_code?: string;
          id?: string;
          school_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'class_subjects_curriculum_offering_id_grade_code_fkey';
            columns: ['curriculum_offering_id', 'grade_code'];
            isOneToOne: false;
            referencedRelation: 'curriculum_offerings';
            referencedColumns: ['id', 'grade_code'];
          },
          {
            foreignKeyName: 'class_subjects_school_id_class_id_grade_code_fkey';
            columns: ['school_id', 'class_id', 'grade_code'];
            isOneToOne: false;
            referencedRelation: 'classes';
            referencedColumns: ['school_id', 'id', 'grade_code'];
          },
          {
            foreignKeyName: 'class_subjects_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
        ];
      };
      classes: {
        Row: {
          academic_year_id: string;
          created_at: string;
          grade_code: string;
          id: string;
          name: string;
          school_id: string;
          status: string;
        };
        Insert: {
          academic_year_id: string;
          created_at?: string;
          grade_code: string;
          id?: string;
          name: string;
          school_id: string;
          status?: string;
        };
        Update: {
          academic_year_id?: string;
          created_at?: string;
          grade_code?: string;
          id?: string;
          name?: string;
          school_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'classes_school_id_academic_year_id_fkey';
            columns: ['school_id', 'academic_year_id'];
            isOneToOne: false;
            referencedRelation: 'academic_years';
            referencedColumns: ['school_id', 'id'];
          },
          {
            foreignKeyName: 'classes_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
        ];
      };
      curriculum_frameworks: {
        Row: {
          code: string;
          id: string;
          jurisdiction: string;
          name: string;
        };
        Insert: {
          code: string;
          id?: string;
          jurisdiction: string;
          name: string;
        };
        Update: {
          code?: string;
          id?: string;
          jurisdiction?: string;
          name?: string;
        };
        Relationships: [];
      };
      curriculum_offerings: {
        Row: {
          curriculum_version_id: string;
          framework_id: string;
          grade_code: string;
          id: string;
          subject_id: string;
        };
        Insert: {
          curriculum_version_id: string;
          framework_id: string;
          grade_code: string;
          id?: string;
          subject_id: string;
        };
        Update: {
          curriculum_version_id?: string;
          framework_id?: string;
          grade_code?: string;
          id?: string;
          subject_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'curriculum_offerings_curriculum_version_id_framework_id_fkey';
            columns: ['curriculum_version_id', 'framework_id'];
            isOneToOne: false;
            referencedRelation: 'curriculum_versions';
            referencedColumns: ['id', 'framework_id'];
          },
          {
            foreignKeyName: 'curriculum_offerings_framework_id_fkey';
            columns: ['framework_id'];
            isOneToOne: false;
            referencedRelation: 'curriculum_frameworks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'curriculum_offerings_subject_id_framework_id_fkey';
            columns: ['subject_id', 'framework_id'];
            isOneToOne: false;
            referencedRelation: 'subjects';
            referencedColumns: ['id', 'framework_id'];
          },
        ];
      };
      curriculum_sources: {
        Row: {
          applicability: string;
          edition: string | null;
          id: string;
          issuer: string;
          location: Json;
          retrieved_at: string;
          rights: string;
          sha256: string | null;
          title: string;
          url: string;
          verification: string;
        };
        Insert: {
          applicability: string;
          edition?: string | null;
          id: string;
          issuer: string;
          location: Json;
          retrieved_at: string;
          rights: string;
          sha256?: string | null;
          title: string;
          url: string;
          verification: string;
        };
        Update: {
          applicability?: string;
          edition?: string | null;
          id?: string;
          issuer?: string;
          location?: Json;
          retrieved_at?: string;
          rights?: string;
          sha256?: string | null;
          title?: string;
          url?: string;
          verification?: string;
        };
        Relationships: [];
      };
      curriculum_versions: {
        Row: {
          applicable_year: number;
          edition: string;
          framework_id: string;
          id: string;
          reviewed_at: string | null;
          reviewer_id: string | null;
          state: string;
        };
        Insert: {
          applicable_year: number;
          edition: string;
          framework_id: string;
          id?: string;
          reviewed_at?: string | null;
          reviewer_id?: string | null;
          state?: string;
        };
        Update: {
          applicable_year?: number;
          edition?: string;
          framework_id?: string;
          id?: string;
          reviewed_at?: string | null;
          reviewer_id?: string | null;
          state?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'curriculum_versions_framework_id_fkey';
            columns: ['framework_id'];
            isOneToOne: false;
            referencedRelation: 'curriculum_frameworks';
            referencedColumns: ['id'];
          },
        ];
      };
      enrollments: {
        Row: {
          class_subject_id: string;
          ended_at: string | null;
          enrolled_at: string;
          id: string;
          learner_id: string;
          membership_role: string;
          school_id: string;
          status: string;
        };
        Insert: {
          class_subject_id: string;
          ended_at?: string | null;
          enrolled_at?: string;
          id?: string;
          learner_id: string;
          membership_role?: string;
          school_id: string;
          status?: string;
        };
        Update: {
          class_subject_id?: string;
          ended_at?: string | null;
          enrolled_at?: string;
          id?: string;
          learner_id?: string;
          membership_role?: string;
          school_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'enrollments_school_id_class_subject_id_fkey';
            columns: ['school_id', 'class_subject_id'];
            isOneToOne: false;
            referencedRelation: 'class_subjects';
            referencedColumns: ['school_id', 'id'];
          },
          {
            foreignKeyName: 'enrollments_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'enrollments_school_id_learner_id_membership_role_fkey';
            columns: ['school_id', 'learner_id', 'membership_role'];
            isOneToOne: false;
            referencedRelation: 'school_memberships';
            referencedColumns: ['school_id', 'user_id', 'role'];
          },
        ];
      };
      guardian_links: {
        Row: {
          guardian_id: string;
          guardian_role: string;
          id: string;
          learner_id: string;
          learner_role: string;
          school_id: string;
          status: string;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          guardian_id: string;
          guardian_role?: string;
          id?: string;
          learner_id: string;
          learner_role?: string;
          school_id: string;
          status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          guardian_id?: string;
          guardian_role?: string;
          id?: string;
          learner_id?: string;
          learner_role?: string;
          school_id?: string;
          status?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'guardian_links_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'guardian_links_school_id_guardian_id_guardian_role_fkey';
            columns: ['school_id', 'guardian_id', 'guardian_role'];
            isOneToOne: false;
            referencedRelation: 'school_memberships';
            referencedColumns: ['school_id', 'user_id', 'role'];
          },
          {
            foreignKeyName: 'guardian_links_school_id_learner_id_learner_role_fkey';
            columns: ['school_id', 'learner_id', 'learner_role'];
            isOneToOne: false;
            referencedRelation: 'school_memberships';
            referencedColumns: ['school_id', 'user_id', 'role'];
          },
        ];
      };
      school_memberships: {
        Row: {
          id: string;
          role: string;
          school_id: string;
          status: string;
          user_id: string;
          valid_from: string;
          valid_to: string | null;
        };
        Insert: {
          id?: string;
          role: string;
          school_id: string;
          status?: string;
          user_id: string;
          valid_from?: string;
          valid_to?: string | null;
        };
        Update: {
          id?: string;
          role?: string;
          school_id?: string;
          status?: string;
          user_id?: string;
          valid_from?: string;
          valid_to?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'school_memberships_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
        ];
      };
      schools: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          status: string;
          timezone: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          status?: string;
          timezone?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          status?: string;
          timezone?: string;
        };
        Relationships: [];
      };
      subjects: {
        Row: {
          code: string;
          framework_id: string;
          id: string;
          name: string;
          phase: string;
        };
        Insert: {
          code: string;
          framework_id: string;
          id?: string;
          name: string;
          phase: string;
        };
        Update: {
          code?: string;
          framework_id?: string;
          id?: string;
          name?: string;
          phase?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subjects_framework_id_fkey';
            columns: ['framework_id'];
            isOneToOne: false;
            referencedRelation: 'curriculum_frameworks';
            referencedColumns: ['id'];
          },
        ];
      };
      teaching_allocations: {
        Row: {
          class_subject_id: string;
          id: string;
          membership_role: string;
          school_id: string;
          status: string;
          teacher_id: string;
          valid_from: string;
          valid_to: string | null;
        };
        Insert: {
          class_subject_id: string;
          id?: string;
          membership_role?: string;
          school_id: string;
          status?: string;
          teacher_id: string;
          valid_from?: string;
          valid_to?: string | null;
        };
        Update: {
          class_subject_id?: string;
          id?: string;
          membership_role?: string;
          school_id?: string;
          status?: string;
          teacher_id?: string;
          valid_from?: string;
          valid_to?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'teaching_allocations_school_id_class_subject_id_fkey';
            columns: ['school_id', 'class_subject_id'];
            isOneToOne: false;
            referencedRelation: 'class_subjects';
            referencedColumns: ['school_id', 'id'];
          },
          {
            foreignKeyName: 'teaching_allocations_school_id_fkey';
            columns: ['school_id'];
            isOneToOne: false;
            referencedRelation: 'schools';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'teaching_allocations_school_id_teacher_id_membership_role_fkey';
            columns: ['school_id', 'teacher_id', 'membership_role'];
            isOneToOne: false;
            referencedRelation: 'school_memberships';
            referencedColumns: ['school_id', 'user_id', 'role'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_school_class: {
        Args: {
          p_grade: string;
          p_key: string;
          p_name: string;
          p_school: string;
          p_year: number;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
