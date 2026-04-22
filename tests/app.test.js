const request = require('supertest');
const app = require('../src/app');

beforeEach(async () => {
  await request(app).post('/api/tasks/reset');
});

// ─── Health Check ────────────────────────────────────────────────────────────
describe('GET /health', () => {
  test('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ─── GET /api/tasks ──────────────────────────────────────────────────────────
describe('GET /api/tasks', () => {
  test('returns an empty list after reset', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.tasks)).toBe(true);
    expect(res.body.tasks.length).toBe(0);
  });
});

// ─── POST /api/tasks ─────────────────────────────────────────────────────────
describe('POST /api/tasks', () => {
  test('creates a new task with a valid title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Learn GitHub Actions' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.task.title).toBe('Learn GitHub Actions');
    expect(res.body.task.done).toBe(false);
    expect(res.body.task.id).toBeDefined();
  });

  test('rejects a task with an empty title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Title is required');
  });

  test('rejects a task with no title field', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── PATCH /api/tasks/:id ────────────────────────────────────────────────────
describe('PATCH /api/tasks/:id', () => {
  test('toggles a task from not done to done', async () => {
    const create = await request(app)
      .post('/api/tasks')
      .send({ title: 'Deploy to Render' });

    const id = create.body.task.id;

    const res = await request(app).patch(`/api/tasks/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.task.done).toBe(true);
  });

  test('returns 404 for a non-existent task', async () => {
    const res = await request(app).patch('/api/tasks/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/tasks/:id ───────────────────────────────────────────────────
describe('DELETE /api/tasks/:id', () => {
  test('deletes an existing task', async () => {
    const create = await request(app)
      .post('/api/tasks')
      .send({ title: 'Write tests' });

    const id = create.body.task.id;

    const del = await request(app).delete(`/api/tasks/${id}`);
    expect(del.statusCode).toBe(200);
    expect(del.body.success).toBe(true);

    const list = await request(app).get('/api/tasks');
    expect(list.body.tasks.find(t => t.id === id)).toBeUndefined();
  });

  test('returns 404 when deleting a non-existent task', async () => {
    const res = await request(app).delete('/api/tasks/9999');
    expect(res.statusCode).toBe(404);
  });
});
