import { middleware as cache } from 'apicache';
import { Router } from 'express';
import { getRepository, IsNull, Not } from 'typeorm';
import {
  EvaluationLog,
  GroupScoringLog,
  Question,
  Student,
  UserScoringLog,
} from '../../entities';
import { GenericError } from '../../errors';
import { asyncHandlers, jwtGuard } from '../../middlewares';

export const router = Router();

enum EvalContext {
  SHR = 'Sharing resources/ideas',
  NEG = 'Negotiating ideas',
  REG = 'Regulating problem solving activities',
  MAI = 'Maintaining positive communications',
}

enum CorrelationContext {
  COGNITIVE = 'Cognitive',
  SKILL = 'Skill',
  COLLABORATION_PERFORMANCE = 'Collaboration Performance',
}

interface IEvaluationGroupData {
  id: string;
  name: string;
  status: boolean;
}

interface INameValuePair {
  name: string;
  value: number;
}

interface INameSeriesPair {
  name: string;
  series: Array<INameValuePair>;
}

interface ICardData {
  evaluation: Array<INameSeriesPair>;
  group: Array<INameSeriesPair>;
  groupAverage: number;
  groupData: Array<INameSeriesPair>;
  user: Array<INameSeriesPair>;
  userAverage: number;
}

interface IHashRecord {
  [subjectName: string]: Array<INameValuePair>;
}

interface IEvalHashRecord {
  [subjectName: string]: {
    [context in EvalContext]: {
      count: number;
      sum: number;
    };
  };
}

interface IGroupEvalHashRecord {
  [memberName: string]: IEvalHashRecord;
}

interface ISummary {
  correlationCoefficient: number;
  left: CorrelationContext;
  n: number;
  right: CorrelationContext;
  significance: number;
}

