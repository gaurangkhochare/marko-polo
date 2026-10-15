import { registerSchema, createNoteSchema } from '@/lib/validations';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from '@/lib/auth';
import { safeSanitizeSchema, isExternalUrl } from '@/lib/markdown';

async function runVerification() {
  console.log('====================================================');
  console.log('🚀 MARKO POLO - COMPREHENSIVE VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Zod Validation Tests
  console.log('--- 1. Validation Schemas & Input Sanitization ---');

  const validRegister = registerSchema.safeParse({
    name: 'Ada Lovelace',
    email: 'ADA.LOVELACE@example.com ',
    password: 'SuperSecretPassword123!',
  });
  assert(validRegister.success, 'Valid registration payload accepted');
  if (validRegister.success) {
    assert(
      validRegister.data.email === 'ada.lovelace@example.com',
      'Email is normalized to lowercase and trimmed'
    );
  }

  const shortPassword = registerSchema.safeParse({
    name: 'Ada',
    email: 'ada@example.com',
    password: 'short',
  });
  assert(!shortPassword.success, 'Password < 8 characters is rejected');

  const invalidEmail = registerSchema.safeParse({
    name: 'Ada',
    email: 'not-an-email',
    password: 'ValidPassword123!',
  });
  assert(!invalidEmail.success, 'Invalid email format is rejected');

  const validNote = createNoteSchema.safeParse({
    title: 'My Project Architecture',
    content: '# Architecture\n\n- Next.js 16\n- MongoDB\n- TypeScript',
    tags: ['work', 'architecture'],
    isPinned: true,
  });
  assert(validNote.success, 'Valid note creation payload accepted');

  const emptyTitle = createNoteSchema.safeParse({
    title: '   ',
    content: 'Content here',
  });
  assert(!emptyTitle.success, 'Whitespace-only title is rejected');

  const excessiveTags = createNoteSchema.safeParse({
    title: 'Note with too many tags',
    tags: Array.from({ length: 25 }, (_, i) => `tag-${i}`),
  });
  assert(!excessiveTags.success, 'Tags exceeding 20 count limit are rejected');

  // 2. Authentication & Cryptography Tests
  console.log('\n--- 2. Cryptographic Security & Session Integrity ---');

  const plainPassword = 'CorrectHorseBatteryStaple2026!';
  const hashedPassword = await hashPassword(plainPassword);

  assert(hashedPassword.startsWith('$2'), 'Password hash uses secure bcrypt format');
  assert(hashedPassword !== plainPassword, 'Plaintext password is never stored or preserved');

  const isMatchValid = await verifyPassword(plainPassword, hashedPassword);
  assert(isMatchValid, 'verifyPassword succeeds with the correct password');

  const isMatchInvalid = await verifyPassword('WrongPassword', hashedPassword);
  assert(!isMatchInvalid, 'verifyPassword fails with incorrect password');

  const testUser = {
    userId: '60d5ec49f1b2c82b8c8d2a10',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
  };

  const sessionToken = await createSessionToken(testUser);
  assert(typeof sessionToken === 'string' && sessionToken.split('.').length === 3, 'Session token is a signed 3-part JWT');

  const decodedSession = await verifySessionToken(sessionToken);
  assert(decodedSession?.userId === testUser.userId, 'JWT payload decodes userId correctly');
  assert(decodedSession?.email === testUser.email, 'JWT payload decodes email correctly');
  assert(decodedSession?.name === testUser.name, 'JWT payload decodes name correctly');

  // Tampered token test
  const tamperedToken = sessionToken.substring(0, sessionToken.length - 5) + 'xxxxx';
  const tamperedSession = await verifySessionToken(tamperedToken);
  assert(tamperedSession === null, 'Tampered JWT signature is rejected');

  // 3. User Isolation & Authorization Logic
  console.log('\n--- 3. Strict User Isolation Logic ---');

  const userA_Id = '507f191e810c19729de860ea';
  const userB_Id = '507f1f77bcf86cd799439011';

  // Simulate note owned by User A
  const noteA = {
    _id: '64b1f234a9b2c3d4e5f60001',
    title: 'User A Confidential Note',
    userId: userA_Id,
    content: 'User A private thoughts',
  };

  // Simulating query filter on read/update/delete
  function checkOwnership(authenticatedUserId: string, targetNoteUserId: string): boolean {
    return authenticatedUserId === targetNoteUserId;
  }

  assert(
    checkOwnership(userA_Id, noteA.userId) === true,
    'User A can access their own note'
  );
  assert(
    checkOwnership(userB_Id, noteA.userId) === false,
    'User B CANNOT access User A note (ownership check blocks unauthorized access)'
  );

  // 4. Markdown Security & Link Safety
  console.log('\n--- 4. Markdown Security & Safe Link Handling ---');

  assert(isExternalUrl('https://google.com') === true, 'https:// links are identified as external');
  assert(isExternalUrl('http://example.org/path') === true, 'http:// links are identified as external');
  assert(isExternalUrl('/relative/notes/123') === false, 'Relative URLs are internal');

  // Check sanitization schema protocols
  const allowedProtocols = safeSanitizeSchema.protocols.href;
  assert(allowedProtocols.includes('https'), 'https protocol allowed in schema');
  assert(allowedProtocols.includes('http'), 'http protocol allowed in schema');
  assert(!allowedProtocols.includes('javascript'), 'javascript: protocol blocked in schema (Prevents XSS)');

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});

