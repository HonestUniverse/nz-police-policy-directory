# `policepolicy.nz` contributing guide

This guide explains how to set up the `policepolicy.nz` project so you can contribute, as well as the workflow for managing contributions.

## Setup

### Clone

Before you start, you will need to have [git](https://git-scm.com/) installed. If you're unfamiliar with using command line tools, you may want to install a [git GUI client](https://git-scm.com/downloads/guis) so you can interact wtih git using a user interface.

You will also want to [fork this repository](https://github.com/HonestUniverse/nz-police-policy-directory/fork), which creates a copy you can control and make changes to. Once you're happy with those changes, you can [create a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) so one of this project's maintainers can review your changes and either suggest changes or merge it into the main project.

Once you have git installed and you've made a fork, you can [clone your forked repository](https://docs.github.com/en/get-started/quickstart/fork-a-repo#cloning-your-forked-repository) to your computer. You can do this either through your GUI client or by running this on your command line from the folder where you want the project to live, replacing `YOUR-USERNAME` with your GitHub username:

`git clone https://github.com/YOUR-USERNAME/nz-police-policy-directory.git`

### Install

After cloning the project, you can install the project's dependencies so you can build it on your computer.

You will need to have [NodeJS](https://nodejs.org/en/) installed. This project requires at least version 16.14.2.

Once Node is installed, run this on your command line in the project directory to install its dependencies:

`npm install`

### Building

Once you have the project set up locally, you are ready to build and run it on your computer.

This project relies on [npm](https://www.npmjs.com/) for package management and running build scripts. The npm documentation contains instructions on [how to use npm scripts](https://docs.npmjs.com/cli/v10/using-npm/scripts).

To get started, run `npm start` in your command line to build the site and run a simple HTTP server on port 8080. This will allow you to view the project in a web browser at [`http://localhost:8080/`](http://localhost:8080/).

The following scripts are available:

`build` - Build the static site, using the contents of the `policies` folder.

`watch` - Watch assets for changes and build the static site, using the contents of the `policies` folder. Useful when editing templates or styles, but content changes via JSON files will not be reflected.

`buildTest` - Same as `build`, but only includes the contents of the `test-policies` folder.

`watchTest` - Same as `watch`, but only includes the contents of the `test-policies` folder.

`migrate` - Run any schema migrations to update policy data.

`generateIds` - Generate IDs for any policy versions that don't have them. Because version IDs are generated programmatically, you will need to run this script after any time you manually add one or more new policy versions.

`lintJs` - Lint the scripts in the site source.

`lintCss` - Lint the styles in the site source.

`lint` - Lint both scripts and styles.

`test` - Run test suites.

`server` - Run a simple HTTP server on port 8080.

`start` - Build the site, then run a simple HTTP server on port 8080.

### Project Structure

This project generates a static site based on JSON data.

The build logic is in the `build` directory, whereas the content and assets used to build the static site are in `src`. The output of the build process is written into `dist`.

The JSON data matches a JSON schema with definitions in the `schema` directory. TypeScript types matching this JSON schema also exist in this folder.

The project has a Jasmine test suite, with tests in the `spec` folder.

## Contributing

Thank you for taking the time to contribute to `policepolicy.nz`. If you're not sure where to get started, you can view out [issues](https://github.com/HonestUniverse/nz-police-policy-directory/issues) page to see what work needs doing.

### Content

Most work done on `policepolicy.nz` is updating content. You can find [issues related to updating content](https://github.com/HonestUniverse/nz-police-policy-directory/labels/content) tagged with "content".

Each policy has a dedicated folder in [`src/policies`](./src/policies/). In that folder there is a single file called `metadata.json`, which describes the metadata for every version of that document. There are also folders for each version, which contain that version's files. By convention, these folders are named based on the date when the document was extracted, or when it was published or released, in `YYYY-MM-DD` format.

Sometimes, typically in the response to requests made under the OIA, multiple documents are released in a single file. As multiple metadata files need to refer to the same source files, these bulk files instead live in [`src/bulk-files`](./src/bulk-files/).

When adding an entirely new document, we recommend you begin by creating a copy of [`metadata-template.json`](./src/templates/metadata-template.json) to create a new file called `metadata.json`. If you're updating an existing document, e.g. to add a new version, we recommend copying the relevant section from `metadata-template.json` into the existing file.

After adding a new version of any document, you will need to run `npm run generateIds` to generate a unique ID for that version.

If you use VS Code it should automatically validate metadata files against our JSON schema, and provide autocompletion to help guide you.

## Information for Maintainers

This information is used by this project's maintainers. If you're contributing via a fork, you can ignore this section.

### Branching strategy

New feature branches should be created off `main` as necessary, and merged via pull request.

Any time the schema is updated, a new tag should be created with the form `schema-x.y.z` and a new migration should be created. See [Schema migrations](#schema-migrations) for details on creating and running a schema migration.

Pushes to the `staging` and `main` branches will automatically trigger deployments to the staging and main websites via Cloudflare Pages.

No work should be done directly on the `staging` branch. If you need to use it to preview a build, point it to a commit on your feature branch and run a force push.

### Schema migrations

If any changes are made to the schema, you should create a migration to update existing JSON to match the new version. Migrations can be created in `build/migrate.ts`. Every schema should update the value of the `schemaVersion` property to match the latest version.

Breaking changes will also likely require you to make modifications to many JSON files, such as restructuring some existing data.

Once a migration has been created, you should run it with `npm run migrate` and, if successful, commit the changes.
