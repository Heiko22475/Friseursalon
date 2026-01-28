-- =====================================================
-- COMPLETE DATABASE SCHEMA EXPORT
-- Run this in Supabase SQL Editor to get your full schema
-- Copy the results and save to a file
-- =====================================================

-- 1. Export all table definitions
SELECT 
    'CREATE TABLE ' || table_schema || '.' || table_name || ' (' || E'\n' ||
    string_agg(
        '  ' || column_name || ' ' || data_type || 
        CASE WHEN character_maximum_length IS NOT NULL 
            THEN '(' || character_maximum_length || ')' 
            ELSE '' 
        END ||
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
        ',' || E'\n'
    ) || E'\n);' as create_table_statement
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_schema, table_name
ORDER BY table_name;

-- 2. Export all indexes
SELECT indexdef || ';' as create_index_statement
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 3. Export all RLS policies
SELECT 
    'CREATE POLICY "' || policyname || '" ON ' || tablename || 
    ' FOR ' || cmd || 
    ' TO ' || roles::text || 
    ' USING (' || qual || ')' ||
    CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')' ELSE '' END ||
    ';' as create_policy_statement
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Export all foreign keys
SELECT
    'ALTER TABLE ' || tc.table_name || 
    ' ADD CONSTRAINT ' || tc.constraint_name || 
    ' FOREIGN KEY (' || kcu.column_name || ')' ||
    ' REFERENCES ' || ccu.table_name || '(' || ccu.column_name || ')' ||
    ' ON DELETE ' || rc.delete_rule || ';' as create_fk_statement
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;
