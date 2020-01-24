import { IsDate, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../classes';
import { GroupScoringLog } from './GroupScoringLog';

@Entity({ name: 'group_scoring' })
export class GroupScoring extends BaseEntity {
  public static readonly tableName: string = 'group_scoring';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created_at: Date;

  @OneToMany(_type => GroupScoringLog, t => t.subject)
  public groupScoringLog: Promise<Array<GroupScoringLog>>;

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
