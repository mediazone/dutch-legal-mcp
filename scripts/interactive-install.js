#!/usr/bin/env node

import { createInterface } from 'readline';
import { writeFileSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function addToShellProfile(envVars) {
  const shell = process.env.SHELL || '';
  let profileFile;
  
  if (shell.includes('zsh')) {
    profileFile = join(homedir(), '.zshrc');
  } else if (shell.includes('bash')) {
    profileFile = join(homedir(), '.bashrc');
  } else {
    profileFile = join(homedir(), '.profile');
  }

  let content = '';
  try {
    content = readFileSync(profileFile, 'utf8');
  } catch (error) {
    // File doesn't exist or can't be read - start with empty content
    if (error.code !== 'ENOENT') {
      throw error; // Re-throw if it's not a "file not found" error
    }
  }

  // Remove existing Dutch Legal MCP configuration
  content = content.replace(/# Dutch Legal MCP Configuration[\s\S]*?# End Dutch Legal MCP Configuration\n/g, '');

  // Add new configuration
  content += '\n# Dutch Legal MCP Configuration\n';
  envVars.forEach(({ name, value }) => {
    content += `export ${name}="${value}"\n`;
  });
  content += '# End Dutch Legal MCP Configuration\n';

  writeFileSync(profileFile, content);
  return profileFile;
}

async function main() {
  console.log('🇳🇱⚖️ Dutch Legal MCP Configuration Setup\n');
  console.log('This tool is designed for the Dutch government legal system (rechtspraak.nl).');
  console.log('For organizational or specialized deployments, custom configuration may be required.\n');
  
  const useCustom = await question('Do you require custom organizational configuration? (y/N): ');
  
  if (useCustom.toLowerCase() !== 'y' && useCustom.toLowerCase() !== 'yes') {
    console.log('\n✅ Using standard Dutch government APIs (rechtspraak.nl)');
    console.log('Installation complete! Run: dutch-legal-mcp --help');
    rl.close();
    return;
  }

  console.log('\n⚠️  CRITICAL LEGAL DISCLAIMER:');
  console.log('YOU are fully responsible for:');
  console.log('- ALL actions performed by this Dutch Legal MCP tool');
  console.log('- Compliance with ANY API terms of service (including Dutch government APIs)');
  console.log('- Ensuring data accuracy and legal authority');
  console.log('- Verifying API compatibility with expected format');
  console.log('- All legal implications and consequences of your usage');
  console.log('- Any damages, liabilities, or legal issues arising from usage');
  console.log('- Proper supervision and control of all tool operations');
  console.log('- This tool provides research assistance only - not legal advice\n');
  
  const acknowledge = await question('Do you acknowledge this responsibility? (yes/no): ');
  
  if (acknowledge.toLowerCase() !== 'yes') {
    console.log('\n❌ Configuration cancelled. Using default Dutch APIs.');
    rl.close();
    return;
  }

  console.log('\n📝 Custom Endpoint Configuration:');
  
  const apiUrl = await question('Court API base URL (for search/content): ');
  const viewUrl = await question('Court viewing URL (for case links): ');

  if (!apiUrl || !viewUrl) {
    console.log('\n❌ Both URLs are required. Configuration cancelled.');
    rl.close();
    return;
  }

  // Validate URLs
  try {
    new URL(apiUrl);
    new URL(viewUrl);
  } catch (error) {
    console.log('\n❌ Invalid URL format. Configuration cancelled.');
    rl.close();
    return;
  }

  const envVars = [
    { name: 'DUTCH_LEGAL_API_BASE_URL', value: apiUrl },
    { name: 'DUTCH_LEGAL_VIEW_BASE_URL', value: viewUrl }
  ];

  try {
    const profileFile = addToShellProfile(envVars);
    
    console.log('\n✅ Configuration saved successfully!');
    console.log(`📄 Environment variables added to: ${profileFile}`);
    console.log('\n🔄 To apply changes, run one of:');
    console.log(`   source ${profileFile}`);
    console.log('   # OR restart your terminal');
    console.log('\n🚀 Test your configuration:');
    console.log('   dutch-legal-mcp --help');
    
  } catch (error) {
    console.log('\n❌ Failed to save configuration:', error.message);
    console.log('\n📝 Manual setup required. Add these to your shell profile:');
    envVars.forEach(({ name, value }) => {
      console.log(`export ${name}="${value}"`);
    });
  }

  rl.close();
}

main().catch(console.error);