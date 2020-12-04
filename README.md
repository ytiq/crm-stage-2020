first_plugin
============

Plugin for working with Dependency API

[![Version](https://img.shields.io/npm/v/first_plugin.svg)](https://npmjs.org/package/first_plugin)
[![CircleCI](https://circleci.com/gh/develop/first_plugin/tree/master.svg?style=shield)](https://circleci.com/gh/develop/first_plugin/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/develop/first_plugin?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/first_plugin/branch/master)
[![Codecov](https://codecov.io/gh/develop/first_plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/develop/first_plugin)
[![Greenkeeper](https://badges.greenkeeper.io/develop/first_plugin.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/develop/first_plugin/badge.svg)](https://snyk.io/test/github/develop/first_plugin)
[![Downloads/week](https://img.shields.io/npm/dw/first_plugin.svg)](https://npmjs.org/package/first_plugin)
[![License](https://img.shields.io/npm/l/first_plugin.svg)](https://github.com/develop/first_plugin/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
This plugin is aimed at utilizing Dependency API.

Currently it only supports building dependency graph of Apex classes.

In order to run it requires [graphviz](https://graphviz.gitlab.io/download/)

```sh-session
$ npm install -g first_plugin
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
first_plugin/0.0.0 win32-x64 node-v12.18.0
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
![sample](https://i.ibb.co/3ygy7GY/out.png)
<!-- commands -->
* [`sfdx dependency:apex [-n <string>] [-f] [-p <string>] [-a <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-dependencyapex--n-string--f--p-string--a-string--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx dependency:apex [-n <string>] [-f] [-p <string>] [-a <string>] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

print a greeting and your org IDs

```
USAGE
  $ sfdx dependency:apex [-n <string>] [-f] [-p <string>] [-a <string>] [-v <string>] [-u <string>] [--apiversion 
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --algorithm=algorithm                                                         Algorithm for graph rendering (dot,
                                                                                    fdp)

  -f, --force                                                                       example boolean flag

  -n, --name=name                                                                   name to print

  -p, --prefix=prefix                                                               Prefix

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ $ sfdx dependency:apex --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
    // build dependency graph for all Apex classes
  
  $ $ sfdx dependency:apex --targetusername myOrg@example.com --targetdevhubusername devhub@org.com --prefix 'Test_'
    // build dependency graph for all Apex classes with Prefix 'Test_'
```
<!-- commandsstop -->