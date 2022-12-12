import fs from "fs"
import { z } from "zod"

const schema = z.string()

// load data from file
const data = schema.parse((await fs.promises.readFile("./src/day-6/input.txt")).toString("utf8").slice(0, -1))

let foundIdxOne = -1
let foundIdxTwo = -1

// use a sliding window to check over the string
// when the length and uniq length are the same, that's the answer
for (let idx = 4; idx < data.length; idx++) {
    const str = data.slice(idx - 4, idx).split("")
    if (str.length == [...new Set(str)].length) {
        foundIdxOne = idx
        break
    }
}

for (let idx = 14; idx < data.length; idx++) {
    const str = data.slice(idx - 14, idx).split("")
    if (str.length == [...new Set(str)].length) {
        foundIdxTwo = idx
        break
    }
}

console.log("result one", foundIdxOne)
console.log("result two", foundIdxTwo)