async function generateCardFromStudent(userId: string): Promise<ICardData> {
  const result: ICardData = {
    user: [],
    group: [],
    evaluation: [],
    userAverage: 0,
    groupData: [],
    groupAverage: 0,
  };

  const studentRef = await getRepository(Student).findOne({ where: { userId } });
  const groupRef = await studentRef.group;

  const userScoringLog = await getRepository(UserScoringLog).find({ where: { targetId: userId } });
  const userRecord: IHashRecord = {};
  for await (const score of userScoringLog) {
    const subject = await score.subject;
    if (!userRecord[subject.name]) {
      userRecord[subject.name] = [];
    }
    userRecord[subject.name].push({
      name: `${subject.name} ${score.session.toLowerCase()}-test`,
      value: score.value,
    });
  }

  const groupScoringLog = await getRepository(GroupScoringLog).find({ where: { targetId: groupRef.id } });
  const groupRecord: IHashRecord = {};
  for await (const score of groupScoringLog) {
    const subject = await score.subject;
    if (!groupRecord[subject.name]) {
      groupRecord[subject.name] = [];
    }
    groupRecord[subject.name].push({
      name: subject.name,
      value: score.value,
    });
  }

  const evaluationLog = await getRepository(EvaluationLog).find({ where: { targetId: userId } });
  const evalRecord: IEvalHashRecord = {};
  for await (const score of evaluationLog) {
    const subject = await score.subject;
    if (!evalRecord[subject.name]) {
      evalRecord[subject.name] = {
        'Sharing resources/ideas': { sum: 0, count: 0 },
        'Negotiating ideas': { sum: 0, count: 0 },
        'Regulating problem solving activities': { sum: 0, count: 0 },
        'Maintaining positive communications': { sum: 0, count: 0 },
      };
    }
    //const questionRef = await score.question;
    const questionRef = { id: parseInt(score.questionId, 10) };
    let target: EvalContext = EvalContext.MAI;
    if (questionRef.id >= 1 && questionRef.id <= 3) {
      target = EvalContext.SHR;
    } else if (questionRef.id >= 4 && questionRef.id <= 13) {
      target = EvalContext.NEG;
    } else if (questionRef.id >= 14 && questionRef.id <= 23) {
      target = EvalContext.REG;
    }
    evalRecord[subject.name][target].sum += score.value;
    evalRecord[subject.name][target].count += 1;
  }

  const userAverage: { avgValue: number | string } = await getRepository(EvaluationLog)
    .createQueryBuilder('usrAvg')
    .where('usrAvg.targetId = :targetId', { targetId: userId })
    .select('avg(usrAvg.value)', 'avgValue')
    .getRawOne();

  const groupMemberAverage: Array<number> = [];
  const groupMemberRef = await groupRef.members;
  const groupData: IGroupEvalHashRecord = {};
  for await (const member of groupMemberRef) {
    const memberRef = await member.user;
    if (!groupData[memberRef.name]) {
      groupData[memberRef.name] = {};
    }
    const memberEvalLog = await getRepository(EvaluationLog).find({ where: { targetId: memberRef.id } });
    for await (const score of memberEvalLog) {
      const subject = await score.subject;
      if (!groupData[memberRef.name][subject.name]) {
        groupData[memberRef.name][subject.name] = {
          'Sharing resources/ideas': { sum: 0, count: 0 },
          'Negotiating ideas': { sum: 0, count: 0 },
          'Regulating problem solving activities': { sum: 0, count: 0 },
          'Maintaining positive communications': { sum: 0, count: 0 },
        };
      }
      //const questionRef = await score.question;
      const questionRef = { id: parseInt(score.questionId, 10) };
      let target: EvalContext = EvalContext.MAI;
      if (questionRef.id >= 1 && questionRef.id <= 3) {
        target = EvalContext.SHR;
      } else if (questionRef.id >= 4 && questionRef.id <= 13) {
        target = EvalContext.NEG;
      } else if (questionRef.id >= 14 && questionRef.id <= 23) {
        target = EvalContext.REG;
      }
      groupData[memberRef.name][subject.name][target].sum += score.value;
      groupData[memberRef.name][subject.name][target].count += score.value;
    }

    const q = getRepository(EvaluationLog)
      .createQueryBuilder('usrAvg')
      .where('usrAvg.targetId = :targetId', { targetId: memberRef.id })
      .select('avg(usrAvg.value)', 'avgValue');
    const memberAverage: { avgValue: number | string } = await q.getRawOne();
    groupMemberAverage.push(parseInt(memberAverage.avgValue ? memberAverage.avgValue.toString() : '0', 10));
  }

  let groupAverage = 0;
  groupAverage = groupMemberAverage.length > 0 ? groupMemberAverage.reduce((p, c) => p + c) : 0;

  result.user = Object.keys(userRecord).map(k => ({
    name: k,
    series: userRecord[k],
  }));
  result.group = Object.keys(groupRecord).map(k => ({
    name: k,
    series: groupRecord[k],
  }));
  result.evaluation = Object.keys(evalRecord).map(k => ({
    name: k,
    series: Object.keys(evalRecord[k]).map((x: EvalContext) => ({
      name: x.toString(),
      value: evalRecord[k][x].count !== 0 ? evalRecord[k][x].sum / evalRecord[k][x].count : 0,
    })),
  }));
  result.userAverage = parseInt(userAverage.avgValue ? userAverage.avgValue.toString() : '0', 10);
  result.groupData = Object.keys(groupData).map(k => {
    const name = k;
    const mapped = Object.keys(groupData[k]).map(v => groupData[k][v]);
    const series = mapped.reduce((p, c) => {
      Object.keys(p).forEach((context: EvalContext) => {
        p[context] += c[context].count === 0 ? 0 : c[context].sum / c[context].count;
      });
      return p;
    }, {
      'Sharing resources/ideas': 0,
      'Negotiating ideas': 0,
      'Regulating problem solving activities': 0,
      'Maintaining positive communications': 0,
    });
    return {
      name,
      series: Object.keys(series).map(v => ({
        name: v,
        value: series[v],
      })),
    };
  });
  result.groupAverage = groupAverage;

  return result;
}

function sum(values: Array<number>): number {
  return values.reduce((p, c) => p + c, 0);
}

function avg<T>(data: Array<T>, mapper: (value?: T, index?: number, arr?: Array<T>) => number): number {
  return data.length === 0 ? 0 : data.map(mapper).reduce((p, c) => p += c, 0) / data.length;
}

