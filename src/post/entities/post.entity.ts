import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('post')
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text', nullable: false })
  text: string;

  @Column({ type: 'boolean', default: false })
  edited: boolean;

  @Column({ type: 'integer', default: 0 })
  viewed_times: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;
}
