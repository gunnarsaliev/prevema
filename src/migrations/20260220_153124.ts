import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('super-admin', 'admin', 'user');
  CREATE TYPE "public"."enum_users_pricing_plan" AS ENUM('free', 'pro', 'organizations', 'unlimited');
  CREATE TYPE "public"."enum_organizations_members_role" AS ENUM('admin', 'editor', 'viewer');
  CREATE TYPE "public"."enum_email_logs_trigger_event" AS ENUM('manual', 'scheduled', 'participant.created', 'participant.updated', 'partner.invited', 'event.published', 'form.submitted', 'custom', 'test');
  CREATE TYPE "public"."enum_email_logs_status" AS ENUM('sent', 'failed', 'scheduled');
  CREATE TYPE "public"."enum_events_status" AS ENUM('planning', 'open', 'closed', 'archived');
  CREATE TYPE "public"."enum_events_event_type" AS ENUM('physical', 'online');
  CREATE TYPE "public"."enum_image_templates_usage_type" AS ENUM('participant', 'partner', 'both');
  CREATE TYPE "public"."enum_invitations_role" AS ENUM('admin', 'editor', 'viewer');
  CREATE TYPE "public"."enum_invitations_status" AS ENUM('pending', 'accepted', 'declined', 'expired');
  CREATE TYPE "public"."enum_participants_social_links_platform" AS ENUM('linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'other');
  CREATE TYPE "public"."enum_participants_status" AS ENUM('not-approved', 'approved', 'need-info', 'cancelled');
  CREATE TYPE "public"."enum_participant_types_required_fields" AS ENUM('imageUrl', 'biography', 'country', 'phoneNumber', 'companyLogoUrl', 'companyName', 'companyPosition', 'companyWebsite', 'socialLinks', 'presentationTopic', 'presentationSummary', 'technicalRequirements');
  CREATE TYPE "public"."enum_participant_types_optional_fields" AS ENUM('imageUrl', 'biography', 'country', 'phoneNumber', 'companyLogoUrl', 'companyName', 'companyPosition', 'companyWebsite', 'socialLinks', 'presentationTopic', 'presentationSummary', 'technicalRequirements');
  CREATE TYPE "public"."enum_partners_social_links_platform" AS ENUM('linkedin', 'facebook', 'instagram', 'other');
  CREATE TYPE "public"."enum_partners_status" AS ENUM('default', 'contacted', 'confirmed', 'declined');
  CREATE TYPE "public"."enum_partner_types_required_fields" AS ENUM('companyLogo', 'companyLogoUrl', 'companyBanner', 'companyDescription', 'companyWebsiteUrl', 'fieldOfExpertise', 'email', 'socialLinks', 'sponsorshipLevel', 'additionalNotes');
  CREATE TYPE "public"."enum_partner_types_optional_fields" AS ENUM('companyLogo', 'companyLogoUrl', 'companyBanner', 'companyDescription', 'companyWebsiteUrl', 'fieldOfExpertise', 'email', 'socialLinks', 'sponsorshipLevel', 'additionalNotes');
  CREATE TYPE "public"."enum_email_templates_automation_triggers_status_filter" AS ENUM('not-approved', 'approved', 'need-info', 'cancelled');
  CREATE TYPE "public"."enum_email_templates_automation_triggers_trigger_event" AS ENUM('none', 'participant.created', 'participant.updated', 'partner.invited', 'event.published', 'form.submitted', 'custom');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"pricing_plan" "enum_users_pricing_plan" DEFAULT 'free',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric
  );
  
  CREATE TABLE "organizations_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"user_id" integer,
  	"email" varchar,
  	"role" "enum_organizations_members_role" DEFAULT 'editor' NOT NULL
  );
  
  CREATE TABLE "organizations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"owner_id" integer NOT NULL,
  	"email_config_is_active" boolean DEFAULT false,
  	"email_config_resend_api_key" varchar,
  	"email_config_sender_name" varchar,
  	"email_config_from_email" varchar,
  	"email_config_reply_to_email" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "email_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organization_id" integer NOT NULL,
  	"template_id" integer NOT NULL,
  	"recipient_email" varchar NOT NULL,
  	"trigger_event" "enum_email_logs_trigger_event" NOT NULL,
  	"variables" varchar,
  	"status" "enum_email_logs_status" DEFAULT 'sent' NOT NULL,
  	"error_message" varchar,
  	"sent_at" timestamp(3) with time zone NOT NULL,
  	"sent_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organization_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"created_by_id" integer,
  	"status" "enum_events_status" DEFAULT 'planning',
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"timezone" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"event_type" "enum_events_event_type" DEFAULT 'online',
  	"address" varchar,
  	"why" varchar,
  	"what" varchar,
  	"where" varchar,
  	"who" varchar,
  	"theme" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "image_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"organization_id" integer,
  	"usage_type" "enum_image_templates_usage_type" DEFAULT 'participant' NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"width" numeric NOT NULL,
  	"height" numeric NOT NULL,
  	"background_image_id" integer,
  	"background_color" varchar,
  	"elements" jsonb NOT NULL,
  	"preview_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "invitations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"organization_id" integer NOT NULL,
  	"role" "enum_invitations_role" DEFAULT 'editor' NOT NULL,
  	"status" "enum_invitations_status" DEFAULT 'pending' NOT NULL,
  	"token" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"invited_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "participants_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_participants_social_links_platform",
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "participants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organization_id" integer,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"event_id" integer NOT NULL,
  	"participant_type_id" integer NOT NULL,
  	"status" "enum_participants_status" DEFAULT 'not-approved',
  	"image_url_id" integer,
  	"biography" varchar,
  	"country" varchar,
  	"phone_number" varchar,
  	"company_logo_url_id" integer,
  	"company_name" varchar,
  	"company_position" varchar,
  	"company_website" varchar,
  	"internal_notes" varchar,
  	"presentation_topic" varchar,
  	"presentation_summary" varchar,
  	"technical_requirements" varchar,
  	"owner_id" integer,
  	"registration_date" timestamp(3) with time zone,
  	"social_post_linked_in" varchar,
  	"social_post_twitter" varchar,
  	"social_post_facebook" varchar,
  	"social_post_instagram" varchar,
  	"social_post_generated_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "participant_types_required_fields" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_participant_types_required_fields",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "participant_types_optional_fields" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_participant_types_optional_fields",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "participant_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organization_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"description" varchar,
  	"event_id" integer,
  	"is_active" boolean DEFAULT true,
  	"show_optional_fields" boolean DEFAULT false,
  	"public_form_link" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "partners_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_partners_social_links_platform",
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organization_id" integer,
  	"company_name" varchar NOT NULL,
  	"event_id" integer NOT NULL,
  	"partner_type_id" integer NOT NULL,
  	"contact_person" varchar NOT NULL,
  	"contact_email" varchar NOT NULL,
  	"email" varchar,
  	"field_of_expertise" varchar,
  	"company_website_url" varchar,
  	"company_logo_id" integer,
  	"company_logo_url" varchar,
  	"company_banner_id" integer,
  	"company_description" varchar,
  	"sponsorship_level" varchar,
  	"additional_notes" varchar,
  	"tier_id" integer,
  	"status" "enum_partners_status" DEFAULT 'default',
  	"owner_id" integer,
  	"created_date" timestamp(3) with time zone,
  	"registration_date" timestamp(3) with time zone,
  	"social_post_linked_in" varchar,
  	"social_post_twitter" varchar,
  	"social_post_facebook" varchar,
  	"social_post_instagram" varchar,
  	"social_post_generated_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "partner_tiers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organization_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"level" numeric,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "partner_types_required_fields" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_partner_types_required_fields",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "partner_types_optional_fields" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_partner_types_optional_fields",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "partner_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"organization_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"description" varchar,
  	"event_id" integer,
  	"is_active" boolean DEFAULT true,
  	"show_optional_fields" boolean DEFAULT false,
  	"public_form_link" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "email_templates_automation_triggers_status_filter" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_email_templates_automation_triggers_status_filter",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "email_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"organization_id" integer NOT NULL,
  	"slug" varchar,
  	"is_active" boolean DEFAULT true,
  	"subject" varchar NOT NULL,
  	"html_body" jsonb NOT NULL,
  	"automation_triggers_trigger_event" "enum_email_templates_automation_triggers_trigger_event" DEFAULT 'none',
  	"automation_triggers_custom_trigger_name" varchar,
  	"automation_triggers_delay_minutes" numeric DEFAULT 0,
  	"automation_triggers_conditions" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"organizations_id" integer,
  	"email_logs_id" integer,
  	"events_id" integer,
  	"image_templates_id" integer,
  	"invitations_id" integer,
  	"participants_id" integer,
  	"participant_types_id" integer,
  	"partners_id" integer,
  	"partner_tiers_id" integer,
  	"partner_types_id" integer,
  	"email_templates_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizations_members" ADD CONSTRAINT "organizations_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "organizations_members" ADD CONSTRAINT "organizations_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_sent_by_id_users_id_fk" FOREIGN KEY ("sent_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "image_templates" ADD CONSTRAINT "image_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "image_templates" ADD CONSTRAINT "image_templates_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "image_templates" ADD CONSTRAINT "image_templates_preview_image_id_media_id_fk" FOREIGN KEY ("preview_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "invitations" ADD CONSTRAINT "invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_id_users_id_fk" FOREIGN KEY ("invited_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "participants_social_links" ADD CONSTRAINT "participants_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "participants" ADD CONSTRAINT "participants_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "participants" ADD CONSTRAINT "participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "participants" ADD CONSTRAINT "participants_participant_type_id_participant_types_id_fk" FOREIGN KEY ("participant_type_id") REFERENCES "public"."participant_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "participants" ADD CONSTRAINT "participants_image_url_id_media_id_fk" FOREIGN KEY ("image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "participants" ADD CONSTRAINT "participants_company_logo_url_id_media_id_fk" FOREIGN KEY ("company_logo_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "participants" ADD CONSTRAINT "participants_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "participant_types_required_fields" ADD CONSTRAINT "participant_types_required_fields_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."participant_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "participant_types_optional_fields" ADD CONSTRAINT "participant_types_optional_fields_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."participant_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "participant_types" ADD CONSTRAINT "participant_types_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "participant_types" ADD CONSTRAINT "participant_types_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_social_links" ADD CONSTRAINT "partners_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_partner_type_id_partner_types_id_fk" FOREIGN KEY ("partner_type_id") REFERENCES "public"."partner_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_company_banner_id_media_id_fk" FOREIGN KEY ("company_banner_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_tier_id_partner_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."partner_tiers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partner_tiers" ADD CONSTRAINT "partner_tiers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partner_types_required_fields" ADD CONSTRAINT "partner_types_required_fields_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partner_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partner_types_optional_fields" ADD CONSTRAINT "partner_types_optional_fields_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partner_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partner_types" ADD CONSTRAINT "partner_types_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partner_types" ADD CONSTRAINT "partner_types_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "email_templates_automation_triggers_status_filter" ADD CONSTRAINT "email_templates_automation_triggers_status_filter_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."email_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_logs_fk" FOREIGN KEY ("email_logs_id") REFERENCES "public"."email_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_image_templates_fk" FOREIGN KEY ("image_templates_id") REFERENCES "public"."image_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invitations_fk" FOREIGN KEY ("invitations_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_participants_fk" FOREIGN KEY ("participants_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_participant_types_fk" FOREIGN KEY ("participant_types_id") REFERENCES "public"."participant_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partner_tiers_fk" FOREIGN KEY ("partner_tiers_id") REFERENCES "public"."partner_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partner_types_fk" FOREIGN KEY ("partner_types_id") REFERENCES "public"."partner_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_templates_fk" FOREIGN KEY ("email_templates_id") REFERENCES "public"."email_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "organizations_members_order_idx" ON "organizations_members" USING btree ("_order");
  CREATE INDEX "organizations_members_parent_id_idx" ON "organizations_members" USING btree ("_parent_id");
  CREATE INDEX "organizations_members_user_idx" ON "organizations_members" USING btree ("user_id");
  CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");
  CREATE INDEX "organizations_owner_idx" ON "organizations" USING btree ("owner_id");
  CREATE INDEX "organizations_updated_at_idx" ON "organizations" USING btree ("updated_at");
  CREATE INDEX "organizations_created_at_idx" ON "organizations" USING btree ("created_at");
  CREATE INDEX "email_logs_organization_idx" ON "email_logs" USING btree ("organization_id");
  CREATE INDEX "email_logs_template_idx" ON "email_logs" USING btree ("template_id");
  CREATE INDEX "email_logs_sent_by_idx" ON "email_logs" USING btree ("sent_by_id");
  CREATE INDEX "email_logs_updated_at_idx" ON "email_logs" USING btree ("updated_at");
  CREATE INDEX "email_logs_created_at_idx" ON "email_logs" USING btree ("created_at");
  CREATE INDEX "events_organization_idx" ON "events" USING btree ("organization_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_created_by_idx" ON "events" USING btree ("created_by_id");
  CREATE INDEX "events_image_idx" ON "events" USING btree ("image_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE UNIQUE INDEX "image_templates_slug_idx" ON "image_templates" USING btree ("slug");
  CREATE INDEX "image_templates_organization_idx" ON "image_templates" USING btree ("organization_id");
  CREATE INDEX "image_templates_background_image_idx" ON "image_templates" USING btree ("background_image_id");
  CREATE INDEX "image_templates_preview_image_idx" ON "image_templates" USING btree ("preview_image_id");
  CREATE INDEX "image_templates_updated_at_idx" ON "image_templates" USING btree ("updated_at");
  CREATE INDEX "image_templates_created_at_idx" ON "image_templates" USING btree ("created_at");
  CREATE INDEX "invitations_organization_idx" ON "invitations" USING btree ("organization_id");
  CREATE UNIQUE INDEX "invitations_token_idx" ON "invitations" USING btree ("token");
  CREATE INDEX "invitations_invited_by_idx" ON "invitations" USING btree ("invited_by_id");
  CREATE INDEX "invitations_updated_at_idx" ON "invitations" USING btree ("updated_at");
  CREATE INDEX "invitations_created_at_idx" ON "invitations" USING btree ("created_at");
  CREATE INDEX "participants_social_links_order_idx" ON "participants_social_links" USING btree ("_order");
  CREATE INDEX "participants_social_links_parent_id_idx" ON "participants_social_links" USING btree ("_parent_id");
  CREATE INDEX "participants_organization_idx" ON "participants" USING btree ("organization_id");
  CREATE INDEX "participants_event_idx" ON "participants" USING btree ("event_id");
  CREATE INDEX "participants_participant_type_idx" ON "participants" USING btree ("participant_type_id");
  CREATE INDEX "participants_image_url_idx" ON "participants" USING btree ("image_url_id");
  CREATE INDEX "participants_company_logo_url_idx" ON "participants" USING btree ("company_logo_url_id");
  CREATE INDEX "participants_owner_idx" ON "participants" USING btree ("owner_id");
  CREATE INDEX "participants_updated_at_idx" ON "participants" USING btree ("updated_at");
  CREATE INDEX "participants_created_at_idx" ON "participants" USING btree ("created_at");
  CREATE INDEX "participant_types_required_fields_order_idx" ON "participant_types_required_fields" USING btree ("order");
  CREATE INDEX "participant_types_required_fields_parent_idx" ON "participant_types_required_fields" USING btree ("parent_id");
  CREATE INDEX "participant_types_optional_fields_order_idx" ON "participant_types_optional_fields" USING btree ("order");
  CREATE INDEX "participant_types_optional_fields_parent_idx" ON "participant_types_optional_fields" USING btree ("parent_id");
  CREATE INDEX "participant_types_organization_idx" ON "participant_types" USING btree ("organization_id");
  CREATE UNIQUE INDEX "participant_types_slug_idx" ON "participant_types" USING btree ("slug");
  CREATE INDEX "participant_types_event_idx" ON "participant_types" USING btree ("event_id");
  CREATE INDEX "participant_types_updated_at_idx" ON "participant_types" USING btree ("updated_at");
  CREATE INDEX "participant_types_created_at_idx" ON "participant_types" USING btree ("created_at");
  CREATE INDEX "partners_social_links_order_idx" ON "partners_social_links" USING btree ("_order");
  CREATE INDEX "partners_social_links_parent_id_idx" ON "partners_social_links" USING btree ("_parent_id");
  CREATE INDEX "partners_organization_idx" ON "partners" USING btree ("organization_id");
  CREATE INDEX "partners_event_idx" ON "partners" USING btree ("event_id");
  CREATE INDEX "partners_partner_type_idx" ON "partners" USING btree ("partner_type_id");
  CREATE INDEX "partners_company_logo_idx" ON "partners" USING btree ("company_logo_id");
  CREATE INDEX "partners_company_banner_idx" ON "partners" USING btree ("company_banner_id");
  CREATE INDEX "partners_tier_idx" ON "partners" USING btree ("tier_id");
  CREATE INDEX "partners_owner_idx" ON "partners" USING btree ("owner_id");
  CREATE INDEX "partners_updated_at_idx" ON "partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "partners" USING btree ("created_at");
  CREATE INDEX "partner_tiers_organization_idx" ON "partner_tiers" USING btree ("organization_id");
  CREATE UNIQUE INDEX "partner_tiers_slug_idx" ON "partner_tiers" USING btree ("slug");
  CREATE INDEX "partner_tiers_updated_at_idx" ON "partner_tiers" USING btree ("updated_at");
  CREATE INDEX "partner_tiers_created_at_idx" ON "partner_tiers" USING btree ("created_at");
  CREATE INDEX "partner_types_required_fields_order_idx" ON "partner_types_required_fields" USING btree ("order");
  CREATE INDEX "partner_types_required_fields_parent_idx" ON "partner_types_required_fields" USING btree ("parent_id");
  CREATE INDEX "partner_types_optional_fields_order_idx" ON "partner_types_optional_fields" USING btree ("order");
  CREATE INDEX "partner_types_optional_fields_parent_idx" ON "partner_types_optional_fields" USING btree ("parent_id");
  CREATE INDEX "partner_types_organization_idx" ON "partner_types" USING btree ("organization_id");
  CREATE INDEX "partner_types_slug_idx" ON "partner_types" USING btree ("slug");
  CREATE INDEX "partner_types_event_idx" ON "partner_types" USING btree ("event_id");
  CREATE INDEX "partner_types_updated_at_idx" ON "partner_types" USING btree ("updated_at");
  CREATE INDEX "partner_types_created_at_idx" ON "partner_types" USING btree ("created_at");
  CREATE INDEX "email_templates_automation_triggers_status_filter_order_idx" ON "email_templates_automation_triggers_status_filter" USING btree ("order");
  CREATE INDEX "email_templates_automation_triggers_status_filter_parent_idx" ON "email_templates_automation_triggers_status_filter" USING btree ("parent_id");
  CREATE INDEX "email_templates_organization_idx" ON "email_templates" USING btree ("organization_id");
  CREATE UNIQUE INDEX "email_templates_slug_idx" ON "email_templates" USING btree ("slug");
  CREATE INDEX "email_templates_updated_at_idx" ON "email_templates" USING btree ("updated_at");
  CREATE INDEX "email_templates_created_at_idx" ON "email_templates" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_organizations_id_idx" ON "payload_locked_documents_rels" USING btree ("organizations_id");
  CREATE INDEX "payload_locked_documents_rels_email_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("email_logs_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_image_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("image_templates_id");
  CREATE INDEX "payload_locked_documents_rels_invitations_id_idx" ON "payload_locked_documents_rels" USING btree ("invitations_id");
  CREATE INDEX "payload_locked_documents_rels_participants_id_idx" ON "payload_locked_documents_rels" USING btree ("participants_id");
  CREATE INDEX "payload_locked_documents_rels_participant_types_id_idx" ON "payload_locked_documents_rels" USING btree ("participant_types_id");
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX "payload_locked_documents_rels_partner_tiers_id_idx" ON "payload_locked_documents_rels" USING btree ("partner_tiers_id");
  CREATE INDEX "payload_locked_documents_rels_partner_types_id_idx" ON "payload_locked_documents_rels" USING btree ("partner_types_id");
  CREATE INDEX "payload_locked_documents_rels_email_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("email_templates_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "organizations_members" CASCADE;
  DROP TABLE "organizations" CASCADE;
  DROP TABLE "email_logs" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "image_templates" CASCADE;
  DROP TABLE "invitations" CASCADE;
  DROP TABLE "participants_social_links" CASCADE;
  DROP TABLE "participants" CASCADE;
  DROP TABLE "participant_types_required_fields" CASCADE;
  DROP TABLE "participant_types_optional_fields" CASCADE;
  DROP TABLE "participant_types" CASCADE;
  DROP TABLE "partners_social_links" CASCADE;
  DROP TABLE "partners" CASCADE;
  DROP TABLE "partner_tiers" CASCADE;
  DROP TABLE "partner_types_required_fields" CASCADE;
  DROP TABLE "partner_types_optional_fields" CASCADE;
  DROP TABLE "partner_types" CASCADE;
  DROP TABLE "email_templates_automation_triggers_status_filter" CASCADE;
  DROP TABLE "email_templates" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_users_pricing_plan";
  DROP TYPE "public"."enum_organizations_members_role";
  DROP TYPE "public"."enum_email_logs_trigger_event";
  DROP TYPE "public"."enum_email_logs_status";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum_events_event_type";
  DROP TYPE "public"."enum_image_templates_usage_type";
  DROP TYPE "public"."enum_invitations_role";
  DROP TYPE "public"."enum_invitations_status";
  DROP TYPE "public"."enum_participants_social_links_platform";
  DROP TYPE "public"."enum_participants_status";
  DROP TYPE "public"."enum_participant_types_required_fields";
  DROP TYPE "public"."enum_participant_types_optional_fields";
  DROP TYPE "public"."enum_partners_social_links_platform";
  DROP TYPE "public"."enum_partners_status";
  DROP TYPE "public"."enum_partner_types_required_fields";
  DROP TYPE "public"."enum_partner_types_optional_fields";
  DROP TYPE "public"."enum_email_templates_automation_triggers_status_filter";
  DROP TYPE "public"."enum_email_templates_automation_triggers_trigger_event";`)
}
