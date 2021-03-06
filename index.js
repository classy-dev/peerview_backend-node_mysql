'use strict';

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const config = require(__dirname + '/config');
const sprintf = require('util').format;
const log = require('bunyan').createLogger(config.appLog);
const dbcron = require('./tools/cron/backup-db');
const offlineusersendemailcron = require('./tools/cron/user-72hours-offline-email');

if (cluster.isMaster && !process.env.SINGLE_PROCESS) {
  log.info('Master Process is online');

  offlineusersendemailcron.initialize();
  
  for (let w = 0; w < numCPUs; w++) {
    cluster.fork();
  }
  cluster.on('exit', function (worker) {
    log.error({ pid: worker.process.pid }, 'Worker died');
    cluster.fork();
  });

  cluster.on('online', function (worker) {
    log.info({ pid: worker.process.pid }, 'New Worker online');
  });
} else {
  dbcron.initialize();
  let api = require(__dirname + '/api');

  api.use(function (error, req, res, next) {
    res.status(500).send({
      status: 'ERROR',
      status_code: 100,
      status_message: error.message,
      http_code: 500
    });

    next();
  });

  process.nextTick(function () {
    api.listen(config.server.port, function () {
      log.info(sprintf('Server accepting requests on port %d',
        config.server.port));
    });
  });
}

process.on('uncaughtException', function psUncaughtException (error) {
  log.fatal({ err: error }, 'Uncaught Exception. Killing process now.');
  process.kill(1);
});
