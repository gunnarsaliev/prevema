import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Rename enums
    ALTER TYPE "public"."enum_participant_types_required_fields" RENAME TO "enum_participant_roles_required_fields";
    ALTER TYPE "public"."enum_participant_types_optional_fields" RENAME TO "enum_participant_roles_optional_fields";

    -- Rename hasMany array tables
    ALTER TABLE "participant_types_required_fields" RENAME TO "participant_roles_required_fields";
    ALTER TABLE "participant_types_optional_fields" RENAME TO "participant_roles_optional_fields";

    -- Rename main table
    ALTER TABLE "participant_types" RENAME TO "participant_roles";

    -- Rename FK column in participants table
    ALTER TABLE "participants" RENAME COLUMN "participant_type_id" TO "participant_role_id";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Restore FK column in participants table
    ALTER TABLE "participants" RENAME COLUMN "participant_role_id" TO "participant_type_id";

    -- Restore main table
    ALTER TABLE "participant_roles" RENAME TO "participant_types";

    -- Restore hasMany array tables
    ALTER TABLE "participant_roles_required_fields" RENAME TO "participant_types_required_fields";
    ALTER TABLE "participant_roles_optional_fields" RENAME TO "participant_types_optional_fields";

    -- Restore enums
    ALTER TYPE "public"."enum_participant_roles_required_fields" RENAME TO "enum_participant_types_required_fields";
    ALTER TYPE "public"."enum_participant_roles_optional_fields" RENAME TO "enum_participant_types_optional_fields";
  `)
}
