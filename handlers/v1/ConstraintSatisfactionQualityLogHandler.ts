import { validate } from 'class-validator';
import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Constraint, ConstraintSatisfactionQualityLog, Goal, Group } from '../../entities';
import { BadRequestError, GenericError, NotFoundError } from '../../errors';
import { asyncHandlers } from '../../middlewares';
import { parseRequest } from '../../utils';

export const router = Router();

router.get('/', asyncHandlers(async (req, res, next) => {
  try {
    const opts = parseRequest(req);
    let runner = getRepository(ConstraintSatisfactionQualityLog).createQueryBuilder('eval');
    Object.keys(opts.filter).forEach((k, i) => {
      const cmd = `eval.${k} like :v`;
      const val = { v: `%${opts.filter[k]}%` };
      runner = (i === 0) ? runner.where(cmd, val) : runner.andWhere(cmd, val);
    });
    const result = await runner
      .orderBy(opts.sort, opts.direction)
      .skip(opts.page * opts.limit)
      .take(opts.limit)
      .getManyAndCount();

    res.header('x-total-count', result[1].toString()).status(200).json(result[0]);
  } catch (e) {
    if (e instanceof GenericError) {
      next(e);
    } else {
      next(new GenericError(e, 500));
    }
  }
}));

router.get('/:id', asyncHandlers(async (req, res, next) => {
  try {
    const result = await getRepository(ConstraintSatisfactionQualityLog).findOneOrFail(req.params.id);
    res.status(200).json(result);
  } catch (e) {
    next(new NotFoundError(e.toString()));
  }
}));

router.post('/', asyncHandlers(async (req, res, next) => {
  try {
    const x = new ConstraintSatisfactionQualityLog();
    x.constraint = getRepository(Constraint).findOne(req.body.constraintId);
    x.goal = getRepository(Goal).findOne(req.body.goalId);
    x.reviewer = req.body.reviewer;
    x.target = getRepository(Group).findOne(req.body.targetId);
    x.value = req.body.value;
    const err = await validate(x);
    if (err.length > 0) {
      throw new BadRequestError(err.join(', '));
    }
    x.constraintId = req.body.constraintId;
    x.goalId = req.body.goalId;
    x.targetId = req.body.targetId;
    const r = await getRepository(ConstraintSatisfactionQualityLog).save(x);
    // Here comes the problem, 'r' said it saved but in db it was null
    const debug = {
      constraint: await r.constraint,
      goal: await r.goal,
      target: await r.target,
      prefetch: await getRepository(ConstraintSatisfactionQualityLog).findOne().then(x => Promise.all([
        x.constraint,
        x.goal,
        x.target,
      ])),
    };
    res.status(201).json(r);
  } catch (e) {
    if (e instanceof GenericError) {
      next(e);
    } else {
      next(new GenericError(e, 500));
    }
  }
}));

router.put('/:id', asyncHandlers(async (req, res, next) => {
  try {
    const x = await getRepository(ConstraintSatisfactionQualityLog).findOneOrFail(req.params.id);
    x.constraint = getRepository(Constraint).findOne(req.body.constraintId);
    x.goal = getRepository(Goal).findOne(req.body.goalId);
    x.reviewer = req.body.reviewer;
    x.target = getRepository(Group).findOne(req.body.targetId);
    x.value = req.body.value;
    const err = await validate(x);
    if (err.length > 0) {
      throw new BadRequestError(err.join(', '));
    }
    const r = await getRepository(ConstraintSatisfactionQualityLog).save(x);
    res.status(200).json(r);
  } catch (e) {
    if (e instanceof GenericError) {
      next(e);
    } else {
      next(new GenericError(e, 500));
    }
  }
}));

router.delete('/:id', asyncHandlers(async (req, res, next) => {
  try {
    const x = await getRepository(ConstraintSatisfactionQualityLog).delete({ id: req.params.id });
    if (x.affected > 0) {
      res.status(204);
    } else {
      throw new NotFoundError();
    }
  } catch (e) {
    if (e instanceof GenericError) {
      next(e);
    } else {
      next(new GenericError(e, 500));
    }
  }
}));
