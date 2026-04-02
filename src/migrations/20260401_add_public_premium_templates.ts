import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Add isPublic and isPremium columns to image_templates
    ALTER TABLE "image_templates"
    ADD COLUMN "is_public" boolean DEFAULT false,
    ADD COLUMN "is_premium" boolean DEFAULT false;

    -- Add isPublic and isPremium columns to email_templates
    ALTER TABLE "email_templates"
    ADD COLUMN "is_public" boolean DEFAULT false,
    ADD COLUMN "is_premium" boolean DEFAULT false;

    -- Make organization_id nullable for public templates in image_templates
    ALTER TABLE "image_templates"
    ALTER COLUMN "organization_id" DROP NOT NULL;

    -- Make organization_id nullable for public templates in email_templates
    ALTER TABLE "email_templates"
    ALTER COLUMN "organization_id" DROP NOT NULL;

    -- Drop the usage_type column from image_templates
    ALTER TABLE "image_templates"
    DROP COLUMN "usage_type";

    -- Drop the enum type for usage_type
    DROP TYPE IF EXISTS "public"."enum_image_templates_usage_type";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Recreate the enum type
    CREATE TYPE "public"."enum_image_templates_usage_type" AS ENUM('participant', 'partner', 'both');

    -- Add back usage_type column with default value
    ALTER TABLE "image_templates"
    ADD COLUMN "usage_type" "enum_image_templates_usage_type" DEFAULT 'participant' NOT NULL;

    -- Make organization_id required again
    ALTER TABLE "image_templates"
    ALTER COLUMN "organization_id" SET NOT NULL;

    ALTER TABLE "email_templates"
    ALTER COLUMN "organization_id" SET NOT NULL;

    -- Remove isPublic and isPremium columns from image_templates
    ALTER TABLE "image_templates"
    DROP COLUMN "is_public",
    DROP COLUMN "is_premium";

    -- Remove isPublic and isPremium columns from email_templates
    ALTER TABLE "email_templates"
    DROP COLUMN "is_public",
    DROP COLUMN "is_premium";
  `)
}
