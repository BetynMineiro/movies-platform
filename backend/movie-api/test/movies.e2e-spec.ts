import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdMovieId: string;

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

    // Login to get access token
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

  describe('/movies (POST)', () => {
    it('should create a movie', () => {
      return request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'The Matrix',
          description:
            'A computer hacker learns about the true nature of reality',
          releaseYear: 1999,
          genre: 'Sci-Fi',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.title).toBe('The Matrix');
          createdMovieId = res.body.data.id;
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/movies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '',
          releaseYear: 'invalid',
        })
        .expect(400);
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/movies')
        .send({
          title: 'Unauthorized Movie',
          description: 'Test',
          releaseYear: 2024,
          genre: 'Action',
        })
        .expect(401);
    });
  });

  describe('/movies (GET)', () => {
    it('should return paginated movies', () => {
      return request(app.getHttpServer())
        .get('/movies')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.meta).toHaveProperty('limit');
          expect(res.body.meta).toHaveProperty('hasNext');
        });
    });

    it('should filter movies by title', () => {
      return request(app.getHttpServer())
        .get('/movies')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ title: 'Matrix' })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeInstanceOf(Array);
          if (res.body.data.length > 0) {
            expect(res.body.data[0].title).toContain('Matrix');
          }
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer()).get('/movies').expect(401);
    });
  });

  describe('/movies/:id (GET)', () => {
    it('should return a single movie', () => {
      return request(app.getHttpServer())
        .get(`/movies/${createdMovieId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id', createdMovieId);
          expect(res.body.data).toHaveProperty('title');
        });
    });

    it('should return 404 for non-existent movie', () => {
      return request(app.getHttpServer())
        .get('/movies/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('/movies/:id (PATCH)', () => {
    it('should update a movie', () => {
      return request(app.getHttpServer())
        .patch(`/movies/${createdMovieId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'The Matrix Updated',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.title).toBe('The Matrix Updated');
        });
    });

    it('should return 404 for non-existent movie', () => {
      return request(app.getHttpServer())
        .patch('/movies/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('/movies/:id (DELETE)', () => {
    it('should delete a movie', () => {
      return request(app.getHttpServer())
        .delete(`/movies/${createdMovieId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('should return 404 for non-existent movie', () => {
      return request(app.getHttpServer())
        .delete('/movies/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
