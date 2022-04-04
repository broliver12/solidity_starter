/****************************************************************************/
/* Written by Oliver Straszynski                                            */
/* https://github.com/broliver12/                                           */
/* Subject to MIT License                                                   */
/****************************************************************************/

/****************************************************************************/
/* This will delete and replace (clean) your entire build folder!           */
/* Don't run this between deploying and verifying.                          */
/****************************************************************************/
const fs = require('fs')
const { writeToFile } = require('./util_fs.js')

const data = '*\n!.gitignore'

const clean = async () => {
    const rm = await fs.promises.rmdir('./build/', {
        recursive: true,
    })
    const artifacts = await fs.promises.mkdir('./build/artifacts/', {
        recursive: true,
    })
    const cache = await fs.promises.mkdir('./build/cache/', {
        recursive: true,
    })
    writeToFile('./build/artifacts/.gitignore', data)
    writeToFile('./build/cache/.gitignore', data)
}

/***************************************************************************
 Handle exit and errors gracefully, don't edit this!
****************************************************************************/
async function main() {
    clean()
        .then(() => {
            process.exit(0)
        })
        .catch((error) => {
            console.error(error)
            process.exit(1)
        })
}
main()
/****************************************************************************/
