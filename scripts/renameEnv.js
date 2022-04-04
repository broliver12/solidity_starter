/****************************************************************************/
/* Written by Oliver Straszynski                                            */
/* https://github.com/broliver12/                                           */
/* Subject to MIT License                                                   */
/****************************************************************************/

const fs = require('fs')

const currPath = './env_TEMPLATE'
const newPath = './env'

try {
    fs.renameSync(currPath, newPath)
    console.log('Successfully renamed environment directory.')
} catch (err) {
    console.log(err)
}
