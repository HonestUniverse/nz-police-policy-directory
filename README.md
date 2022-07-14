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

`build` - Run a production build.

`watch` - Watch assets for changes and rebuild. Useful when editing templates or styles, but content changes via JSON files will not be reflected.

`buildTest` - Run a production build, but only include the contents of the `test-policies` folder.

`watchTest` - Same as `watch`, but only includes the contents of the `test-policies` folder.

`migrate` - Run any schema migrations to update policy data.

`generateIds` - Generate IDs for any policy versions that don't have them. Because version IDs are generated programmatically, you will need to run this script after any time you manually add one or more new policy versions.

`lintJs` - Lint the scripts in the site source.

`lintCss` - Lint the styles in the site source.

`lint` - Lint both scripts and styles.

`test` - Run test suites.

## Branching strategy

The main development branch is `dev`. Small changes can be made here directly, but features should generally be worked on in a branch off `dev`.

Parallel to `dev` is the `content` branch. This is where any new content not needed for test cases should be added. The `content` branch should never be merged to `dev`, but changes from `dev` need to be merged through `content` on their way to deployment. We have organised things this way to keep the build time on `dev` minimal by reducing the amount of content it has to build.

Pushes to the `staging` and `main` branches will automatically trigger deployments to the staging and main websites via Cloudflare Pages.

## Schema migrations

If any breaking changes are made to the schema, a migration is likely necessary to update existing JSON to match the new version. Migrations can be added to `build/migrate.ts`.

In order to preserve the separation of `dev` and `content` branches, migrations should be created and run in these steps:

1. Write the migration in `dev` or a branch off `dev`, but don't commit migrated JSON files.
2. Once working correctly, merge the migration only to `dev` and then to `content`.
3. Run the migration on `content` and commit the migrated JSON files.
4. Run the migration on `dev` and commit the migrated JSON files.
5. Merge `dev` to `content` again.
