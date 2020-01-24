import { IsDate, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EvaluationLog } from '.';
import { BaseEntity } from '../classes';

@Entity({ name: 'evaluation' })
export class Evaluation extends BaseEntity {
  public static readonly tableName: string = 'evaluation';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created_at: Date;

  @OneToMany(_type => EvaluationLog, el => el.subject, {
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
  public name: string;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  @IsNotEmpty()
  @IsDate()
  public start: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public updated_at: Date;

}
