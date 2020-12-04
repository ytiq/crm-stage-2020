import { flags, SfdxCommand } from "@salesforce/command";
import { Messages, SfdxError, fs } from "@salesforce/core";
import { AnyJson } from "@salesforce/ts-types";
// import { createCanvas } from "canvas";
import * as jsonToDot from 'json-to-dot';
import {exec} from 'child_process';
import * as open from 'open';
import * as d3 from 'd3';
import { access } from "fs";

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages("first_plugin", "dependencies");

export default class Data extends SfdxCommand {
  public static description = messages.getMessage("commandDescription");
  public algorithm: string;

  public static examples = [
    `$ sfdx dependency:apex --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
    // build dependency graph for all Apex classes
  `,
    `$ sfdx dependency:apex --targetusername myOrg@example.com --targetdevhubusername devhub@org.com --prefix 'Test_'
    // build dependency graph for all Apex classes with Prefix 'Test_'
  `
  ];

  public static args = [{ name: "prefix" }, {name: 'algorithm'}];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    pattern: flags.string({
        char: "p",
        description: 'pattern'
    }),
    algorithm: flags.string({
      char: "a",
      description: 'Algorithm for graph rendering (dot, fdp)'
    }) 
   };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {

    const classIds = await this.getClassesIds();
    const dependencies = await this.getClassDependencies(classIds);
    const dotResult = await this.prepareDotFile(dependencies);

    this.createPngFile(dotResult);

    return 'Ok';
  }

  handleQueryResult(result) {
    if (!result.totalSize && (!result.records || result.records.length <= 0)) {
      throw new SfdxError(
        messages.getMessage("errorNoOrgResults", [this.org.getOrgId()])
      );
    }
  }

  async getClassesIds() {
    const pattern = this.flags.pattern;
    const conn = this.org.getConnection();

    this.ux.startSpinner('Querying classes' +  (pattern ? `with prefix '${pattern}'` : ''));
    const classQuery = `SELECT Id, Name FROM ApexClass ` + (pattern? `WHERE Name LIKE '%${pattern}%'` : '');

    const classResult = await conn.query(classQuery);
    this.handleQueryResult(classResult);

    const classes = <ApexClass[]>classResult.records || [];
    const ids = new Set();
    for(const cl of classes) {
      ids.add(cl.Id);
    }

    return ids;
  }

  async getClassDependencies(ids) {
    const conn = this.org.getConnection();
    const dependencyQuery = `                
        SELECT Id,MetadataComponentName,MetadataComponentId,MetadataComponentType,RefMetadataComponentId,RefMetadataComponentName,RefMetadataComponentType
        FROM MetadataComponentDependency
        WHERE RefMetadataComponentType = 'ApexClass'` + (ids.size?`AND (MetadataComponentType = 'ApexClass' OR MetadataComponentType = 'ApexTrigger') AND RefMetadataComponentId IN ('${Array.from(ids).join('\',\'')}')` : ``)
    ;
    const dependencyResult = await conn.tooling.query(dependencyQuery);
    if (dependencyResult.totalSize >= 10000) {
      this.ux.warn('possible max result is exeeded');
    } else {
      this.ux.log(`Total Dependencies: ${dependencyResult.totalSize}`);
    }

    return <Dependency[]>dependencyResult.records;
  }

  async prepareDotFile(dependencies) {
    const depP = dependencies.map(dep => Object.assign({
        source: dep.MetadataComponentName,
        target: dep.RefMetadataComponentName,
        value: 1
    }));

    const graph = {};
    for(const {source, target} of depP) {
        if (!(source in graph)) {
            graph[source] = [];
        }

        graph[source].push(target);
    }

    return jsonToDot(graph);
  }

  async createPngFile(dotResult) {
    const algorithm = this.flags.algorithm || 'dot';

    try {
      await fs.writeFile('out.dot', dotResult)
      await execP(`dot -K${algorithm} -Tsvg out.dot -o out.svg`);
      await execP('out.svg');

      setTimeout(() => {
        fs.unlink('out.dot');
        // fs.unlink('out.svg');
      }, 500);
      this.ux.stopSpinner('all completed');
      
    }
    catch(e) {
      this.ux.error(e);
    }
  }
}
const execP = (path) => new Promise((resolve, reject) => {
  exec(path, (err) => {
    if (err) {
      reject(err);
    }
    resolve();
  })
})

interface ApexClass {
    Name: string;
    Id: string;
}
interface Dependency {
    Id: string;
    MetadataComponentName: string;
    MetadataComponentId: string;
    MetadataComponentType: string; 
    RefMetadataComponentId: string;
    RefMetadataComponentName: string;
    RefMetadataComponentType: string;
}