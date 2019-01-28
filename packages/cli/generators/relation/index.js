// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
// Author: Raphael Drai at r.drai@F5.com

'use strict';

const _ = require('lodash');
const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('relation-generator');
const inspect = require('util').inspect;
const path = require('path');
const chalk = require('chalk');
const utils = require('../../lib/utils');
const relationUtils = require('./relationutils');

const ControllerRelation = require('./controllerRelation');
const RepositoryRelation = require('./repositoryRelation');
const ModelRelation = require('./modelRelation');


const relPathControllersFolder = '/controllers';
const relPathModelsFolder = '/models';
const relPathRepositoriesFolder = '/repositories';


let args;
let opts;



// Exportable constants
module.exports = class RelationGenerator extends ArtifactGenerator {
    // Note: arguments and options should be defined in the constructor.
    constructor(args, opts) {
        super(args, opts);
        this.args = args;
        this.opts = opts;
    }


    _setupGenerator() {
        super._setupGenerator();

        this.artifactInfo = {
            type: 'relation',
            rootDir: utils.sourceRootDir,
        };

        // XXX(kjdelisle): These should be more extensible to allow custom paths
        // for each artifact type.

        this.artifactInfo.outDir = path.resolve(
            this.artifactInfo.rootDir,
            '.',
        );
    }

    setOptions() {
        return super.setOptions();
    }

    checkLoopBackProject() {
        if (this.shouldExit()) return;
        return super.checkLoopBackProject();
    }

    promptArtifactName() {
        debug('Prompting for artifact name');
        if (this.shouldExit()) return false;
        // if (this.shouldExit()) return;
        // return super.promptArtifactName();
    }


    /*
        async promptArtifactCrudVars() {
            if (this.shouldExit()) return;

            let modelList, repositoryList;

            try {
                modelList = await utils.getArtifactList(
                    this.artifactInfo.modelDir,
                    'model',
                );

                repositoryList = await utils.getArtifactList(
                    this.artifactInfo.repositoryDir,
                    'repository',
                    true,
                );
            } catch (err) {
                return this.exit(err);
            }

            if (_.isEmpty(modelList)) {
                return this.exit(
                    `No models found in ${this.artifactInfo.modelDir}.
                ${chalk.yellow(
                        'Please visit http://loopback.io/doc/en/lb4/Controller-generator.html for information on how models are discovered',
                    )}`,
                );
            }
            if (_.isEmpty(repositoryList)) {
                return this.exit(
                    `No repositories found in ${this.artifactInfo.repositoryDir}.
                ${chalk.yellow(
                        'Please visit http://loopback.io/doc/en/lb4/Controller-generator.html for information on how repositories are discovered',
                    )}`,
                );
            }
            return this.prompt([
                {
                    type: 'list',
                    name: 'modelName',
                    message:
                        'What is the name of the model to use with this CRUD repository?',
                    choices: modelList,
                    when: this.artifactInfo.modelName === undefined,
                    default: modelList[0],
                    validate: utils.validateClassName,
                },
                {
                    type: 'list',
                    name: 'repositoryName',
                    message: 'What is the name of your CRUD repository?',
                    choices: repositoryList,
                    when: this.artifactInfo.repositoryName === undefined,
                    default: repositoryList[0],
                    validate: utils.validateClassName,
                },
                {
                    type: 'list',
                    name: 'idType',
                    message: 'What is the type of your ID?',
                    choices: ['number', 'string', 'object'],
                    when: this.artifactInfo.idType === undefined,
                    default: 'number',
                },
                {
                    type: 'input',
                    name: 'httpPathName',
                    message: 'What is the base HTTP path name of the CRUD operations?',
                    when: this.artifactInfo.httpPathName === undefined,
                    default: answers =>
                        utils.prependBackslash(
                            utils.pluralize(utils.urlSlug(answers.modelName)),
                        ),
                    validate: utils.validateUrlSlug,
                    filter: utils.prependBackslash,
                },
            ])
                .then(props => {
                    debug(`props: ${inspect(props)}`);
                    Object.assign(this.artifactInfo, props);
                    // Ensure that the artifact names are valid.
                    [
                        this.artifactInfo.name,
                        this.artifactInfo.modelName,
                        this.artifactInfo.repositoryName,
                    ].forEach(item => {
                        item = utils.toClassName(item);
                    });
                    // Create camel-case names for variables.
                    this.artifactInfo.repositoryNameCamel = utils.camelCase(
                        this.artifactInfo.repositoryName,
                    );
                    return props;
                })
                .catch(err => {
                    debug(`Error during prompt for controller variables: ${err}`);
                    return this.exit(err);
                });
        }
        */



    scaffold() {
        // We don't want to call the base scaffold function since it copies
        // all of the templates!
        /*
         Input parameters handling of CLI commmand "lb4 relation" that include the following options:
         1) provide as input a json file that contains the relation parameters:
            $ lb4 relation --config file.json
            where the content of json file is:
            {
              "sourceModel": "todo-list",
              "destinationModel": "todo",
              "relationType": "hasMany",
              "foreignKey": "id"
            }
         2) provide as input a string in json format (no file)
            $ lb4 relation --config "{ \"sourceModel\": \"todo-list\",\"destinationModel\": \"todo\",
               \"relationType\": \"hasMany\",\"foreignKey\": \"id\" }"
        */

        let relPathCtrl = this.artifactInfo.relPath + relPathControllersFolder;
        let relPathModel = this.artifactInfo.relPath + relPathModelsFolder;
        let relPathRepo = this.artifactInfo.relPath + relPathRepositoriesFolder;

        if (!this.validateRelation(this.options.relationType)) {
            throw new Error("'relationType' parameters should be specified.");
        }
        if (this.options.sourceModel === this.options.destinationModel) {
            throw new Error("'sourceModel' and 'destinationModel' parameter values should be different.");
        }


        debug('Invoke Controller generator...');

        let ctrl = new ControllerRelation(this.args, this.opts);
        this.artifactInfo.name = this.options.relationType;
        this.artifactInfo.relPath = relPathCtrl;
        if (this.options.relationType === relationUtils.relationType.belongsTo) {
            ctrl.generateRelationController(this.options.destinationModel, this.options.sourceModel,
                this.options.foreignKey, this.options.relationType);
        } else {
            ctrl.generateRelationController(this.options.sourceModel, this.options.destinationModel,
                this.options.foreignKey, this.options.relationType);
        }

        //Invoke here Model and Repository Generators
        debug('Invoke Model generator...');
        let model = new ModelRelation(this.args, this.opts);
        this.artifactInfo.name = this.options.relationType;
        this.artifactInfo.relPath = relPathModel;
        model.generateRelationModel(this.options.sourceModel, this.options.destinationModel,
            this.options.foreignKey, this.options.relationType);

        debug('Invoke Repository generator...');
        let repo = new RepositoryRelation(this.args, this.opts);
        this.artifactInfo.name = this.options.relationType;
        this.artifactInfo.relPath = relPathRepo;
        repo.generateRelationRepository(this.options.sourceModel, this.options.destinationModel,
            this.options.foreignKey, this.options.relationType);

        return;
    }

    validateRelation(relationName) {
        if (relationName != relationUtils.relationType.hasOne &&
            relationName != relationUtils.relationType.hasMany &&
            relationName != relationUtils.relationType.belongsTo) {
            return false;
        }
        return true;
    }
    async end() {
        await super.end();
    }
};
