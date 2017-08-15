'use strict';

const _       = require('lodash');
const Promise = require('bluebird');
const AWS     = require('aws-sdk');
const colors  = require('colors');

const cfClient = new AWS.CloudFormation();

/**
 * Class that build the AWS API gateway context
 */
class AWSRunLib {
  constructor(sqz) {
    this.sqz = sqz;
  }

  loadEnvVars(microservice) {
    return new Promise((resolve) => {
      const params = {
        StackName : `${this.sqz.vars.project.identifier}-${this.sqz.vars.stage}`
      };
      const env = microservice.envCompiled;

      process.env.AWS_PROFILE = this.sqz.vars.aws.profile;
      process.env.AWS_REGION = this.sqz.vars.aws.region;

      const cloudformationOutputExists = Object.keys(env).reduce((curr, val) => {
        const varValue = env[val];
        if (varValue && (typeof varValue === 'string') && varValue.match(/.*\.Outputs\..*/)) {
          curr = true;
        }
        return curr;
      }, false);
      // console.log(cloudformationOutputExists)

      if (cloudformationOutputExists) {
        cfClient.describeStacks(params, (err, res) => {
          let formattedOutputs = {};

          if (err) {
            this.sqz.cli.log.warn(err);
            this.sqz.cli.log.warn('Your project uses CloudFormation outputs , please deploy your project !');
          }

          if (res) {
            formattedOutputs = res.Stacks[0].Outputs.reduce((curr, val) => {
              curr[val.OutputKey] = val.OutputValue;
              return curr;
            }, {});
          }

          const compiledOutputs = Object.keys(microservice.envCompiled)
            .reduce((curr, key) => {
              const val = microservice.envCompiled[key];
              if (val && (typeof val === 'string') && val.match(/.*\.Outputs\..*/)) {
                const output = val.split('.')[2];
                if (_.has(formattedOutputs, output)) {
                  curr[key] = formattedOutputs[output];
                } else {
                  this.sqz.cli.log.warn(
                    `Cannot set ENV variable ${colors.blue.bold(key)}, missing ` +
                    `${colors.blue.bold(output)} output from the main stack `
                  );
                }
              } else {
                curr[key] = val;
              }

              return curr;
            }, {});

          AWS.config.credentials  = new AWS.SharedIniFileCredentials(
            {
              profile : process.env.AWS_PROFILE
            }
          );

          _.assign(process.env, compiledOutputs);

          return resolve();
        });
      } else {
        resolve();
      }
    });
  }

  findFunction(name) {
    let data = null;

    _.forEach(this.sqz.vars.microservices, (microservice) => {
      _.forEach(microservice.functions, (funcVal, funcName) => {
        if (funcName === name) {
          data = {};
          _.assign(data, {
            microservice : microservice,
            func         : funcVal
          });
        }
      });
    });

    if (!data) {
      this.sqz.cli.log.error(
        `There is no any function with the name ${colors.blue.bold(name)} available`
      );
    }

    return data;
  }
}

module.exports = AWSRunLib;
