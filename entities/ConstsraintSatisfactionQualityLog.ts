import { IsNotEmpty, IsNumber } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { Constraint } from './Constraint';
import { Goal } from './Goal';
import { Group } from './Group';

@Entity({ name: 'constraint_satisfaction_quality_log' })
export class ConstraintSatisfactionQualityLog {

  @ManyToOne(_type => Constraint, t => t.constraintSatisfactionQualityLog)
  public constraint: Promise<Constraint>;

  @RelationId((t: ConstraintSatisfactionQualityLog) => t.constraint)
  public constraintId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created_at: Date;

  @ManyToOne(_type => Goal, t => t.constraintSatisfactionQualityLog)
  public goal: Promise<Goal>;

  @RelationId((t: ConstraintSatisfactionQualityLog) => t.goal)
  public goalId: string;

  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  public id: string;

  @Column({ type: 'bigint', unsigned: true })
  public reviewer: string;

  @ManyToOne(_type => Group, t => t.constraintSatisfactionQualityLog)
  public target: Promise<Group>;

  @RelationId((t: ConstraintSatisfactionQualityLog) => t.target)
  public targetId: string;

  @Column({ type: 'integer' })
  @IsNotEmpty()
  @IsNumber()
  public value: number;
}
