import { IsNotEmpty, IsNumber } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { Constraint } from './Constraint';
import { Goal } from './Goal';
import { Group } from './Group';

@Entity({ name: 'formation_quality_log' })
export class FormationQualityLog {

  @ManyToOne(_type => Constraint, t => t.formationQualityLog)
  public constraint: Promise<Constraint>;

  @RelationId((t: FormationQualityLog) => t.constraint)
  public constraintId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created_at: Date;

  @ManyToOne(_type => Goal, t => t.formationQualityLog)
  public goal: Promise<Goal>;

  @RelationId((t: FormationQualityLog) => t.goal)
  public goalId: string;

  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  public id: string;

  @Column({ type: 'bigint', unsigned: true })
  public reviewer: number;

  @ManyToOne(_type => Group, t => t.formationQualityLog)
  public target: Promise<Group>;

  @RelationId((t: FormationQualityLog) => t.target)
  public targetId: string;

  @Column({ type: 'integer' })
  @IsNotEmpty()
  @IsNumber()
  public value: number;
}
