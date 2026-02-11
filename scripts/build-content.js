#!/usr/bin/env node

/**
 * Content Build Script
 * 
 * This script processes markdown content and generates JSON files
 * for the API and frontend to consume.
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const GENERATED_DIR = path.join(__dirname, '..', 'generated');

console.log('Building content...');

// Ensure generated directory exists
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

// Create placeholder files for now
const placeholderData = {
  blog: [],
  projects: [],
  skills: [],
  lastUpdated: new Date().toISOString()
};

fs.writeFileSync(
  path.join(GENERATED_DIR, 'content-index.json'),
  JSON.stringify(placeholderData, null, 2)
);

console.log('Content build complete!');
console.log(`Output: ${GENERATED_DIR}/content-index.json`);