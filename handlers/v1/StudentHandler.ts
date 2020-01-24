import { validate } from 'class-validator';
import { Router } from 'express';
import { getRepository } from 'typeorm';
import { Group, Student } from '../../entities';
import { UserRoleType } from '../../enums';
import { BadRequestError, GenericError, NotFoundError } from '../../errors';
import { IPersonality } from '../../interfaces';
import { asyncHandlers } from '../../middlewares';
import { parseRequest } from '../../utils';

export const router = Router();

router.get('/', asyncHandlers(async (req, res, next) => {
  try {
    const opts = parseRequest(req);
    let runner = getRepository(Student).createQueryBuilder('eval');
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
    const mapped: Array<{
      active_reflective: number;
      created_at: string | number | Date;
      email: string;
      groupId: string;
      id?: string;
      name: string;
      personality: IPersonality;
      role: UserRoleType;
      sensing_intuitive: number;
      sequential_global: number;
      updated_at: string | number | Date;
      visual_verbal: number;
    }> = [];
    for await (const student of result[0]) {
      const userRef = await student.user;
      mapped.push({
        created_at: userRef.created_at,
        updated_at: userRef.updated_at,
        id: student.id,
        name: userRef.name,
        email: userRef.email,
        role: userRef.role,
        personality: student.personality,
        groupId: student.groupId,
        active_reflective: student.active_reflective,
        sensing_intuitive: student.sensing_intuitive,
        sequential_global: student.sequential_global,
        visual_verbal: student.visual_verbal,
      });
    }
    res.header('x-total-count', result[1].toString()).status(200).json(mapped);
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
    const student = await getRepository(Student).findOneOrFail(req.params.id);
    const userRef = await student.user;
    const mapped = {
      created_at: userRef.created_at,
      updated_at: userRef.updated_at,
      id: student.id,
      name: userRef.name,
      email: userRef.email,
      role: userRef.role,
      personality: student.personality,
      groupId: student.groupId,
      active_reflective: student.active_reflective,
      sensing_intuitive: student.sensing_intuitive,
      sequential_global: student.sequential_global,
      visual_verbal: student.visual_verbal,
    };
    res.status(200).json(mapped);
  } catch (e) {
    next(new NotFoundError(e.toString()));
  }
}));

//router.post('/', asyncHandlers(async (req, res, next) => {
//  try {
//    const x = new Student();
//    if (req.body && req.body.groupId) {
//      x.group = getRepository(Group).findOne(req.body.groupId);
//    }
//    x.active_reflective = req.body && req.body.active_reflective ? req.body.active_reflective : 0;
//    x.sensing_intuitive = req.body && req.body.sensing_intuitive ? req.body.sensing_intuitive : 0;
//    x.sequential_global = req.body && req.body.sequential_global ? req.body.sequential_global : 0;
//    x.visual_verbal = req.body && req.body.visual_verbal ? req.body.visual_verbal : 0;
//    const err = await validate(x);
//    if (err.length > 0) {
//      throw new BadRequestError(err.join(', '));
//    }
//    const r = await getRepository(Student).save(x);
//    res.status(201).json(r);
//  } catch (e) {
//    if (e instanceof GenericError) {
//      next(e);
//    } else {
//      next(new GenericError(e, 500));
//    }
//  }
//}));

router.put('/:id', asyncHandlers(async (req, res, next) => {
  try {
    const x = await getRepository(Student).findOneOrFail(req.params.id);
    if (req.body?.groupId) {
      x.group = getRepository(Group).findOne(req.body.groupId);
    }
    x.personality = req.body?.personality ? req.body.personality : {
      O: 0,
      C: 0,
      E: 0,
      A: 0,
      N: 0,
    };
    x.active_reflective = req.body?.active_reflective ? req.body.active_reflective : 0;
    x.sensing_intuitive = req.body?.sensing_intuitive ? req.body.sensing_intuitive : 0;
    x.sequential_global = req.body?.sequential_global ? req.body.sequential_global : 0;
    x.visual_verbal = req.body?.visual_verbal ? req.body.visual_verbal : 0;
    x.updated_at = new Date();
    const err = await validate(x);
    if (err.length > 0) {
      throw new BadRequestError(err.join(', '));
    }
    const student = await getRepository(Student).save(x);
    const userRef = await student.user;
    const mapped = {
      created_at: userRef.created_at,
      updated_at: userRef.updated_at,
      id: student.id,
      name: userRef.name,
      email: userRef.email,
      role: userRef.role,
      personality: student.personality,
      groupId: student.groupId,
      active_reflective: student.active_reflective,
      sensing_intuitive: student.sensing_intuitive,
      sequential_global: student.sequential_global,
      visual_verbal: student.visual_verbal,
    };
    res.status(200).json(mapped);
  } catch (e) {
    if (e instanceof GenericError) {
      next(e);
    } else {
      next(new GenericError(e, 500));
    }
  }
}));

//router.delete('/:id', asyncHandlers(async (req, res, next) => {
//  try {
//    const x = await getRepository(Student).delete({ id: req.params.id });
//    if (x.affected > 0) {
//      res.status(204);
//    } else {
//      throw new NotFoundError();
//    }
//  } catch (e) {
//    if (e instanceof GenericError) {
//      next(e);
//    } else {
//      next(new GenericError(e, 500));
//    }
//  }
//}));
