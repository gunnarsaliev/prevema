import * as migration_20260220_153124 from './20260220_153124';
import * as migration_20260325_rename_participant_types_to_roles from './20260325_rename_participant_types_to_roles';
import * as migration_20260401_add_public_premium_templates from './20260401_add_public_premium_templates';

export const migrations = [
  {
    up: migration_20260220_153124.up,
    down: migration_20260220_153124.down,
    name: '20260220_153124'
  },
  {
    up: migration_20260325_rename_participant_types_to_roles.up,
    down: migration_20260325_rename_participant_types_to_roles.down,
    name: '20260325_rename_participant_types_to_roles'
  },
  {
    up: migration_20260401_add_public_premium_templates.up,
    down: migration_20260401_add_public_premium_templates.down,
    name: '20260401_add_public_premium_templates'
  },
];
