import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Constraint, Goal, Group } from '../../entities';
import { GenericError } from '../../errors';
import { asyncHandlers } from '../../middlewares';
import { avg, cohort, satisfaction, stdDev } from '../../utils';

interface IGsqMetric {
  constraintAverage: number;
  constraintSatisfaction: number;
  data: {
    [goalName: string]: {
      [constraintName: string]: number;
    };
  };
  groupId: string;
  groupName: string;
}

interface IGsqGoalStructure {
  name: string;
  span: number;
}

interface ICache<T> {
  [id: number]: T;
}

export const router = Router();

router.get('/', asyncHandlers(async (req, res, next) => {
  try {
    const groups = await getRepository(Group).find();
    let metric: Array<IGsqMetric> = [];
    let goalStruct: Array<IGsqGoalStructure> = [];
    const goalCache: ICache<Goal> = {};
    const constraintCache: ICache<Constraint> = {};

    for await (const group of groups) {
      const newItem: IGsqMetric = {
        groupId: group.id,
        groupName: group.name,
        data: {},
        constraintAverage: 0,
        constraintSatisfaction: 0,
      };
      const gsq = await group.goalSatisfactionQualityLog;
      for await (const row of gsq) {
        if (!goalCache[row.goalId]) {
          goalCache[row.goalId] = await row.goal;
        }
        if (!constraintCache[row.constraintId]) {
          constraintCache[row.constraintId] = await row.constraint;
        }
        if (!newItem.data[goalCache[row.goalId].name]) {
          newItem.data[goalCache[row.goalId].name] = {};
        }
        newItem.data[goalCache[row.goalId].name][constraintCache[row.constraintId].name] = row.value;
      }
      newItem.constraintAverage = avg(gsq.map(v => v.value));
      metric.push(newItem);
    }

    metric = metric.map((newMetric, _index, metricRef) => {
      const scope = metricRef.map(v => v.constraintAverage);
      newMetric.constraintSatisfaction = satisfaction(newMetric.constraintAverage, scope);
      return newMetric;
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
      stdDev: stdDev(metric.map(v => v.constraintAverage)),
      cohort: cohort(stdDev(metric.map(v => v.constraintAverage))),
    });
  } catch (e) {
    next(new GenericError(e, 500));
  }
}));
