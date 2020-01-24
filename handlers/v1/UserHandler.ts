import { validate } from 'class-validator';
import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Student, User } from '../../entities';
import { UserRoleType } from '../../enums';
import { BadRequestError, GenericError, NotFoundError } from '../../errors';
import { asyncHandlers, jwtGuard } from '../../middlewares';
import { generatePassword, parseRequest } from '../../utils';

export const router = Router();

router.get('/', jwtGuard, asyncHandlers(async (req, res, next) => {
  try {
    const opts = parseRequest(req);
    let runner = getRepository(User).createQueryBuilder('eval');
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

    res.header('x-total-count', result[1].toString()).status(200).json(result[0].map(v => {
      v.password = undefined;
      return v;
    }));
  } catch (e) {
    if (e instanceof GenericError) {
      next(e);
    } else {
      next(new GenericError(e, 500));
    }
  }
}));

router.get('/:id', jwtGuard, asyncHandlers(async (req, res, next) => {
  try {
    const result = await getRepository(User).findOneOrFail(req.params.id);
    result.password = undefined;
    res.status(200).json(result);
  } catch (e) {
    next(new NotFoundError(e.toString()));
  }
}));

router.post('/', asyncHandlers(async (req, res, next) => {
  try {
    const x = new User();
    x.email = req.body.email;
    x.name = req.body.name;
    x.password = await generatePassword(req.body.password);
    x.role = req.body.role;
    const err = await validate(x);
    if (err.length > 0) {
      throw new BadRequestError(err.join(', '));
    }
    const r = await getRepository(User).save(x);
    if (r.role === UserRoleType.STUDENT) {
      const y = new Student();
      y.active_reflective = 0;
      y.sensing_intuitive = 0;
      y.sequential_global = 0;
      y.visual_verbal = 0;
      y.user = Promise.resolve(r);
      await getRepository(Student).save(y);
    }
    r.password = undefined;
    res.status(201).json(r);
  } catch (e) {
    if (e instanceof GenericError) {
      next(e);
    } else {
      next(new GenericError(e, 500));
    }
  }
}));

router.put('/:id', jwtGuard, asyncHandlers(async (req, res, next) => {
  try {
    const x = await getRepository(User).findOneOrFail(req.params.id);
    const roleBefore = x.role;
    x.email = req.body.email;
    x.name = req.body.name;
    x.password = await generatePassword(req.body.password);
    x.role = req.body.role;
    x.updated_at = new Date();
    const err = await validate(x);
    if (err.length > 0) {
      throw new BadRequestError(err.join(', '));
    }
    const r = await getRepository(User).save(x);
    if (roleBefore === UserRoleType.TEACHER && r.role === UserRoleType.STUDENT) {
      const y = new Student();
      y.active_reflective = 0;
      y.sensing_intuitive = 0;
      y.sequential_global = 0;
      y.visual_verbal = 0;
      y.user = Promise.resolve(r);
      await getRepository(Student).save(y);
    } else if (roleBefore === UserRoleType.STUDENT && r.role === UserRoleType.TEACHER) {
      await getRepository(Student).delete({ userId: r.id });
    }
    r.password = undefined;
    res.status(200).json(r);
  } catch (e) {
    if (e instanceof GenericError) {
      next(e);
    } else {
      next(new GenericError(e, 500));
    }
  }
}));

router.delete('/:id', jwtGuard, asyncHandlers(async (req, res, next) => {
  try {
    const x = await getRepository(User).delete({ id: req.params.id });
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
