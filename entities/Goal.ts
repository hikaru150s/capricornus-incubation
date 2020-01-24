import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ConstraintSatisfactionQualityLog } from './ConstsraintSatisfactionQualityLog';
import { FormationQualityLog } from './FormationQualityLog';
import { GoalSatisfactionQualityLog } from './GoalSatisfactionQualityLog';

@Entity({ name: 'Goals' })
export class Goal {

  @OneToMany(_type => ConstraintSatisfactionQualityLog, el => el.goal)
  public constraintSatisfactionQualityLog: Promise<Array<ConstraintSatisfactionQualityLog>>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created_at: Date;

  @Column({ type: 'text' })
  @IsNotEmpty()
  @IsString()
  public description: string;

  @OneToMany(_type => FormationQualityLog, el => el.goal)
  public formationQualityLog: Promise<Array<FormationQualityLog>>;

  @OneToMany(_type => GoalSatisfactionQualityLog, el => el.goal)
  public goalSatisfactionQualityLog: Promise<Array<GoalSatisfactionQualityLog>>;

  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  public id: string;

  @Column({ type: 'varchar', length: 64 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  public name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public updated_at: Date;
}
