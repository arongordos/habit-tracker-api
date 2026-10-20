import request from 'supertest';
import { app } from '../src/server.ts';
import { cleanupDatabase, createTestUser } from './setup/dbHelpers.ts';

describe('Authentication endpoints', () => {
  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: 'testuser@test.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).not.toHaveProperty('password');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login the user', async () => {
      const testUser = await createTestUser();

      const userData = {
        email: testUser.user.email,
        password: testUser.password,
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).not.toHaveProperty('password');
    });
  });
});
