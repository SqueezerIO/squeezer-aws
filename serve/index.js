'use strict';

const Promise       = require('bluebird');
const AwsServeEvent = require('./lib');

/**
 * Class that serves a Squeezer project
 */
class AwsServe {
  constructor(sqz) {
    this.sqz = sqz;
  }

  /**
   * Serve the current project
   */
  run() {
    return new Promise((resolve) => {
      const awsServeEvent = new AwsServeEvent(this.sqz);

      process.on('serveEvent', (event) => {
        awsServeEvent.run(event.req, event.res, event.data);
      });

      resolve();
    });
  }
}

module.exports = AwsServe;
