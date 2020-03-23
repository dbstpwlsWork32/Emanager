import * as fs from "fs"

// test code
fs.promises.readdir('./src')
  .then((result: string[]) => {
    console.log(result)
  })