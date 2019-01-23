"use strict";
const ArtifactGenerator = require('../../lib/artifact-generator');
const debug = require('../../lib/debug')('relation-generator');
const inspect = require('util').inspect;
const path = require('path');
const chalk = require('chalk');
const utils = require('../../lib/utils');
const ast = require('ts-simple-ast');

module.exports = class ModelRelation extends ArtifactGenerator {

    _setupGenerator() {
        super._setupGenerator();
        this.artifactInfo = {
            type: 'relation',
            rootDir: utils.sourceRootDir,
        };

        this.artifactInfo.modelDir = path.resolve(
            this.artifactInfo.rootDir,
            'models',
        );
    }

    generateRelationModel(sourceModel, targetModel, foreignKey, relationName) {
        let modelPath = this.artifactInfo.modelDir;
        if ((relationName == "hasMany") || (relationName == "hasOne")) {
            this.generateModel(sourceModel, targetModel, relationName, modelPath, foreignKey, undefined);
            this.generateModel(targetModel, sourceModel, "belongsTo", modelPath, "id", foreignKey);
        }
        else {
            this.generateModel(sourceModel, targetModel, relationName, modelPath, "id", foreignKey);
        }
    }

    generateModel(sourceModel, targetModel, relationName, path, foreignKey, sourceForeignKey) {
        let project = new ast.Project();

        const sourceFile = this.addFileToProject(project, path, sourceModel);
        if (!this.isClassExist(sourceFile)) {
            return;
        }
        const sourceClass = this.getClassObj(sourceFile);

        const targetFile = this.addFileToProject(project, path, targetModel);
        if (!this.isClassExist(targetFile)) {
            return;
        }
        const targetClass = this.getClassObj(targetFile);
        let modelProperty;
        const lowerCaseTargetClassName = this.getClassNameLowerCase(targetFile)
        const newPropertyName = this.getForeignKey(sourceClass, foreignKey)


        switch (relationName) {
            case "hasMany":
                if (this.isPropertyExist((sourceClass), (lowerCaseTargetClassName + 's'))) {
                    // TODO add error to CLI UI
                    throw new Error(' property ' + lowerCaseTargetClassName + 's exist in the model')
                }
                if (this.isPropertyExist((targetClass), newPropertyName)) {
                    // TODO add error to CLI UI
                    throw new Error('wrong property ' + newPropertyName + ' in the target model')
                }
                else {
                    modelProperty = this.getHasMany(targetClass.getName(), newPropertyName);
                }
                break;
            case "hasOne":
                if (this.isPropertyExist((sourceClass), (lowerCaseTargetClassName))) {
                    // TODO add error to CLI UI
                    throw new Error('property ' + lowerCaseTargetClassName + ' exist in the model')
                }
                if (this.isPropertyExist((targetClass), newPropertyName)) {
                    // TODO add error to CLI UI
                    throw new Error('wrong property ' + newPropertyName + ' in the target model')
                }
                else {
                    modelProperty = this.getHasOne(targetClass.getName(), newPropertyName);
                }
                break;
            case "belongsTo":
                if (this.isPropertyExist((sourceClass), (this.getForeignKey(targetClass, sourceForeignKey)))) {
                    // TODO add error to CLI UI
                    throw new Error('property ' + lowerCaseTargetClassName + 'Id exist in the model')
                }
                let belongsToKey = this.getForeignKeyBelongsTo(sourceClass, foreignKey);
                if (!(this.isPropertyExist((targetClass), belongsToKey))) {
                    // TODO add error to CLI UI
                    throw new Error('wrong property ' + belongsToKey + ' in the target model')
                }
                else {
                    modelProperty = this.getBelongsTo(targetClass.getName(), belongsToKey, this.getKeyType(targetClass, belongsToKey), this.getForeignKey(targetClass, sourceForeignKey));
                }
                break;
        }
        sourceClass.insertProperty(this.getPropertiesCount(sourceClass), modelProperty);
        sourceClass.insertText(this.getPropertyStartPos(sourceClass), "\n")
        this.addRequiredImports(sourceFile, targetModel, relationName, targetClass.getName());
        sourceClass.formatText()
        sourceFile.save();
    }
    addFileToProject(project, path, modelName) {
        const fileName = path + "/" + modelName + '.model.ts';
        return project.addExistingSourceFile(fileName);
    }

    getClassesCount(fileName) {
        return fileName.getClasses().length;
    }



    getClassObj(fileName) {
        const className = fileName.getClasses()[0].getNameOrThrow();
        return fileName.getClassOrThrow(className);
    }


    isClassExist(fileName) {
        return (this.getClassesCount(fileName) == 1);
    }

    getPropertiesCount(classObj) {
        return classObj.getProperties().length;
    }

    getPropertyStartPos(classObj) {
        return classObj.getChildSyntaxList().getChildAtIndex(this.getPropertiesCount(classObj) - 1).getPos()
    }

    getClassProperties(classObj) {
        return classObj.getProperties()
    }

    isPropertyExist(classObj, propertyName) {
        return this.getClassProperties(classObj).map(x => x.getName()).includes(propertyName)
    }

    getClassNameLowerCase(fileName) {
        let name = fileName.getClasses()[0].getNameOrThrow()
        return name.charAt(0).toLowerCase() + name.slice(1)
    }

    getKey(classObj) {
        for (let i = 0; i < this.getPropertiesCount(classObj); i++) {
            if (classObj.getProperties()[i].getDecorators()[0].getName() == 'property') {
                if (classObj.getProperties()[i].getDecorators()[0].getArguments()[0].getProperties().map(x => x.getName()).includes('id')) {
                    if (classObj.getProperties()[i].getDecorators()[0].getArguments()[0].getProperty('id').getInitializer().getText() == 'true') {
                        return (classObj.getProperties()[i].getName())
                    }
                }
            }
        }
        throw new Error(' primary Key is missing ')
    }

    getForeignKey(classObj, foreignKey) {
        let name = classObj.getName()
        return (name.charAt(0).toLowerCase() + name.slice(1) + foreignKey.charAt(0).toUpperCase() + foreignKey.slice(1))

    }

    getForeignKeyBelongsTo(classObj, foreignKey) {
        if (foreignKey === undefined) {
            return (this.getKey(classObj))
        }
        return (foreignKey)
    }

    getKeyType(classObj, propertyName) {
        return classObj.getProperty(propertyName).getType().getText()
    }


    getHasMany(className, fk) {
        let relationProperty = {
            decorators: [{ name: "hasMany", arguments: ['() => ' + className + ", {keyTo: '" + fk + "' }"] }],
            name: className.toLocaleLowerCase() + "s",
            type: className + "[]",
        }

        return (relationProperty)
    }

    getHasOne(className, fk) {
        let relationProperty = {
            decorators: [{ name: "hasOne", arguments: ['() => ' + className + ", {keyTo: '" + fk + "' }"] }],
            name: className.toLocaleLowerCase(),
            type: className,
        }

        return (relationProperty)
    }

    getBelongsTo(className, fk, fktype, sourceProperty) {
        let relationProperty
        relationProperty = {
            decorators: [{ name: "belongsTo", arguments: ['() => ' + className + ", {keyTo: '" + fk + "' }"] }],
            name: sourceProperty,
            type: fktype,
        }
        return (relationProperty)
    }


    addRequiredImports(sourceFile, targetModel, relationName, targetClassName) {
        let importsArray = this.getRequiredImports(targetModel, relationName, targetClassName);
        while (importsArray.length > 0) {
            let currentImport = importsArray.pop();
            this.addCurrentImport(sourceFile, currentImport);
        }
    }


    getRequiredImports(targetModel, relationName, targetClassName) {

        let importsArray = [{
            name: targetClassName,
            module: "./" + targetModel + ".model"
        }, {
            name: relationName,
            module: "@loopback/repository"
        },
        ];

        return importsArray;
    }

    addCurrentImport(sourceFile, currentImport) {
        if (!this.doesModuleExists(sourceFile, currentImport.module)) {
            sourceFile.addImportDeclaration({
                moduleSpecifier: currentImport.module
            });
        }
        if (!this.doesImportExistInModule(sourceFile, currentImport)) {
            sourceFile.getImportDeclarationOrThrow(currentImport.module).addNamedImport(currentImport.name);
        }
    }


    doesModuleExists(sourceFile, moduleName) {
        return sourceFile.getImportDeclaration(moduleName);
    }

    doesImportExistInModule(sourceFile, currentImport) {
        let identicalImport;
        let relevantImports = this.getNamedImportsFromModule(sourceFile, currentImport.module);
        if (relevantImports.length > 0) {
            identicalImport = relevantImports[0].getNamedImports().filter(imp => imp.getName() == currentImport.name);
        }

        return (identicalImport && identicalImport.length > 0);
    }

    getNamedImportsFromModule(sourceFile, moduleName) {
        let allImports = sourceFile.getImportDeclarations();
        let relevantImports = allImports.filter(imp => imp.getModuleSpecifierValue() == moduleName);
        return relevantImports;
    }

}
