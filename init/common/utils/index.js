'use strict';

const _ = require('lodash');

class AWSUtils {
  constructor(sqz) {
    this.sqz = sqz;
  }

  formatFunctionName(functionName) {
    const functionIdentifier = _.upperFirst(_.camelCase(functionName));
    const formattedFunctionName       = `${this.sqz.vars.project.identifier}${functionIdentifier}Function-${this.sqz.vars.stage}`;

    return formattedFunctionName;
  }
}

module.exports = AWSUtils;
