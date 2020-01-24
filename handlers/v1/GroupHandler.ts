import { validate } from 'class-validator';
import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Group } from '../../entities';
import { BadRequestError, GenericError, NotFoundError } from '../../errors';
import { asyncHandlers } from '../../middlewares';
import { parseRequest } from '../../utils';

export const router = Router();

router.get('/', asyncHandlers(async (req, res, next) => {
  try {
    const opts = parseRequest(req);
    let runner = getRepository(Group).createQueryBuilder('eval');
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
    console.log('Group Data:', result);
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
    const result = await getRepository(Group).findOneOrFail(req.params.id);
    res.status(200).json(result);
  } catch (e) {
    next(new NotFoundError(e.toString()));
  }
}));

router.post('/', asyncHandlers(async (req, res, next) => {
  try {
    const x = new Group();
    x.name = req.body.name;
    const err = await validate(x);
    if (err.length > 0) {
      throw new BadRequestError(err.join(', '));
    }
    const r = await getRepository(Group).save(x);
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
    const x = await getRepository(Group).findOneOrFail(req.params.id);
    x.name = req.body.name;
    x.updated_at = new Date();
    const err = await validate(x);
    if (err.length > 0) {
      throw new BadRequestError(err.join(', '));
    }
    const r = await getRepository(Group).save(x);
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
    const x = await getRepository(Group).delete({ id: req.params.id });
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
