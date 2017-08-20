'use strict';

const Promise = require('bluebird');
const path    = require('path');
const _       = require('lodash');

/**
 * Upload web app assets
 */
class AWSAssets {
  constructor(sqz) {
    this.sqz = sqz;
  }

  upload() {
    return new Promise((resolve) => {
      const self = this;
      if (this.sqz.vars.project.type === 'web') {
        this.sqz.cli.log.info('Uploading web assets to the S3 bucket.');
        this.sqz.cli.loader.start();

        Promise.each(_.keys(this.sqz.vars.currentChecksums.assets), (src) => {
          const currentChecksum  = this.sqz.vars.currentChecksums.assets[src];
          const previousChecksum = this.sqz.vars.previousChecksums.assets[src];
          return this.processAsset(src, currentChecksum, previousChecksum);
        }).then(() => {
          self.removeOldAssets().then(() => {
            self.sqz.cli.loader.stop();
            resolve();
          });
        });
      } else {
        resolve();
      }
    });
  }

  processAsset(src, currentChecksum, previousChecksum) {
    return new Promise((resolve) => {
      this.uploadAsset(src, currentChecksum, previousChecksum).then(() => {
        resolve();
      });
    });
  }

  uploadAsset(src, currentChecksum, previousChecksum) {
    return new Promise((resolve) => {
      if (currentChecksum !== previousChecksum) {
        const parsedSrc = path.parse(src);
        const s3Key     = `assets/${parsedSrc.dir}/${parsedSrc.name}-${currentChecksum}${parsedSrc.ext}`;

        this.sqz.cli.log.debug(`Uploading ${src} as ${s3Key}`);
        this.sqz.cloud.storage.uploadFile(`${this.sqz.vars.project.buildPath}/cloud/assets/${src}`, s3Key, {
          public : true
        }).then(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  removeOldAssets() {
    const processAsset = (src, currentChecksum, previousChecksum) => {
      return new Promise((resolve) => {
        if (!_.isEmpty(previousChecksum) && _.isUndefined(currentChecksum)) {
          const parsedSrc = path.parse(src);
          const s3Key     = `assets/${parsedSrc.dir}/${parsedSrc.name}-${previousChecksum}${parsedSrc.ext}`;

          this.sqz.cloud.storage.removeFile(s3Key).then(() => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    };

    return new Promise((resolve) => {
      Promise.each(_.keys(this.sqz.vars.previousChecksums.assets), (src) => {
        const currentChecksum  = this.sqz.vars.currentChecksums.assets[src];
        const previousChecksum = this.sqz.vars.previousChecksums.assets[src];
        return processAsset(src, currentChecksum, previousChecksum);
      }).then(() => {
        resolve();
      });
    });
  }
}

module.exports = AWSAssets;
