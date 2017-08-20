'use strict';

const s3 = require('./lib/s3');
const _  = require('lodash');

class AWSStorage {
  constructor(sqz) {
    this.sqz = sqz;
  }

  uploadFile(localPath, remotePath, options) {
    return new Promise((resolve, reject) => {
      const awsS3Client = new this.sqz.aws.S3();
      const client      = s3.createClient({ s3Client : awsS3Client });

      const params = {
        localFile : localPath,

        s3Params : {
          Bucket : this.sqz.vars.aws.cfOutputs.SqueezerDeploymentBucket,
          Key    : remotePath
        }
      };

      if (_.has(options, 'public') && options.public === true) {
        params.s3Params.ACL = 'public-read';
      }

      const uploader = client.uploadFile(params);

      uploader.on('error', (err) => {
        reject(err);
      });

      uploader.on('end', () => {
        resolve({ success : true });
      });
    });
  }

  uploadDir(localPath, remotePath, options) {
    return new Promise((resolve, reject) => {
      const awsS3Client = new this.sqz.aws.S3();
      const client      = s3.createClient({
        s3Client : awsS3Client
      });

      const params = {
        localDir : localPath,
        s3Params : {
          Bucket : this.sqz.vars.aws.cfOutputs.SqueezerDeploymentBucket,
          Prefix : remotePath
        }
      };

      if (_.has(options, 'sync') && options.sync === true) {
        params.deleteRemoved = true;
      }


      if (_.has(options, 'public') && options.public === true) {
        params.s3Params.ACL = 'public-read';
      }

      const uploader = client.uploadDir(params);

      uploader.on('error', (err) => {
        reject(err);
      });

      uploader.on('end', () => {
        resolve({ success : true });
      });
    });
  }

  removeFile(remotePath) {
    return new Promise((resolve, reject) => {
      const awsS3Client = new this.sqz.aws.S3();

      const params = {
        Bucket : this.sqz.vars.aws.cfOutputs.SqueezerDeploymentBucket,
        Key    : remotePath
      };

      this.sqz.cli.log.debug(`Removing s3 resource ${remotePath}`);

      awsS3Client.deleteObject(params, (err) => {
        if (err) reject(err);
        else     resolve();
      });
    });
  }

  getPublicUrl() {
    return new Promise((resolve) => {
      const publicUrl = `https://s3.amazonaws.com/${this.sqz.vars.aws.cfOutputs.SqueezerDeploymentBucket}`;

      resolve({ publicUrl : publicUrl });
    });
  }
}

module.exports = AWSStorage;
