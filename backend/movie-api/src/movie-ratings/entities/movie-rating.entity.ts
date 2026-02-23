import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';

@Entity('movie_ratings')
export class MovieRating {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int')
  score: number;

  @Column('text', { nullable: true })
  comment?: string;

  @ManyToOne(() => Movie, (movie) => movie.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie: Movie;

  @Column()
  movieId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
