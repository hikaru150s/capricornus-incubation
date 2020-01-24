import { IsNotEmpty, IsNumber } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { BaseEntity } from '../classes';
import { IPersonality } from '../interfaces';
import { Group } from './Group';
import { User } from './User';

@Entity({ name: 'student', withoutRowid: true })
export class Student extends BaseEntity {

  get felderScore(): number {
    return this.active_reflective;
  }
  public static readonly tableName: string = 'student';

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  public active_reflective: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created_at: Date;

  @ManyToOne(_type => Group, t => t.members, { nullable: true })
  public group?: Promise<Group>;

  @RelationId((t: Student) => t.group)
  public groupId?: string;

  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  public id: string;

  @Column({
    type: 'simple-json',
  })
  public personality: IPersonality;

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  public sensing_intuitive: number;

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  public sequential_global: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public updated_at: Date;

  @OneToOne(_type => User)
  @JoinColumn()
  public user: Promise<User>;

  @RelationId((t: Student) => t.user)
  public userId: string;

  @Column({ type: 'integer', default: 0 })
  @IsNumber()
  public visual_verbal: number;
}
