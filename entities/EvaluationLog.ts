import { IsNotEmpty, IsNumber } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { BaseEntity } from '../classes';
import { Evaluation } from './Evaluation';
import { Question } from './Question';
import { User } from './User';

@Entity({ name: 'evaluation_log' })
export class EvaluationLog extends BaseEntity {
  public static readonly tableName: string = 'evaluation_log';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created_at: Date;

  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  public id: string;

  @ManyToOne(_type => Question, t => t.evaluationLogs, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  public question: Promise<Question>;

  @RelationId((t: EvaluationLog) => t.question)
  public questionId: string;

  @Column({ type: 'bigint', unsigned: true })
  public reviewer: string;

  @ManyToOne(_type => Evaluation, t => t.evaluationLogs, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  public subject: Promise<Evaluation>;

  @RelationId((t: EvaluationLog) => t.subject)
  public subjectId: string;

  @ManyToOne(_type => User, t=> t.evaluationLogs, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  public target: Promise<User>;

  @RelationId((t: EvaluationLog) => t.target)
  public targetId: string;

  @Column({ type: 'integer' })
  @IsNotEmpty()
  @IsNumber()
  public value: number;
}
