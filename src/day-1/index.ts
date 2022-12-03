import fs from "fs"
import { z } from "zod"

const schema = z.string()

// load data from file; last character is an extra \n character so slice it off early to
// prevent the need to do extra runtime processing to filter it out later
const data = schema.parse((await fs.promises.readFile("./src/day-1/input.txt")).toString("utf8").slice(0, -1))

// split entries into group, split groups into individual strings, cast to integers, then sum
// and sort from largest to smallest
const processed = data
    .split("\n\n")
    .map((backpack) => {
        return backpack
            .split("\n")
            .map((item) => parseInt(item))
            .reduce((acc, curr) => acc + curr, 0)
    })
    .sort((a, b) => (a > b ? -1 : 1))

console.log("Most calories:", processed[0])
console.log(
    "Top 3 calories:",
    processed.slice(0, 3).reduce((acc, curr) => acc + curr, 0)
)

export {}
