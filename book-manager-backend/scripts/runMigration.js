const pool = require('../config/database');  // 구조분해 없이
const fs = require('fs');
const path = require('path');

const migrations = [
  '001_create_users_table.sql',
  '002_create_books_table.sql',
  '003_create_user_books_table.sql',
  '004_create_reviews_table.sql',
  '005_create_reading_goals_table.sql',
  '006_add_refresh_token_to_users.sql'
];

async function runAllMigrations() {
  try {
    console.log('Starting migrations...');
    
    for (const migration of migrations) {
      console.log(`Running ${migration}...`);
      const sql = fs.readFileSync(
        path.join(__dirname, '..', 'migrations', migration), 
        'utf8'
      );
      await pool.query(sql);
      console.log(`✅ ${migration} completed`);
    }
    
    console.log('🎉 All migrations completed successfully!');
    
    // 테이블 목록 확인
    const result = await pool.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    
    console.log('\n📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.tablename}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

runAllMigrations();