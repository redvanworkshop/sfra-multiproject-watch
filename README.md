# Multiproject watcher for SFRA based implementations

The script will watch for *.scss and *.js file changes, will attempt to find nearest package.json that can build that file and run respective compile:js or compile:scss command.

# Installation

## Watcher Script Installation

* Copy provided package.json and build files/directories to the root of the repository
* Alternatively integrate "multiproject-watch" script and devDependencies in package.json into existing project

## Visual Studio Code Integration

* Copy .vscode file into the root of the repository directory

# Usage

## Standalone

* Run npm run multiproject-watch

## Visual Studio Code

* Run the task using Cmd/Ctrl-Shift-B -> multiproject-watch
* Save a file to run the respective build script

Note: error detection within the build script is pretty minimalistic and will not tie error messages to specific files.

Note: If using Prophet plugin (https://marketplace.visualstudio.com/items?itemName=SqrTT.prophet), generated files will be uploaded after the build.

