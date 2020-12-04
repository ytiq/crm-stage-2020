
import { flags, SfdxCommand } from "@salesforce/command";
import { Messages, SfdxError, fs } from "@salesforce/core";
import { AnyJson } from "@salesforce/ts-types";
// import { createCanvas } from "canvas";
import createBody from '../../../cmt_template';
// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages("first_plugin", "cmt");

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

  public static args = [];

  protected static flagsConfig = {
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<AnyJson> {
      const metadataName = 'ApiConfig';
      const fields = {
        'ApiKey__c': {},
        'Url__c': {
            type: 'string'
        }
      };
      const records = [
          {Name: 'Test', fields : {'ApiKey__c': '2312412', 'Url__c': 'https://test.com'}},
          {Name: 'Test2', fields: {'ApiKey__c': '123fw', 'Url__c': 'https://test2.com'}},
      ]

      // TODO: use all fields
      const data = records.map(_ => Object.keys(_.fields)
        .map((key) => Object.assign({
            name: key,
            value: _.fields[key],
            type: fields[key].type ? fields[key].type : 'string'
        })));


        const cmtFolder = this.project.getPath() + '/force-app/main/default/customMetadata/';
        const isExist = await fs.fileExists(cmtFolder);
        if (!isExist) {
            await fs.mkdirp(cmtFolder);
        }
        this.ux.log(await fs.fileExists(cmtFolder));

        records.forEach((record, index) => {
            const fileName = `${metadataName}.${record.Name}.md-meta.xml`;
            fs.writeFile(cmtFolder + fileName, createBody(data[index]));
        })
      return 'Ok';
  }
}