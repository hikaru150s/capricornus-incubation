import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseEntity } from '../classes';
import { UserRoleType } from '../enums';
import { EvaluationLog } from './EvaluationLog';
import { UserScoringLog } from './UserScoringLog';

@Entity({ name: 'user' })
export class User extends BaseEntity {
  public static readonly tableName: string = 'user';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created_at: Date;

  @Column({ type: 'varchar', length: 191, unique: true })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MaxLength(191)
  public email: string;

  @OneToMany(_type => EvaluationLog, el => el.target)
  public evaluationLogs: Promise<Array<EvaluationLog>>;

  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  public id: string;

  @Column({ type: 'varchar', length: 64 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  public name: string;

  @Column({ type: 'varchar', length: 512 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(512)
  public password: string;

  @Column({ type: 'enum', enum: UserRoleType, default: UserRoleType.STUDENT })
  @IsNotEmpty()
  @IsIn([UserRoleType.STUDENT, UserRoleType.TEACHER])
  public role: UserRoleType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public updated_at: Date;

  @OneToMany(_type => UserScoringLog, el => el.target)
  public userScoringLogs: Promise<Array<UserScoringLog>>;
}
