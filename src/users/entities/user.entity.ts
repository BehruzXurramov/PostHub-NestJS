import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Follow } from '../../follows/entities/follow.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 15, nullable: false, unique: true })
  username: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 510, nullable: false })
  hashed_password: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_active: boolean;

  @Column({ type: 'varchar', length: 1020, nullable: true })
  hashed_refresh_token: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[]

  @OneToMany(() => Follow, (follow) => follow.followed)
  followers: Follow[]
}
