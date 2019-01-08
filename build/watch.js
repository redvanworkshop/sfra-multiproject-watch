const watch = require('watch');
const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const findNearestFile = require('find-nearest-file');

// Command execution debounce time interval.
const IDLE_TIMEOUT = 500;

// A list of files and directories to ignore.
const IGNORES = [
    'node_modules',
    'static',
];

// A list of file extensions to watch.
const WATCH_FILES = ['.scss', '.js'];

// Maps file extensions to npm commands.
const COMMANDS = {
    '.scss': 'compile:scss',
    '.js': 'compile:js',
};

// A queue of run commands.
const queue = [];
let active = null;

let idleTimer = null;

// Pulls a command from the queue and runs it.
function dequeueAndRun() {
    const upNext = queue.shift();

    if (upNext) {
        console.log(`[WATCH-START] Running ${upNext.command} from ${upNext.packageJson}`);

        active = true;

        childProcess.exec(`npm run ${upNext.command}`, {
            cwd: path.dirname(upNext.packageJson),
        }, (err, stdout, stderr) => {
            active = false;
            
            if (stderr && stderr.length > 0) {
                console.log(stderr);
            } else if (stdout && stdout.length > 0) {
                console.log(stdout);
            }
            
            console.log('[WATCH-DONE]');
        });
    }
}

// For an idle time (to catch Save All situations) and runs compilers.
function runWhenIdle() {
    if (idleTimer != null) {
        clearTimeout(idleTimer);
    }

    idleTimer = setTimeout(() => {
        if (active) {
            runWhenIdle();
        } else {
            dequeueAndRun();
        }
    }, IDLE_TIMEOUT);
}

// Add a build command to the queue.
function run(packageJson, command) {
    const hash = `${packageJson}:${command}`;

    // If not yet scheduled.
    if (!queue.some(q => q.hash === hash)) {
        queue.push({
            hash,
            packageJson,
            command,
        });

        runWhenIdle();
    }
}

// Find a closest package.json for the file and run appropriate build command.
function build(f) {
    const packageJson = findNearestFile('package.json', f);

    const command = COMMANDS[path.extname(f)];

    run(packageJson, command);
}

// Watch files.
watch.createMonitor('.', {
    // Watch for changes every second.
    interval: 1,
    // Allow to monitor .scss and .js source files, in any directory.
    filter(f) {
        if (IGNORES.includes(path.basename(f))) {
            return false;
        }

        if (fs.lstatSync(f).isDirectory()) {
            return true;
        }

        return WATCH_FILES.includes(path.extname(f));
    },
}, (monitor) => {
    monitor.on('created', function (f, stat) {
        build(f);
    });

    monitor.on('changed', function (f, curr, prev) {
        build(f);
    });
        
    monitor.on('removed', function (f, stat) {
        build(f);
    });
});