function correlation(x: Array<number>, y: Array<number>): number {
  if (x.length !== y.length && x.length > 0) {
    throw new RangeError('X length and Y length are mismatch or 0!');
  } else {
    const up = (x.length * sum(x.map((v, i) => v * y[i]))) - (sum(x) * sum(y));
    const down =
      Math.sqrt((x.length * sum(x.map(v => v ** 2))) - (sum(x) ** 2)) *
      Math.sqrt((y.length * sum(y.map(v => v ** 2))) - (sum(y) ** 2));
    return down === 0 ? 0 : (up / down);
  }
}

function significance(x: Array<number>, y: Array<number>): number {
  if (x.length !== y.length && x.length > 0) {
    throw new RangeError('X length and Y length are mismatch or 0!');
  } else {
    const coef = correlation(x, y);
    return coef * Math.sqrt((x.length - 2) / (1 - (coef ** 2)));
  }
}

router.get('/form/:userId/eval/:evalId', jwtGuard, asyncHandlers(async (req, res, next) => {
  try {
    const result: Array<IEvaluationGroupData> = [];
    const studentData = await getRepository(Student)
      .createQueryBuilder()
      .where('userId = :userId', { userId: req.params.userId })
      .getOne();
    if (studentData && studentData.group) {
      const group = await studentData.group;
      const groupMember = await group.members;
      const questionCount = await getRepository(Question).count();
      for await (const member of groupMember) {
        const userRef = await member.user;
        result.push({
          id: userRef.id,
          name: userRef.name,
          status: (await getRepository(EvaluationLog).count({
            where: {
              reviewer: req.params.userId,
              subject: req.params.evalId,
              target: userRef.id,
            },
          })) === questionCount,
        });
      }
    }
    res.status(200).json(result);
  } catch (e) {
    if (e instanceof GenericError) {
      next(e);
    } else {
      next(new GenericError(e, 500));
    }
  }
}));

router.get('/card/:userId', jwtGuard, asyncHandlers(async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const result: ICardData = await generateCardFromStudent(userId);

    res.status(200).json(result);
  } catch (e) {
    if (e instanceof GenericError) {
      next(e);
    } else {
      next(new GenericError(e, 500));
    }
  }
}));

router.get('/summary', jwtGuard, asyncHandlers(async (req, res, next) => {
  try {
    const studentsRef = await getRepository(Student).find({
      where: {
        groupId: Not(IsNull()),
      },
    });
    //const students = await Promise.all(studentsRef.map(v => v.user));
    //console.log('Fecthing');
    const dataset = await Promise.all(studentsRef.map(v => generateCardFromStudent(v.userId)));
    //console.log('dataset:', dataset);
    const cog = dataset.map(card => {
      return avg(card.user, (nameSeries) => {
        return avg(nameSeries.series, (nameValue) => nameValue.value);
      });
    });
    //console.log('cog:', cog);
    const col = dataset.map(card => card.userAverage);
    //console.log('col:', col);
    const ski = dataset.map(card => {
      return avg(card.group, (nameSeries) => {
        return avg(nameSeries.series, (nameValue) => nameValue.value);
      });
    });
    //console.log('ski:', ski);
    const dataSelect = (scope: CorrelationContext) => {
      switch (scope) {
        case CorrelationContext.COGNITIVE: { return cog; }
        case CorrelationContext.COLLABORATION_PERFORMANCE: { return col; }
        case CorrelationContext.SKILL: { return ski; }
        default: { return []; }
      }
    };
    //console.log('dataSelect:', dataSelect);

    const scope = [
      CorrelationContext.COGNITIVE,
      CorrelationContext.COLLABORATION_PERFORMANCE,
      CorrelationContext.SKILL,
    ];
    let result: Array<ISummary> = [];
    for (let left = 0; left < scope.length; left++) {
      for (let right = left + 1; right < scope.length; right++) {
        result.push({
          left: scope[left],
          right: scope[right],
          correlationCoefficient: 0,
          significance: 0,
          n: 0,
        });
      }
    }
    //console.log('result:', result);
    result = result.map(v => {
      const x = dataSelect(v.left);
      const y = dataSelect(v.right);
      v.correlationCoefficient = correlation(x, y);
      v.significance = significance(x, y);
      v.n = x.length;
      return v;
    });
    //console.log('result:', result);
    res.status(200).json(result);
  } catch (e) {
    //console.error('Err:', e);
    if (e instanceof GenericError) {
      next(e);
    } else {
      next(new GenericError(e, 500));
    }
  }
}));
