import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('follows')
@Index(['follower', 'followed'], { unique: true })
export class Follow {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.following, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  follower: User;

  @ManyToOne(() => User, (user) => user.followers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  followed: User;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
