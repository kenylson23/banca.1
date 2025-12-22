#!/usr/bin/env node

/**
 * Generate a secure SESSION_SECRET for the application
 * 
 * Usage:
 *   node scripts/generate-session-secret.js
 * 
 * This will generate a cryptographically secure random string
 * suitable for use as SESSION_SECRET in your environment variables.
 */

import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 Generated SESSION_SECRET:\n');
console.log(secret);
console.log('\n📋 Instructions:\n');
console.log('1. Copy the secret above');
console.log('2. In Render Dashboard:');
console.log('   - Go to your service > Environment');
console.log('   - Add/Update: SESSION_SECRET = <paste the secret>');
console.log('   - Click "Save Changes"');
console.log('\n3. For local development:');
console.log('   - Add to your .env file:');
console.log(`   SESSION_SECRET=${secret}`);
console.log('\n⚠️  Keep this secret secure and never commit it to version control!\n');
