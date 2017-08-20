'use strict';

class AwsPluginIndex {
  constructor(sqz) {
    this.sqz = sqz;

    this.commands = [
      {
        arg         : ['run'],
        summary     : 'Run a function locally',
        description : '',
        lifecycle   : [
          'project:validate',
          'aws:init',
          'microservices:load',
          'aws:run'
        ],
        options     : {
          function : {
            title        : 'function name',
            flag         : 'f',
            description  : 'Function name stored in the sqz.config.yml file',
            value        : true,
            required     : true,
            defaultValue : null
          },
          path     : {
            title        : 'JSON event input file',
            flag         : 'p',
            description  : '',
            value        : true,
            required     : false,
            defaultValue : null
          },
          json     : {
            title        : 'JSON event input string',
            flag         : 'j',
            description  : '',
            value        : true,
            required     : false,
            defaultValue : null
          }
        },
        examples    : [
          '',
          '-f MyFunction',
          '-f MyFunction -p ./microservice/input.event.json',
          '-f MyFunction -j \'{"a":"b"}\''
        ]
      },
      {
        arg         : ['invoke'],
        summary     : 'Invoke a function directly in the Cloud',
        description : '',
        lifecycle   : [
          'project:validate',
          'aws:init',
          'aws:invoke'
        ],
        options     : {
          function : {
            title        : 'function name',
            flag         : 'f',
            description  : 'Function name stored in the sqz.config.yml file',
            value        : true,
            required     : true,
            defaultValue : null
          },
          stage    : {
            title        : 'environment stage',
            description  : null,
            value        : true,
            required     : false,
            defaultValue : 'dev'
          }
        },
        examples    : [
          '',
          '--function MyFunction'
        ]
      },
      {
        arg         : ['logs'],
        summary     : 'Output the logs of a deployed function',
        description : '',
        lifecycle   : [
          'project:validate',
          'aws:init',
          'aws:logs'
        ],
        options     : {
          function : {
            title        : 'function name',
            flag         : 'f',
            description  : 'Name stored in the sqz.config.yml file',
            value        : true,
            required     : true,
            defaultValue : null
          },
          stage    : {
            title        : 'environment stage',
            flag         : 's',
            description  : null,
            value        : true,
            required     : false,
            defaultValue : 'dev'
          },
          region   : {
            title        : 'cloud region',
            flag         : 'r',
            description  : null,
            value        : true,
            required     : false,
            defaultValue : 'us-east-1'
          }
        },
        examples    : [
          '',
          '--function MyFunction'
        ]
      },
      {
        arg         : ['deploy'],
        summary     : 'Deploys the current project into the cloud.',
        description : 'If no options are specified all your available microservices ' +
        'where code changed from the last deployment will be deployed.',
        lifecycle   : [
          'project:validate',
          'microservices:load',
          'project:info',
          'aws:init',
          'deploy:checksums:get',
          'deploy:compile',
          'aws:compile',
          'aws:deploy',
          'aws:assets',
          'deploy:checksums:save'
        ],
        options     : {
          microservice : {
            title        : 'microservice name',
            flag    : 'm',
            description  : 'Deploys only a specific microservice',
            value        : true,
            required     : false,
            defaultValue : null
          },
          force        : {
            title        : 'force deployement',
            flag         : 'f',
            description  : 'Force deployment for all the current microservices \n' +
            'NOTE : Will deploy all microservices , even the ones with no code changes ' +
            'from the last deployment.',
            value        : false,
            required     : false,
            defaultValue : null
          },
          stage        : {
            title        : 'environment stage',
            description  : null,
            value        : true,
            required     : false,
            defaultValue : 'dev'
          }
        },
        examples    : [
          '',
          '--stage dev',
          '--force',
          '--microservice my-first-microservice'
        ]
      },
      {
        arg         : ['serve'],
        summary     : 'Serve project in watch mode . Live reload is enabled by default.',
        description : '',
        lifecycle   : [
          'project:validate',
          'aws:init',
          'microservices:load',
          'project:info',
          'serve:run',
          'aws:serve'
        ],
        options     : {
          stage : {
            title        : 'environment stage',
            description  : null,
            value        : true,
            required     : false,
            defaultValue : 'dev'
          }
        },
        examples    : [
          ''
        ]
      }
    ];
  }
}

module.exports = AwsPluginIndex;
