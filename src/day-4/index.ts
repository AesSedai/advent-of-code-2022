import fs from "fs"
import { z } from "zod"

const schema = z.string().array()

// load data from file; split by newline to get each tournament round
const data = schema.parse(
    (await fs.promises.readFile("./src/day-4/input.txt")).toString("utf8").slice(0, -1).split("\n")
)

const contained = data.filter((pair) => {
    const first = pair.split(",")[0]
    const second = pair.split(",")[1]
    if (first == null || second == null) {
        throw new Error("Pair cannot be null")
    }

    const [firstLower, firstUpper] = first.split("-").map((num) => parseInt(num))
    const [secondLower, secondUpper] = second.split("-").map((num) => parseInt(num))

    if (firstLower == null || firstUpper == null || secondLower == null || secondUpper == null) {
        throw new Error("Lowers and Uppers cannot be null")
    }

    return (
        (firstLower >= secondLower && firstUpper <= secondUpper) ||
        (secondLower >= firstLower && secondUpper <= firstUpper)
    )
})

console.log("contained", contained.length)

const overlap = data.filter((pair) => {
    const first = pair.split(",")[0]
    const second = pair.split(",")[1]
    if (first == null || second == null) {
        throw new Error("Pair cannot be null")
    }

    const [firstLower, firstUpper] = first.split("-").map((num) => parseInt(num))
    const [secondLower, secondUpper] = second.split("-").map((num) => parseInt(num))

    if (firstLower == null || firstUpper == null || secondLower == null || secondUpper == null) {
        throw new Error("Lowers and Uppers cannot be null")
    }

    return (
        (firstLower <= secondLower && firstUpper >= secondLower) ||
        (firstLower <= secondUpper && firstUpper >= secondUpper) ||
        (secondLower <= firstLower && secondUpper >= firstLower) ||
        (secondLower <= firstUpper && secondUpper >= firstUpper)
    )
})

console.log("overlap", overlap.length)
