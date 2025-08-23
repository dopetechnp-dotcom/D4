 const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Working Supabase Configuration (your current working project)
const WORKING_SUPABASE_URL = 'https://aizgswoelfdkhyosgvzu.supabase.co';
const WORKING_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpemdzd29lbGZka2h5b3Nndnp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1NTIyNSwiZXhwIjoyMDcwNjMxMjI1fQ.gLnsyAhR8VSjbe37LdEHuFBGNDufqC4jZ9X3UOSNuGc';

// Create Supabase client
const supabase = createClient(WORKING_SUPABASE_URL, WORKING_SUPABASE_SERVICE_KEY);

async function exportCompleteSchema() {
  console.log('📋 Exporting Complete Database Schema');
  console.log('='.repeat(50));

  try {
    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .not('table_name', 'like', 'pg_%')
      .not('table_name', 'like', 'information_schema%');

    if (tablesError) {
      console.log('❌ Error fetching tables:', tablesError.message);
      return;
    }

    console.log('📊 Found tables:', tables.map(t => t.table_name).join(', '));

    let completeSchema = `-- =====================================================
-- Complete DopeTech Database Schema Export
-- Generated from working Supabase project
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

`;

    // Export each table structure
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`\n📋 Exporting structure for: ${tableName}`);

      // Get table columns
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('*')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .order('ordinal_position');

      if (columnsError) {
        console.log(`   ❌ Error fetching columns for ${tableName}:`, columnsError.message);
        continue;
      }

      // Get table constraints
      const { data: constraints, error: constraintsError } = await supabase
        .from('information_schema.table_constraints')
        .select('*')
        .eq('table_schema', 'public')
        .eq('table_name', tableName);

      if (constraintsError) {
        console.log(`   ⚠️  Error fetching constraints for ${tableName}:`, constraintsError.message);
      }

      // Build CREATE TABLE statement
      completeSchema += `-- =====================================================
-- ${tableName.toUpperCase()} TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ${tableName} (\n`;

      const columnDefinitions = columns.map(col => {
        let def = `  ${col.column_name} ${col.data_type}`;
        
        if (col.character_maximum_length) {
          def += `(${col.character_maximum_length})`;
        }
        
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }
        
        return def;
      });

      completeSchema += columnDefinitions.join(',\n') + '\n);\n\n';

      // Add indexes if they exist
      const { data: indexes, error: indexesError } = await supabase
        .from('pg_indexes')
        .select('*')
        .eq('tablename', tableName);

      if (!indexesError && indexes.length > 0) {
        completeSchema += `-- Indexes for ${tableName}\n`;
        indexes.forEach(index => {
          if (!index.indexname.includes('_pkey')) { // Skip primary key indexes
            completeSchema += `CREATE INDEX IF NOT EXISTS ${index.indexname} ON ${tableName}(${index.indexdef.split('(')[1].split(')')[0]});\n`;
          }
        });
        completeSchema += '\n';
      }
    }

    // Add RLS policies
    completeSchema += `-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================
`;

    for (const table of tables) {
      const tableName = table.table_name;
      completeSchema += `-- Enable RLS for ${tableName}
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

-- Add policies for ${tableName} (you may need to customize these)
CREATE POLICY "Public read access" ON ${tableName} FOR SELECT USING (true);
CREATE POLICY "Authenticated insert access" ON ${tableName} FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update access" ON ${tableName} FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete access" ON ${tableName} FOR DELETE USING (auth.role() = 'authenticated');

`;
    }

    // Save the complete schema
    const outputPath = path.join(__dirname, '..', 'complete-database-schema.sql');
    await fs.writeFile(outputPath, completeSchema);
    
    console.log('\n✅ Complete schema exported to: complete-database-schema.sql');
    console.log('\n📋 Next steps:');
    console.log('1. Review the generated schema file');
    console.log('2. Run it in your new Supabase project SQL Editor');
    console.log('3. This will create all the missing tables');

  } catch (error) {
    console.log('❌ Error exporting schema:', error.message);
  }
}

// Run the export
exportCompleteSchema().catch(console.error);
