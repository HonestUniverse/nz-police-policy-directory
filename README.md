# nz-police-policy-directory
A directory of NZ Police policies and related documents

## Install

After cloning the project, run `npm install` to install its dependencies. You will need Node v16.x or later installed.

## Structure

This project generates a static site based on JSON data.

The build logic is in `build`, whereas the content and assets used to build the static site are in `src`. The output of the build process is written into `dist`.

The JSON data matches a JSON schema with definitions in `schema`. TypeScript types matching this JSON schema also exist in this folder.

The project has a Jasmine test suite, with tests in the `spec` folder.

## npm scripts

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

## Branching strategy

New feature branches should be created off `main` as necessary, and merged via pull request.

Any time the schema is updated, a new tag should be created with the form `schema-x.y.z` and a new migration should be created. See [Schema migrations](#schema-migrations) for details on creating and running a schema migration.

Pushes to the `staging` and `main` branches will automatically trigger deployments to the staging and main websites via Cloudflare Pages.

No work should be done directly on the `staging` branch. If you need to use it to preview a build, point it to a commit on your feature branch and run a force push.

## Schema migrations

If any changes are made to the schema, you should create a migration to update existing JSON to match the new version. Migrations can be created in `build/migrate.ts`. Every schema should update the value of the `schemaVersion` property to match the latest version.

Breaking changes will also likely require you to make modifications to many JSON files, such as restructuring some existing data.

Once a migration has been created, you should run it with `npm run migrate` and, if successful, commit the changes.
