import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../classes';
import { EvaluationLog } from './EvaluationLog';

@Entity({ name: 'question' })
export class Question extends BaseEntity {
  public static readonly tableName: string = 'question';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created_at: Date;

  @OneToMany(_type => EvaluationLog, el => el.question, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  public evaluationLogs: Promise<Array<EvaluationLog>>;

  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  public id: string;

  @Column({ type: 'varchar', length: 64 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  public subject: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public updated_at: Date;
}
