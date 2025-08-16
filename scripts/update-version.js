#!/usr/bin/env node

/**
 * Automated version synchronization script
 * Updates all version references across the project
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function getPackageVersion() {
  const packagePath = join(projectRoot, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

function updateFile(filePath, searchPattern, replaceFunction) {
  try {
    let content = readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    if (typeof searchPattern === 'string') {
      content = content.replace(new RegExp(searchPattern, 'g'), replaceFunction);
    } else {
      content = content.replace(searchPattern, replaceFunction);
    }
    
    if (content !== originalContent) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  const version = getPackageVersion();
  console.log(`🔄 Updating all files to version ${version}`);
  
  let updatedFiles = 0;
  
  // Update INSTALLATION.md
  if (updateFile(
    join(projectRoot, 'INSTALLATION.md'),
    /Dutch Legal MCP Server v[\d.]+/g,
    `Dutch Legal MCP Server v${version}`
  )) updatedFiles++;
  
  if (updateFile(
    join(projectRoot, 'INSTALLATION.md'),
    /^[\d.]+$/gm,
    version
  )) updatedFiles++;
  
  // Update README.md if it exists
  if (updateFile(
    join(projectRoot, 'README.md'),
    /v[\d.]+/g,
    `v${version}`
  )) updatedFiles++;
  
  // Update any documentation files
  if (updateFile(
    join(projectRoot, 'MCP_CONFIGURATION.md'),
    /v[\d.]+/g,
    `v${version}`
  )) updatedFiles++;
  
  // Update CHANGELOG.md version headers
  if (updateFile(
    join(projectRoot, 'CHANGELOG.md'),
    /## \[Unreleased\]/g,
    `## [${version}] - ${new Date().toISOString().split('T')[0]}`
  )) updatedFiles++;
  
  console.log(`\n🎉 Version sync complete!`);
  console.log(`📝 Updated ${updatedFiles} files to version ${version}`);
  console.log(`\n📋 Next steps:`);
  console.log(`   npm run build`);
  console.log(`   npm publish`);
}

main();