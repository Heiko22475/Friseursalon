-- Renames the 'general' table to 'general_old' to complete the migration to JSON storage.
ALTER TABLE "general" RENAME TO "general_old";
