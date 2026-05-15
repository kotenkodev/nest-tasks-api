import request from 'supertest';
import { AppModule } from './../src/app.module';
import { TestSetup } from './config/utils/test-setup';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/user.entity';
import { Role } from '../src/users/dtos/role.enum';
import { PasswordService } from '../src/users/password/password.service';
import { JwtService } from '@nestjs/jwt';

describe('AppController (e2e)', () => {
  let testSetup: TestSetup;

  beforeEach(async () => {
    testSetup = await TestSetup.create(AppModule);
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  afterAll(async () => {
    await testSetup.teardown();
  });

  const testUser = {
    email: 'test@example.com',
    password: 'Password123!',
    name: 'Test User',
  };

  it('auth/register (POST)', () => {
    return request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.email).toBe(testUser.email);
        expect(res.body.name).toBe(testUser.name);
        expect(res.body.password).toBeUndefined();
      });
  });

  it('auth/register (POST) - duplicate email', async () => {
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    return request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(409);
  });

  it('auth/login (POST)', async () => {
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    return request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });
  });

  it('should require auth', async () => {
    await request(testSetup.app.getHttpServer()).post('/tasks').expect(401);
  });

  it('should allow public route access', async () => {
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send(testUser)
      .expect(201);
  });

  it('should include roles in JWT token', async () => {
    const userRepo = testSetup.app.get(getRepositoryToken(User));

    await userRepo.save({
      ...testUser,
      password: await testSetup.app
        .get(PasswordService)
        .hash(testUser.password),
      roles: [Role.ADMIN, Role.USER],
    });

    const response = await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    const decoded = testSetup.app
      .get(JwtService)
      .verify(response.body.accessToken);

    expect(decoded.roles).toEqual(
      expect.arrayContaining([Role.ADMIN, Role.USER]),
    );
  });

  it('auth/profile (GET)', async () => {
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    const response = await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    const token = response.body.accessToken;

    await request(testSetup.app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(testUser)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(testUser.email);
        expect(res.body.name).toBe(testUser.name);
        expect(res.body.password).toBeUndefined();
      });
  });

  it('/auth/admin (GET) - admin access', async () => {
    const userRepo = testSetup.app.get(getRepositoryToken(User));

    await userRepo.save({
      ...testUser,
      password: await testSetup.app
        .get(PasswordService)
        .hash(testUser.password),
      roles: [Role.ADMIN, Role.USER],
    });

    const response = await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    const token = response.body.accessToken;

    await request(testSetup.app.getHttpServer())
      .get('/auth/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('/auth/admin (GET) - admin access', async () => {
    const userRepo = testSetup.app.get(getRepositoryToken(User));

    await userRepo.save({
      ...testUser,
      password: await testSetup.app
        .get(PasswordService)
        .hash(testUser.password),
      roles: [Role.ADMIN, Role.USER],
    });

    const response = await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    const token = response.body.accessToken;

    await request(testSetup.app.getHttpServer())
      .get('/auth/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('This is for admins only!');
      });
  });

  it('/auth/admin (GET) - non-admin access', async () => {
    const userRepo = testSetup.app.get(getRepositoryToken(User));

    await userRepo.save({
      ...testUser,
      password: await testSetup.app
        .get(PasswordService)
        .hash(testUser.password),
      roles: [Role.USER],
    });

    const response = await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    const token = response.body.accessToken;

    await request(testSetup.app.getHttpServer())
      .get('/auth/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
      .expect((res) => {
        expect(res.body.message).toBe('Forbidden resource');
      });
  });

  it('/auth/admin (GET) - non-authorized access', async () => {
    await request(testSetup.app.getHttpServer())
      .get('/auth/admin')
      .expect(401)
      .expect((res) => {
        expect(res.body.message).toBe('Unauthorized');
      });
  });

  it('/auth/register (POST) - attempting to register as admin', async () => {
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send({ ...testUser, roles: [Role.ADMIN] })
      .expect(201)
      .expect((res) => {
        expect(res.body.roles).toEqual(expect.arrayContaining([Role.USER]));
        expect(res.body.roles).not.toEqual(
          expect.arrayContaining([Role.ADMIN]),
        );
      });
  });
});
