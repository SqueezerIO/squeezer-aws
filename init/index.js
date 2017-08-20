'use strict';

const AWS        = require('aws-sdk');
const AwsStorage = require('./common/storage');
const AwsUtils   = require('./common/utils');
const colors     = require('colors');
const homeConfig = require('home-config');
const Promise    = require('bluebird');
const crypto     = require('crypto');

/**
 * Init AWS cloud
 */
class AWSCredentials {
  constructor(sqz) {
    this.sqz = sqz;

    this.sqz.vars.aws = {
      cloudFormation : {},
      cfOutputs      : {},
      uploads        : []
    };
  }

  run() {
    return new Promise((resolve) => {
      this.loadCredentials();

      this.sqz.cloud.storage = new AwsStorage(this.sqz);
      this.sqz.cloud.utils   = new AwsUtils(this.sqz);

      resolve();
    });
  }

  loadCredentials() {
    const awsProfile = this.sqz.config.get('aws_profile');
    const cfg        = homeConfig.load('.aws/config');
    const configData = cfg.getAll()[`profile ${awsProfile}`] || {};

    this.sqz.vars.aws.profile = awsProfile || null;
    this.sqz.vars.aws.region  = configData.region || 'us-east-1';

    if (!awsProfile || !configData) {
      this.sqz.cli.log.error(
        'Credentials error , please check : \n\n' +
        `${colors.blue.bold('https://docs.squeezer.io/clouds/aws/credentials.html')} `
      );
    }

    AWS.config.credentials =
      new AWS.SharedIniFileCredentials({ profile : awsProfile });
    AWS.config.update({ region : this.sqz.vars.aws.region });

    this.sqz.aws = AWS;

    this.sqz.vars.project.deploymentIdentifier =
      `${crypto.createHash('md5').update(AWS.config.credentials.accessKeyId).digest('hex')}` +
      `-${this.sqz.vars.stage}`;
  }
}

module.exports = AWSCredentials;
