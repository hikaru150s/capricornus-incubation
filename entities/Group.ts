import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../classes';
import { ConstraintSatisfactionQualityLog } from './ConstsraintSatisfactionQualityLog';
import { FormationQualityLog } from './FormationQualityLog';
import { GoalSatisfactionQualityLog } from './GoalSatisfactionQualityLog';
import { GroupScoringLog } from './GroupScoringLog';
import { Student } from './Student';

@Entity({ name: 'group' })
export class Group extends BaseEntity {
  public static readonly tableName: string = 'group';

  @OneToMany(_type => ConstraintSatisfactionQualityLog, t => t.target)
  public constraintSatisfactionQualityLog: Promise<Array<ConstraintSatisfactionQualityLog>>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created_at: Date;

  @OneToMany(_type => FormationQualityLog, t => t.target)
  public formationQualityLog: Promise<Array<FormationQualityLog>>;

  @OneToMany(_type => GoalSatisfactionQualityLog, t => t.target)
  public goalSatisfactionQualityLog: Promise<Array<GoalSatisfactionQualityLog>>;

  @OneToMany(_type => GroupScoringLog, t => t.target)
  public groupScoringLog: Promise<Array<GroupScoringLog>>;

  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  public id: string;

  @OneToMany(_type => Student, t => t.group)
  public members: Promise<Array<Student>>;

  @Column({ type: 'varchar', length: 64 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  public name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public updated_at: Date;
}
