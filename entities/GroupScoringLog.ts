import { IsNotEmpty, IsNumber } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { BaseEntity } from '../classes';
import { Group } from './Group';
import { GroupScoring } from './GroupScoring';

@Entity({ name: 'group_scoring_log' })
export class GroupScoringLog extends BaseEntity {
  public static readonly tableName: string = 'group_scoring_log';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public created_at: Date;

  @PrimaryGeneratedColumn('increment', { type: 'bigint', unsigned: true })
  public id: string;

  @Column({ type: 'bigint', unsigned: true })
  public reviewer: number;

  @ManyToOne(_type => GroupScoring, t => t.groupScoringLog)
  public subject: Promise<GroupScoring>;

  @RelationId((t: GroupScoringLog) => t.subject)
  public subjectId: string;

  @ManyToOne(_type => Group, t => t.groupScoringLog)
  public target: Promise<Group>;

  @RelationId((t: GroupScoringLog) => t.target)
  public targetId: string;

  @Column({ type: 'integer' })
  @IsNotEmpty()
  @IsNumber()
  public value: number;
}
