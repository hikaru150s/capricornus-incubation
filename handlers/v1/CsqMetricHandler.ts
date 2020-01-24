import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Constraint, Goal, Group } from '../../entities';
import { GenericError } from '../../errors';
import { asyncHandlers } from '../../middlewares';
import { cohort, satisfaction, stdDev } from '../../utils';

interface ICsqMetric {
  data: {
    [goalName: string]: {
      [constraintName: string]: number;
    };
  };
  groupId: string;
  groupName: string;
  metric: {
    [goalName: string]: {
      [constrainName: string]: number;
    };
  };
}

interface ICsqGoalStructure {
  name: string;
  span: number;
}

interface ICsqConstraintStructure {
  [constraintName: string]: {
    cohort: number;
    stdDev: number;
  };
}

interface ICache<T> {
  [id: number]: T;
}

export const router = Router();

router.get('/', asyncHandlers(async (req, res, next) => {
  try {
    const groups = await getRepository(Group).find();
    let metric: Array<ICsqMetric> = [];
    let goalStruct: Array<ICsqGoalStructure> = [];
    const constraintStruct: ICsqConstraintStructure = {};
    const goalCache: ICache<Goal> = {};
    const constraintCache: ICache<Constraint> = {};

    for await (const group of groups) {
      const newItem: ICsqMetric = {
        groupId: group.id,
        groupName: group.name,
        data: {},
        metric: {},
      };
      const csq = await group.constraintSatisfactionQualityLog;
      for await (const row of csq) {
        if (!goalCache[row.goalId]) {
          goalCache[row.goalId] = await row.goal;
        }
        if (!constraintCache[row.constraintId]) {
          constraintCache[row.constraintId] = await row.constraint;
        }
        if (!newItem.data[goalCache[row.goalId].name]) {
          newItem.data[goalCache[row.goalId].name] = {};
          newItem.metric[goalCache[row.goalId].name] = {};
        }
        newItem.data[goalCache[row.goalId].name][constraintCache[row.constraintId].name] = row.value;
        newItem.metric[goalCache[row.goalId].name][constraintCache[row.constraintId].name] = 0;
      }
      metric.push(newItem);
    }

    metric = metric.map((row, _index, matrixRef) => {
      Object.keys(row.metric).forEach(goal => {
        Object.keys(row.metric[goal]).forEach(constraint => {
          const scope: Array<number> = matrixRef.map(v => v.data[goal][constraint]);
          row.metric[goal][constraint] = satisfaction(row.data[goal][constraint], scope);
          constraintStruct[constraint] = {
            stdDev: stdDev(scope),
            cohort: cohort(stdDev(scope)),
          };
        });
      });
      return row;
    });

    goalStruct = Object.keys(goalCache).map(id => {
      const target = goalCache[parseInt(id.toString(), 10)]?.name;
      if (target) {
        return {
          name: target,
          span: Math.max(...metric.map(r => Object.keys(r.data[target]).length)),
        };
      } else {
        return null;
      }
    }).filter(v => v !== null);

    res.status(200).json({
      metric,
      goalStruct,
      constraintStruct,
    });
  } catch (e) {
    next(new GenericError(e, 500));
  }
}));
