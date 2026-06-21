// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app, getMongoDb } from './server';
import fs from 'fs';
import path from 'path';

beforeAll(async () => {
  // Ensure we use mock DB or clear real DB test user if connected
  try {
    const db = await getMongoDb();
    if (db && typeof db.collection === 'function') {
      const credentialsCollection = db.collection("credentials");
      if (credentialsCollection && typeof credentialsCollection.deleteOne === 'function') {
        await credentialsCollection.deleteOne({ email: 'testuser@example.com' });
      }
    }
  } catch (e) {
    // Ignore error if deleteOne doesn't exist on mock DB or connection times out
  }

  const credPath = path.join(process.cwd(), 'mock_db_credentials.json');
  if (fs.existsSync(credPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      const filtered = data.filter((u: any) => u.email !== 'testuser@example.com');
      fs.writeFileSync(credPath, JSON.stringify(filtered, null, 2), 'utf8');
    } catch (_) {}
  }
});

describe('Express REST API Integration Tests', () => {
  
  it('should sign up a new user and set session cookie', async () => {
    const signupData = {
      email: 'testuser@example.com',
      password: 'password123',
      name: 'Test Pilot'
    };

    const res = await request(app)
      .post('/api/auth/signup')
      .send(signupData);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('testuser@example.com');
    expect(res.body.displayName).toBe('Test Pilot');
    expect(res.body.token).toBeDefined();

    // Verify Set-Cookie header contains session_token
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const cookieArray = Array.isArray(cookies) ? cookies : typeof cookies === 'string' ? [cookies] : [];
    const hasSessionCookie = cookieArray.some((c: string) => c.includes('session_token='));
    expect(hasSessionCookie).toBe(true);
  });

  it('should fail signup on invalid email schema', async () => {
    const signupData = {
      email: 'invalid-email-no-at',
      password: 'short',
      name: 'Tester'
    };

    const res = await request(app)
      .post('/api/auth/signup')
      .send(signupData);

    console.log("INVALID SIGNUP BODY:", res.status, res.body);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should sign in an existing user and return a cookie', async () => {
    const signinData = {
      email: 'testuser@example.com',
      password: 'password123'
    };

    const res = await request(app)
      .post('/api/auth/signin')
      .send(signinData);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('testuser@example.com');
    expect(res.body.token).toBeDefined();
  });

  it('should fail sync if not authenticated', async () => {
    const syncData = {
      uid: 'some-uid',
      user: {
        name: 'Alex',
        region: 'US',
        householdSize: 2,
        lifestyleProfile: 'urban',
        transportHabits: 'mixed',
        foodPreference: 'mixed',
        homeEnergy: 'grid_avg',
        shoppingHabits: 'average',
        flightFrequency: 'occasional',
        wasteHabits: 'recycles_some',
        goalPreference: 'reduce_carbon',
        climatePersona: 'Climate Starter'
      },
      footprint: null,
      activityLogs: [],
      goals: []
    };

    const res = await request(app)
      .post('/api/user/sync')
      .send(syncData);

    expect(res.status).toBe(401);
  });
});
