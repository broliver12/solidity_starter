/****************************************************************************/
/* Written by Oliver Straszynski                                            */
/* https://github.com/broliver12/                                           */
/* Subject to MIT License                                                   */
/****************************************************************************/

const ps = require('prompt-sync')
const prm = ps()

// Formats a string with a custom CLI prefix.
// Helps us see which messages are coming from the deploy script.
const _lf = (msg) => {
    return `>> ${msg}`
}

// Exported log functions.
// Use these instead of console.log and prm to append CLI prefix
const prompt = (msg) => {
    return prm(_lf(msg))
}
const log = (msg) => {
    console.log(_lf(msg))
}
const logs = (msgs, color) => {
    msgs.map((x) => {
        console.log(applyFormat(color), _lf(x))
    })
}

const applyFormat = (color) => {
    if (color == null || color == undefined) {
        return '%s'
    }

    if (color == 'red') {
        return format.red
    } else if (color == 'green') {
        return format.green
    } else if (color == 'yellow') {
        return format.yellow
    }
}

const format = {
    red: '\x1b[31m%s\x1b[0m',
    green: '\x1b[32m%s\x1b[0m',
    yellow: '\x1b[33m%s\x1b[0m',
}

exports.log = log
exports.logs = logs
exports.prompt = prompt
