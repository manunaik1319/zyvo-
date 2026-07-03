const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\x1b[35m[QA Bug Checker Agent] Starting codebase analysis...\x1b[0m\n');

let issuesFound = 0;

function reportIssue(message, severity = 'ERROR') {
  issuesFound++;
  const color = severity === 'ERROR' ? '\x1b[31m' : '\x1b[33m';
  console.log(`${color}[${severity}] ${message}\x1b[0m`);
}

function reportSuccess(message) {
  console.log(`\x1b[32m[PASS] ${message}\x1b[0m`);
}

// 1. Check ScrollView Taps Persistence inside Forms
console.log('--- 1. Auditing ScrollView Keyboard Tap Persistence ---');
const authDir = path.join(__dirname, '../src/app/(auth)');
if (fs.existsSync(authDir)) {
  const authFiles = fs.readdirSync(authDir).filter(f => f.endsWith('.tsx'));
  authFiles.forEach(file => {
    const filePath = path.join(authDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('ScrollView')) {
      if (!content.includes('keyboardShouldPersistTaps=')) {
        reportIssue(`File (auth)/${file} contains a ScrollView but does not specify "keyboardShouldPersistTaps". This can cause keyboard focus loss on tap.`, 'ERROR');
      } else {
        reportSuccess(`File (auth)/${file} has persistent ScrollView taps configured.`);
      }
    }
  });
}

const settingsFile = path.join(__dirname, '../src/app/settings/index.tsx');
if (fs.existsSync(settingsFile)) {
  const content = fs.readFileSync(settingsFile, 'utf8');
  if (content.includes('ScrollView') && !content.includes('keyboardShouldPersistTaps=')) {
    reportIssue('settings/index.tsx contains a ScrollView but does not specify "keyboardShouldPersistTaps".', 'ERROR');
  } else {
    reportSuccess('settings/index.tsx has persistent ScrollView taps configured.');
  }
}

// 2. Audit Input.tsx for layout shifts
console.log('\n--- 2. Auditing Input Component for Layout Shift Risks ---');
const inputPath = path.join(__dirname, '../src/components/common/Input.tsx');
if (fs.existsSync(inputPath)) {
  const content = fs.readFileSync(inputPath, 'utf8');
  if (content.includes('shadowColor') && content.includes('inputFocused:')) {
    reportIssue('Input.tsx contains dynamic shadow styling inside "inputFocused", which can blur focus and close keyboard on Android.', 'WARNING');
  } else if (/inputFontSize\s*=\s*hasText/i.test(content)) {
    reportIssue('Input.tsx changes font size dynamically based on text presence, triggering native layout remeasurement and focus loss.', 'ERROR');
  } else {
    reportSuccess('Input.tsx focus styles and typography measurements are stable.');
  }
} else {
  reportIssue('Input.tsx component not found.', 'WARNING');
}

// 3. Verify Router Group Layout integrity
console.log('\n--- 3. Auditing Expo Router Layout Groups ---');
const tabsLayoutPath = path.join(__dirname, '../src/app/(tabs)/_layout.tsx');
if (fs.existsSync(tabsLayoutPath)) {
  const content = fs.readFileSync(tabsLayoutPath, 'utf8');
  const tabsDir = path.join(__dirname, '../src/app/(tabs)');
  const screens = fs.readdirSync(tabsDir).filter(f => f.endsWith('.tsx') && !f.startsWith('_'));
  
  // Extract all screen names defined in the layout
  const matches = [...content.matchAll(/name="([^"]+)"/g)].map(m => m[1]);
  matches.forEach(name => {
    if (name !== 'focus' && !screens.some(s => s.startsWith(name))) {
      reportIssue(`Tab layout declares screen "${name}" but no "${name}.tsx" file exists in (tabs)/ directory.`, 'ERROR');
    }
  });
  
  if (content.includes('name="focus"')) {
    reportIssue('Tab layout still includes the non-existent screen reference "focus".', 'ERROR');
  } else {
    reportSuccess('Tabs layout declarations match the physically present tab screen files.');
  }
}

// 4. Run TypeScript Compiler
console.log('\n--- 4. Running TypeScript Compiler Diagnostics ---');
try {
  execSync('npx tsc --noEmit', { stdio: 'ignore' });
  reportSuccess('TypeScript compilation check passed with zero errors.');
} catch (error) {
  reportIssue('TypeScript compilation check failed. Run "npm run ts:check" for trace info.', 'ERROR');
}

console.log('\n-----------------------------------------------');
if (issuesFound === 0) {
  console.log('\x1b[32m[COMPLETE] Codebase Audit Passed. Zero bugs found!\x1b[0m\n');
} else {
  console.log(`\x1b[31m[COMPLETE] Audit finished with ${issuesFound} issue(s) detected.\x1b[0m\n`);
  process.exit(1);
}
