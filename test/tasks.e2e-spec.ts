import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestSetup } from './config/utils/test-setup';
import { TaskStatus } from '../src/tasks/task.model';

describe('TasksController (e2e)', () => {
  let testSetup: TestSetup;

  const testUser = {
    email: 'test@example.com',
    password: 'Password123!',
    name: 'Test User',
  };
  let authToken;
  let taskId;

  beforeEach(async () => {
    testSetup = await TestSetup.create(AppModule);

    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    let response = await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });

    authToken = response.body.accessToken;

    response = await request(testSetup.app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Task',
        description: 'This is a test task',
        status: TaskStatus.OPEN,
        labels: [{ name: 'urgent' }, { name: 'backend' }],
      })
      .expect(201);

    taskId = response.body.id;
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  afterAll(async () => {
    await testSetup.teardown();
  });

  it('/tasks (POST) - create task', async () => {
    await request(testSetup.app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Another Test Task',
        description: 'This is another test task',
        status: TaskStatus.OPEN,
        labels: [{ name: 'important' }],
      })
      .expect(201);
  });

  it('should not allow access to other users tasks', async () => {
    const otherUser = {
      email: 'other@test.com',
      password: 'Password123!',
      name: 'Other User',
    };

    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(otherUser);

    let response = await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send(otherUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });

    const otherAuthToken = response.body.accessToken;

    response = await request(testSetup.app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${otherAuthToken}`)
      .expect(403);
  });

  it('should list users tasks only', async () => {
    await request(testSetup.app.getHttpServer())
      .get(`/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.meta.total).toBe(1);
      });

    const otherUser = {
      email: 'other@test.com',
      password: 'Password123!',
      name: 'Other User',
    };

    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(otherUser);

    const response = await request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send(otherUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });

    const otherAuthToken = response.body.accessToken;

    await request(testSetup.app.getHttpServer())
      .get(`/tasks`)
      .set('Authorization', `Bearer ${otherAuthToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.meta.total).toBe(0);
      });
  });
});
