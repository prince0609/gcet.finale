const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const { pool } = require('../config/db');

const initDb = async () => {
    try {
        console.log('Starting database initialization...');

        const schemaPath = path.join(__dirname, 'migrations', '001_complete_schema.sql');

        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at: ${schemaPath}`);
        }

        console.log(`Reading schema from: ${schemaPath}`);
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema migration...');
        // Split if necessary, but pool.query usually handles multiple statements if capable, 
        // though strictly pg driver might prefer single statement per query or allow multiple.
        // pg driver allows multiple statements in one query string usually.
        await pool.query(schemaSql);

        console.log('✅ Database schema applied successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
};

initDb();
