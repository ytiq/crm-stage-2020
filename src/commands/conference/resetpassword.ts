import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError, fs } from "@salesforce/core";
import * as puppeteer from 'puppeteer';
import { runInThisContext } from 'vm';
// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages("first_plugin", "resetpassword");

export default class ResetPassword extends SfdxCommand {
  public static description = messages.getMessage("commandDescription");

    public static examples = [
        '$ sfdx gin:user:resetpassword -t testuser@example.test -u targetorg@org.test'
    ];

    protected static flagsConfig = {
        testusername: flags.string({
            char: 't',
            description: 'username to reset password',
            required: true,
        }),
        password1: flags.string({
            char: 'o',
            description: 'Password',
            required: false,
            default: '1Password1'
        }),
        password2: flags.string({
            char: 'n',
            description: 'Second Password for initial reset',
            required: false,
            default: '1Password2'
        }),
    };

    // Comment this out if your command does not require an org username
    protected static requiresUsername = true;
    username;
    password;
    state: string;

    // Comment this out if your command does not support a hub org username
    protected static requiresDevhubUsername = false;

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = false;

    public async run(): Promise<any> {
        const result = {};

        await this.resetPassword();

        return result;
    }

    private async resetPassword() {

        await this.resetPasswordWithRest();

        const {browser, page} = await this.startPuppeteer();

        await this.handleInitialLogin(page);

        const isDone = await this.handleSecondPage(browser, page);
        if (isDone) {
            return;
        }

        await this.handleLastPage(browser, page);

        this.ux.stopSpinner('Done.');
    }

    async startPuppeteer() {
        this.ux.startSpinner(`Starting puppeteer`);
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: false
        });
        const page = await browser.newPage();

        return {browser, page};
    }
    async handleSecondPage(browser, page): Promise<boolean> {
        const password2 = this.flags.password2;
        const password1 = this.flags.password1;

        await this.waitForNextPage(page);
        let isDone = false;
        if (this.state === 'password') {
            await this.handleChangePasswordPage(page, password1, password2);
            this.ux.startSpinner('redirecting to home page/change phone number');
        } else if (this.state === 'phone') {
            try {
                await page.waitForSelector('input');
                await browser.close();
            }
            catch(e) {
                isDone = true;
            }
            this.ux.stopSpinner('Done.');
            return;
        } else if (this.state === 'error') {
            try {
                await browser.close();
            } catch(e) {
                isDone = true;
            }
        } else {
            await browser.close();
            isDone = true;
        }
        
        return isDone;
    }

    async handleLastPage(browser, page) {
        await this.waitForNextPage(page);
        if (this.state === 'phone') {
            try {

                await page.waitForSelector('input');
                await browser.close();
            }
            catch(e) {
                return;
            }
            this.ux.stopSpinner('Done.');
            return;
        } else if (this.state === 'home') {
            await browser.close();
        }
    }
    async waitForNextPage(page) {
        const passwordChangeUrlIndicator = `_ui/system/security/ChangePassword`;
        const homePageIndicator = 'lightning';
        const addPhoneNumberIndicator = '_ui/identity/phone/AddPhoneNumber';

        const possibleUrls = [
            passwordChangeUrlIndicator,
            homePageIndicator,
            addPhoneNumberIndicator
        ];

        // const loginErrorSelector = '.loginError#error';
        // const loginError = page.$(loginErrorSelector);
        // if (loginError) {
        //     this.state = 'error';
        //     return;
        // }

        await page.waitForRequest(request => possibleUrls.reduce((acc, item) => acc || request.url().includes(item) , false));

        await page.waitForNavigation();

        this.state = page.url() === this.org.getConnection().instanceUrl ? 'login' :
            page.url().includes(passwordChangeUrlIndicator) ? 'password' :
                page.url().includes(addPhoneNumberIndicator) ? 'phone' :
                    page.url().includes(homePageIndicator) ? 'home' :
                        'else';
    }
    async resetPasswordWithRest() {
        const password = this.flags.password1;
        this.ux.startSpinner('Setting initial password');

        const conn = this.org.getConnection();

        let usersResult: {records: any[]} = await conn.query(`SELECT Id FROM User WHERE Username = '${this.flags.testusername}'`);

        let user = usersResult.records[0];

        const setPassword = async (password) => {
            try {
                let url = conn.instanceUrl + `/services/data/v25.0/sobjects/User/${user.Id}/password`;

                const response = await conn.request({
                    method: 'POST',
                    body: JSON.stringify({
                        'NewPassword': password
                    }),
                    url: url
                });

                return true;
            }
            catch (e) {
                return false;
            }
        }
        let requestResult: Boolean = await setPassword(password);
        this.ux.log('' + requestResult);
    }

    async handleInitialLogin(page) {
        const password = this.flags.password1;
        this.ux.startSpinner(`Opening login page`);
        await page.goto(
            `${this.org.getConnection().instanceUrl}`,
            { waitUntil: ['load', 'domcontentloaded', 'networkidle0'] }
        );

        await page.type('input.username', this.flags.testusername);
        await page.type('input.password', password);

        await page.click('input[type=submit]');
    }

    async handleChangePasswordPage(page, password1, password2) {
        await page.waitForSelector('input');

        this.ux.startSpinner(`Resetting password`);

        await page.type('input[name=currentpassword]', password1);
        await page.type('input[name=newpassword]', password2);
        await page.type('input[name=confirmpassword]', password2);
        await page.type('input[name=answer]', 'some answer');

        await page.waitForSelector('button[name=save]:not(:disabled)');
        await page.click('button[name=save]');

    }
}
