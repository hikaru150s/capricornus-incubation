import { IsNotEmpty, IsNumber } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { BaseEntity } from '../classes';
import { ScoringSesionType } from '../enums';
import { User } from './User';
import { UserScoring } from './UserScoring';

@Entity({ name: 'user_scoring_log' })
export class UserScoringLog extends BaseEntity {
  public static readonly tableName: string = 'user_scoring_Log';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created_at: Date;

  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  public id: string;

  @Column({ type: 'bigint', unsigned: true })
  public reviewer: number;

  @Column({ type: 'enum', enum: ScoringSesionType, default: ScoringSesionType.PRE })
  public session: ScoringSesionType;

  @ManyToOne(_type => UserScoring, t => t.userScoringLog)
  public subject: Promise<UserScoring>;

  @RelationId((t: UserScoringLog) => t.subject)
  public subjectId: string;

  @ManyToOne(_type => User, t => t.userScoringLogs)
  public target: Promise<User>;

  @RelationId((t: UserScoringLog) => t.target)
  public targetId: string;

  @Column({ type: 'integer' })
  @IsNotEmpty()
  @IsNumber()
  public value: number;
}
