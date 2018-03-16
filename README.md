# Project Starter Files

Files to start a new SP Project

## Structure

```
|   .babelrc
|   .eslintrc.json
|   .gitignore
|   creds.js
|   gulpfile.babel.js
|   index.html
|   package.json
|   README.md
|   webpack.config.babel.js
|
+---build
+---dist
+---src
|   +---css
|   |       rei-theme.css
|   |
|   +---js
|   |       api.js
|   |       utility.js
|   |
|   \---media
\---transpile
```
### Begin A New Project

1. Create new git repository.

```
>> git clone ./projectstarterfiles ./newprojectname
>> cd [newprojectname]
>> rm -rf .git
>> git init
```

2. Edit the appName, ```devUrl```, ```prodUrl``` and ```testUrl``` variables in the ```gulpfile.babel.js``` file.

```javascript
// Edit the following four variable values specific to the project
const appName = "SPS2018Demo";
const devUrl = "https://omahasharepointusergroup.sharepoint.com/sites/dev"
const prodUrl = "https://omahasharepointusergroup.sharepoint.com/sites/dev";
const testUrl = "https://omahasharepointusergroup.sharepoint.com/sites/dev";
```
3.  Create the build directory structure.
```
>> md build
>> md dist
>> md transpile
```
4.  Run ```>> npm install```

