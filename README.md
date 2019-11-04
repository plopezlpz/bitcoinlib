# About

This project is a bitcoin library, it is the implementation of the exercises and the book Programming Bitcoin by Jimmy Song in JS.

# Quick start

## Run tests

```sh
npm run install
npm run test
```

Some tests are skipped since they are currently calling to the `blockchain.info` API, in order to run then, just remove the `skip` call.

## Find circular dependencies for a file (not needed)

Node will just import an empty object when we try to import a file with a circular dependency, the below commands are useful to debug this kind of issues.

1. Install madge globally (if not already installed)
   ```sh
   npm -g install madge
   ```
1. Find circular dependencies for a file:
   ```sh
   madge -c src/transaction/Tx.js
   ```

## VS Code Setup:

The launch config for debugging the tests `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Mocha Tests",
      "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
      "args": [
        "--timeout",
        "999999",
        "--colors",
        "${workspaceFolder}/src/**/**spec.js"
      ],
      "internalConsoleOptions": "openOnSessionStart"
    }
  ]
}
```
