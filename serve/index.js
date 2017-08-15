'use strict';

const Promise = require('bluebird');
const AwsCallback     = require('./lib');

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
    return new Promise(() => {
      const awsCallback = new AwsCallback(this.sqz);

      this.sqz.serve.run(awsCallback);
    });
  }
}

module.exports = AwsServe;
