const fs = require('fs');
const path = require('path');

/**
 * Load and parse SQL queries from a file
 * Queries are separated by named comments like: -- name: queryName
 * @param {string} filename - Name of the SQL file (without path)
 * @returns {Object} - Object with query names as keys and SQL strings as values
 */
const loadQueries = (filename) => {
    const filePath = path.join(__dirname, '../db/queries', filename);
    const content = fs.readFileSync(filePath, 'utf8');

    const queries = {};
    const lines = content.split('\n');
    let currentName = null;
    let currentQuery = [];

    for (const line of lines) {
        const nameMatch = line.match(/^--\s*name:\s*(\w+)/);

        if (nameMatch) {
            // Save previous query if exists
            if (currentName) {
                queries[currentName] = currentQuery.join('\n').trim();
            }
            currentName = nameMatch[1];
            currentQuery = [];
        } else if (currentName) {
            currentQuery.push(line);
        }
    }

    // Save the last query
    if (currentName) {
        queries[currentName] = currentQuery.join('\n').trim();
    }

    return queries;
};

/**
 * Get a specific query from a file
 * @param {string} filename - Name of the SQL file
 * @param {string} queryName - Name of the query
 * @returns {string} - The SQL query string
 */
const getQuery = (filename, queryName) => {
    const queries = loadQueries(filename);
    if (!queries[queryName]) {
        throw new Error(`Query '${queryName}' not found in ${filename}`);
    }
    return queries[queryName];
};

module.exports = {
    loadQueries,
    getQuery
};
