import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as http from 'http';
import { AddressInfo } from 'net';
import { join } from 'path';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { FORCE_DB } from './globals/Constants';
import {
  errorHandler,
  logger,
  notFoundHandler,
} from './handlers/generic';
import {
  ConstraintHandler,
  ConstraintSatisfactionQualityLogHandler,
  CsqMetricHandler,
  EvaluationFormHandler,
  EvaluationHandler,
  EvaluationLogHandler,
  FormationQualityLogHandler,
  FqHandler,
  GoalHandler,
  GoalSatisfactionQualityLogHandler,
  GroupHandler,
  GroupScoringHandler,
  GroupScoringLogHandler,
  GsqHandler,
  LoginHandler,
  LogoutHandler,
  PfsHandler,
  QuestionHandler,
  StudentHandler,
  UserHandler,
  UserScoringHandler,
  UserScoringLogHandler,
} from './handlers/v1';
import { jwtGuard } from './middlewares';

let config: MysqlConnectionOptions = require('./ormconfig.json');
const centaurus = express();
const logDir = join(__dirname, 'logs');

centaurus.disable('x-powered-by');
centaurus.set('etag', 'strong');
centaurus.set('port', process.env.PORT || 8000);

centaurus.use(logger(logDir));
centaurus.use(bodyParser.json({ 'strict': true }));
centaurus.use(cors({
  allowedHeaders: ['x-total-count', 'Content-Type', 'Authorization'],
  exposedHeaders: ['x-total-count', 'Content-Type', 'Authorization'],
}));

// Main Handler
centaurus.use('/api/user', UserHandler);
centaurus.use('/api/group', jwtGuard, GroupHandler);
centaurus.use('/api/student', jwtGuard, StudentHandler);
centaurus.use('/api/user_scoring', jwtGuard, UserScoringHandler);
centaurus.use('/api/group_scoring', jwtGuard, GroupScoringHandler);
centaurus.use('/api/eval', jwtGuard, EvaluationHandler);
centaurus.use('/api/question', jwtGuard, QuestionHandler);
centaurus.use('/api/user_scoring_log', jwtGuard, UserScoringLogHandler);
centaurus.use('/api/group_scoring_log', jwtGuard, GroupScoringLogHandler);
centaurus.use('/api/eval_log', jwtGuard, EvaluationLogHandler);
centaurus.use('/api/goal', jwtGuard, GoalHandler);
centaurus.use('/api/constraint', jwtGuard, ConstraintHandler);
centaurus.use('/api/csq/log', jwtGuard, ConstraintSatisfactionQualityLogHandler);
centaurus.use('/api/csq/metric', jwtGuard, CsqMetricHandler);
centaurus.use('/api/fq/log', jwtGuard, FormationQualityLogHandler);
centaurus.use('/api/fq/metric', jwtGuard, FqHandler);
centaurus.use('/api/gsq/log', jwtGuard, GoalSatisfactionQualityLogHandler);
centaurus.use('/api/gsq/metric', jwtGuard, GsqHandler);
centaurus.use('/api/pfs/metric', jwtGuard, PfsHandler);
centaurus.use('/api', EvaluationFormHandler);
centaurus.use('/api/login', LoginHandler);
centaurus.use('/api/logout', LogoutHandler);

// Catch 404 error
centaurus.use(notFoundHandler);

// Handle Error
centaurus.use(errorHandler);

(async () => {
  try {
    if (FORCE_DB) {
      // Connect to root to check if db is exists
      const master = await createConnection({
        type: config.type,
        host: config.host,
        port: config.port,
        username: 'root',
        password: '',
        synchronize: false,
        cache: false,
      });
      const hasDB = await master.createQueryRunner().hasDatabase('corona');
      if (!hasDB) {
        await master.createQueryRunner().createDatabase('corona', true);
        config = {...config,  synchronize: true};
      }
      await master.close();
      // Close root and establish user-level connection
    }
    const connection = await createConnection(config);
    /*
     * Trivial DB Creation (performance)
     *
     * create database if not exists corona
     * default character set = "utf8mb4"
     * default collate = "utf8mb4_unicode_ci"
     */
    const server = http.createServer(centaurus).listen(centaurus.get('port'), () => {
      server.setTimeout(300000);
      const now = new Date().toISOString();
      const listeningPort = (server.address() as AddressInfo).port;
      console.log('Server Time:', now);
      console.log(`Server started in [${now}], listening to port ${listeningPort}.`);
      console.log('Database Status:', connection.isConnected ? 'Connected' : 'Disconnected');
    });
  } catch (err) {
    console.error('Error in DB:', err);
    process.exit();
  }
})();
