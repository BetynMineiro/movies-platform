import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ActorsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdActorId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin@123',
      });

    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/actors (POST)', () => {
    it('should create an actor', () => {
      return request(app.getHttpServer())
        .post('/actors')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Keanu Reeves',
          nationality: 'Canadian',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('Keanu Reeves');
          createdActorId = res.body.data.id;
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/actors')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '',
          nationality: '',
        })
        .expect(400);
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/actors')
        .send({
          name: 'Unauthorized Actor',
          nationality: 'Unknown',
        })
        .expect(401);
    });
  });

  describe('/actors (GET)', () => {
    it('should return paginated actors', () => {
      return request(app.getHttpServer())
        .get('/actors')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.meta).toHaveProperty('limit');
          expect(res.body.meta).toHaveProperty('hasNext');
        });
    });

    it('should filter actors by name', () => {
      return request(app.getHttpServer())
        .get('/actors')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ name: 'Keanu' })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          if (res.body.data.length > 0) {
            expect(res.body.data[0].name).toContain('Keanu');
          }
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer()).get('/actors').expect(401);
    });
  });

  describe('/actors/:id (GET)', () => {
    it('should return a single actor', () => {
      return request(app.getHttpServer())
        .get(`/actors/${createdActorId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id', createdActorId);
          expect(res.body.data).toHaveProperty('name');
        });
    });

    it('should return 404 for non-existent actor', () => {
      return request(app.getHttpServer())
        .get('/actors/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/actors/:id (PATCH)', () => {
    it('should update an actor', () => {
      return request(app.getHttpServer())
        .patch(`/actors/${createdActorId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Keanu Reeves Updated',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.name).toBe('Keanu Reeves Updated');
        });
    });

    it('should return 404 for non-existent actor', () => {
      return request(app.getHttpServer())
        .patch('/actors/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('/actors/:id (DELETE)', () => {
    it('should delete an actor', () => {
      return request(app.getHttpServer())
        .delete(`/actors/${createdActorId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('should return 404 for non-existent actor', () => {
      return request(app.getHttpServer())
        .delete('/actors/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
