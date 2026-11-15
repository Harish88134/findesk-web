import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { authService } from '../src/services/auth.service';
import { dbStore } from '../src/repositories/db.store';

describe('Authentication Service Suite', () => {
  before(async () => {
    await dbStore.init();
  });

  it('should successfully authenticate an existing seeded user', async () => {
    const result = await authService.login({
      email: 'alex@finance.dev',
      password: 'Password123!',
    });

    assert.ok(result);
    assert.strictEqual(result.user.email, 'alex@finance.dev');
    assert.ok(result.tokens.accessToken);
    assert.ok(result.tokens.refreshToken);
  });

  it('should reject invalid password', async () => {
    await assert.rejects(
      async () => {
        await authService.login({
          email: 'alex@finance.dev',
          password: 'WrongPassword!',
        });
      },
      /Invalid email or password./
    );
  });

  it('should register a new user and generate valid JWT tokens', async () => {
    const testEmail = `tester_${Date.now()}@finance.dev`;
    const result = await authService.register({
      name: 'Test Engineer',
      email: testEmail,
      password: 'Password123!',
    });

    assert.strictEqual(result.user.name, 'Test Engineer');
    assert.strictEqual(result.user.email, testEmail);
    assert.ok(result.tokens.accessToken);
  });
});
