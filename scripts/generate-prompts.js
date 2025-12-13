/**
 * Build script to generate TypeScript from markdown prompt files
 * Run this whenever you update prompt markdown files
 */

const fs = require('fs');
const path = require('path');

const promptsDir = path.join(__dirname, '../prompts');
const outputFile = path.join(promptsDir, 'generated-prompts.ts');

// Get all directories starting with t_
const promptDirs = fs.readdirSync(promptsDir)
  .filter(name => {
    const fullPath = path.join(promptsDir, name);
    return fs.statSync(fullPath).isDirectory() && name.startsWith('t_');
  })
  .sort();

console.log(`Found ${promptDirs.length} prompt directories`);

// Generate TypeScript content
let tsContent = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated from markdown files in prompts/t_* directories
 * Run 'npm run generate-prompts' to regenerate
 */

`;

// Add each prompt as a const export
promptDirs.forEach(dir => {
  const systemMdPath = path.join(promptsDir, dir, 'system.md');

  if (fs.existsSync(systemMdPath)) {
    const content = fs.readFileSync(systemMdPath, 'utf8');
    const promptName = dir.replace('t_', '').toUpperCase();

    // Escape backticks and template literal syntax
    const escapedContent = content
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');

    tsContent += `export const ${promptName}_PROMPT = \`${escapedContent}\`;\n\n`;

    console.log(`  ✓ ${dir}`);
  } else {
    console.warn(`  ⚠ ${dir} missing system.md`);
  }
});

// Write the generated file
fs.writeFileSync(outputFile, tsContent, 'utf8');

console.log(`\n✅ Generated ${outputFile}`);
console.log(`   ${promptDirs.length} prompts exported`);
