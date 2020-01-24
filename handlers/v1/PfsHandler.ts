import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Group } from '../../entities';
import { GenericError } from '../../errors';
import { asyncHandlers } from '../../middlewares';
import { avg, cohort, satisfaction, stdDev } from '../../utils';

interface IPfsTreeRowStructure {
  // Common
  childEntries?: Array<IPfsTreeRowStructure>;
  cpSatisfaction?: number;
  cpValue?: number;
  expanded?: boolean;
  groupCohort?: number;
  // Group-only
  groupName?: string;
  groupSatisfaction?: number;
  groupStdDev?: number;
  kind: 'individual' | 'group';
  // Individual-only
  studentId?: string;
  studentName?: string;
}

export const router = Router();

router.get('/', asyncHandlers(async (req, res, next) => {
  try {
    let treeData: Array<IPfsTreeRowStructure> = [];
    const groups = await getRepository(Group).find();
    for await (const group of groups) {
      const students = await group.members;
      let leaf: Array<IPfsTreeRowStructure> = [];
      for await (const student of students) {
        const userRef = await student.user;
        const evaluationLogRef = await userRef.evaluationLogs;
        leaf.push({
          kind: 'individual',
          studentId: userRef.id,
          studentName: userRef.name,
          cpValue: avg(evaluationLogRef.map(v => v.value)),
          cpSatisfaction: 0,
        });
      }

      leaf = leaf.map((newLeaf, _index, leafRef) => {
        const scope = leafRef.map(v => v.cpValue);
        newLeaf.cpSatisfaction = satisfaction(newLeaf.cpValue, scope);
        return newLeaf;
      });

      treeData.push({
        kind: 'group',
        groupName: group.name,
        groupStdDev: stdDev(leaf.map(v => v.cpSatisfaction)),
        groupCohort: cohort(stdDev(leaf.map(v => v.cpSatisfaction))),
        groupSatisfaction: 0,
      });
    }

    treeData = treeData.map((newTreeData, _index, treeRef) => {
      const scope = treeRef.map(v => v.groupCohort);
      newTreeData.groupSatisfaction = satisfaction(newTreeData.groupCohort, scope);
      return newTreeData;
    });

    res.status(200).json({
      treeData,
      stdDev: stdDev(treeData.map(v => v.groupCohort)),
      cohort: cohort(stdDev(treeData.map(v => v.groupCohort))),
    });
  } catch (e) {
    next(new GenericError(e, 500));
  }
}));
