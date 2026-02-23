import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { Actor } from '../../actors/entities/actor.entity';
import { MovieRating } from '../../movie-ratings/entities/movie-rating.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  releaseYear: number;

  @Column()
  genre: string;

  @ManyToMany(() => Actor, (actor) => actor.movies)
  @JoinTable({ name: 'movie_actors' })
  actors?: Actor[];

  @OneToMany(() => MovieRating, (rating) => rating.movie)
  ratings?: MovieRating[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
