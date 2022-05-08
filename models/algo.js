/* -------------------------------------------------------------------------- */
/*                             Algorithm Tracking                             */
/* -------------------------------------------------------------------------- */

const AlgoTracker = {}

const ATStatusCode = {
    STARTING: 0,
    RUNNING: 1,
    FINISHED: 2,
    ERROR: 3,
}

class AlgoTrackerEntry {
    constructor(user_id) {
        this.user_id = user_id;
        this.status = ATStatusCode.STARTING;
        this.process = undefined;
    }

    isFinished() {
        return this.status === ATStatusCode.FINISHED
    }

    isRunning() {
        return (this.status === ATStatusCode.RUNNING || this.status === ATStatusCode.STARTING);
    }
}

/**
 * Checks the validity of the input for the algorithm.
 * @param {*} input Input to check
 * @returns True if input is valid for algo. False otherwise.
 */
function isAlgoInputValid(input) {
    return true
}

/* -------------------------------------------------------------------------- */
/*                             Algorithm Spawning                             */
/* -------------------------------------------------------------------------- */
// Process Running
const { spawn } = require('child_process');
// Filesystem access
const fs = require('fs')

/**
 * Creates a process and attaches is to the AlgoTrackerEntry object provided
 * @param {*} atEntry AlgoEntryTracker to attach process to
 * @param {*} input Algorithm input
 */
function createAlgoProcess(atEntry, input) {
    // Write the input to a file
    // TODO: ...
    fs.writeFileSync(`./scheduler-data/algo_data_user_${atEntry.user_id}.json`,JSON.stringify(input, 0, 2))

    // Run the algorithm with the new input file
    atEntry["status"] = ATStatusCode.RUNNING
    const proc = spawn('python', ["./python/simple_algo.py"]);
    atEntry["process"] = proc

    proc.stderr.addListener("data", (chunk) => {
        console.log(`PYTHON (ERR): ${chunk}`)
    })

    proc.stdout.addListener("data", (chunk) => {
        console.log(`PYTHON: ${chunk}`)
    })

    proc.addListener("exit", (code) => {
        if (code < 0) {
            atEntry["status"] = ATStatusCode.ERROR
            return
        }
        
        atEntry["status"] = ATStatusCode.FINISHED

    })
}


// Export for other scripts to use
module.exports = {
    AlgoTracker: AlgoTracker,
    ATStatusCode: ATStatusCode,
    AlgoTrackerEntry: AlgoTrackerEntry,
    isAlgoInputValid: isAlgoInputValid,
    createAlgoProcess: createAlgoProcess,
}