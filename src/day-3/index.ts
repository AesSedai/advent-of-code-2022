import fs from "fs"
import { cluster } from "radash"
import { z } from "zod"

// convert a-z to 1-26 and A-Z to 27-52
const strToNum = (s: string): number => {
    let ascii = s.charCodeAt(0)
    if (ascii >= 97) {
        ascii -= 96
    } else if (ascii >= 65) {
        ascii -= 38
    }
    return ascii
}

const schema = z.string().array()

// load data from file; split by newline to get each tournament round
const data = schema.parse(
    (await fs.promises.readFile("./src/day-3/input.txt")).toString("utf8").slice(0, -1).split("\n")
)

// calculate array intersection from halves and return the first result for each line
const overlaps = data.map((backpack) => {
    const l = backpack.length / 2
    const firstHalf = backpack.slice(0, l).split("")
    const lastHalf = backpack.slice(l).split("")
    const overlap = firstHalf.filter((char) => lastHalf.includes(char))
    return overlap[0] as string
})

const double = overlaps.reduce((acc, curr) => acc + strToNum(curr), 0)
console.log("Sum two:", double)

// segment the single input array into arrays with 3 elemenets each
const clusters = cluster(data, 3)

// calculate the array intersection for all three lines and take the first overlapping item from the result
const tripleOverlap = clusters.map((cluster) => {
    const exploded = cluster.map((str) => str.split(""))

    if (exploded[0] == null) {
        throw new Error("First element of `exploded` cannot be null")
    }

    const totalOverlap = exploded.reduce<string[]>((acc, curr) => {
        return acc.filter((char) => curr.includes(char))
    }, exploded[0])

    if (totalOverlap[0] == null) {
        throw new Error(`Triple overlap group cannot be null: ${cluster}`)
    }

    return totalOverlap[0]
})

const triple = tripleOverlap.reduce((acc, curr) => acc + strToNum(curr), 0)
console.log("Sum three:", triple)

export {}
