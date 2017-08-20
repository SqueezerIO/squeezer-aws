'use strict';

const Promise  = require('bluebird');
const AWS      = require('aws-sdk');

const s3       = new AWS.S3();

/**
 * Class representing microservice's AWS S3 bucket upload
 */
class UploadAWS {
  constructor(sqz) {
    this.sqz = sqz;
  }

  run() {
    return new Promise((resolve) => {
      Promise.each(this.sqz.vars.aws.uploads, (file) => {
        return this.sqz.cloud.storage.uploadFile(file.localPath, file.remotePath);
      }).then(() => {
        this.sqz.cli.log.debug('Assets successfully uploaded to the S3 bucket !');
        resolve();
      });
    });
  }

  /**
   * remove old S3 objects
   */
  cleanBucket(microservice) {
    return new Promise((resolve, reject) => {
      const params       = {
        Bucket : this.sqz.vars.aws.cfOutputs.SqueezerDeploymentBucket,
        Prefix : microservice.identifier
      };
      const maxS3Objects = 5;

      s3.listObjects(params, (err, data) => {
        const delParams  = {
          Bucket : this.sqz.vars.aws.cfOutputs.SqueezerDeploymentBucket,
          Delete : {
            Objects : []
          }
        };

        if (err) {
          reject(err);
        }

        if (data.Contents.length > maxS3Objects) {
          data.Contents.slice(0, -Math.abs(maxS3Objects)).forEach((obj) => {
            delParams.Delete.Objects.push({ Key : obj.Key });
          });
          s3.deleteObjects(delParams, (s3Err) => {
            if (err) {
              reject(s3Err);
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

}

module.exports = UploadAWS;
