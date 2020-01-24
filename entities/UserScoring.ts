import { IsDate, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../classes';
import { UserScoringLog } from './UserScoringLog';

@Entity({ name: 'user_scoring' })
export class UserScoring extends BaseEntity {
  public static readonly tableName: string = 'user_scoring';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created_at: Date;

  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  public id: string;

  @Column({ type: 'varchar', length: 64 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  public name: string;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  @IsNotEmpty()
  @IsDate()
  public start: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public updated_at: Date;

  @OneToMany(_type => UserScoringLog, t => t.subject)
  public userScoringLog: Promise<Array<UserScoringLog>>;
}
