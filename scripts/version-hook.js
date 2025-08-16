#!/usr/bin/env node

/**
 * NPM version hook - automatically runs when npm version is executed
 * This ensures all version references are synchronized
 */

import { execSync } from 'child_process';

console.log('🔄 Running post-version hook...');

try {
  // Run our version sync script
  execSync('node scripts/update-version.js', { stdio: 'inherit' });
  
  // Add changed files to git
  execSync('git add .', { stdio: 'inherit' });
  
  console.log('✅ Version sync completed and staged for commit');
} catch (error) {
  console.error('❌ Version sync failed:', error.message);
  process.exit(1);
}