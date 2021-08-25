# eaciest-cli
Provides systems watcher to aggregate their initialization into one file


#### Install

`npm install --save-dev eaciest-cli` 

or

`yarn add -D eaciest-cli`

#### Run

`npx eaciest`

#### Config

Optionally create a `eaciest.config.json` file to override default config values:

```json5
{
  // Source root
  "src": "src",
  // glob to search the system files
  "glob": "**/systems/**/*.js", 
  // file which will contain all the systems
  "systemSetupFile": "system-setup.js",
  // function name which will initialize all the systems
  "systemsExportFunctionName": "setup_systems"
}
```


You can specify different config file name through `--config` 

The config also can be an array of objects instead to run watchers on different directories, for example.
