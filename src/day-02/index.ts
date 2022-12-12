import fs from "fs"
import { z } from "zod"

type Pairs = `${"A" | "B" | "C"} ${"X" | "Y" | "Z"}`

const schema = z.custom<Pairs>((val) => /^[A|B|C]\s[X|Y|Z]$/g.test(val as string)).array()

// load data from file; split by newline to get each tournament round
const data = schema.parse(
    (await fs.promises.readFile("./src/day-2/input.txt")).toString("utf8").slice(0, -1).split("\n")
)

// personal points for playing a certain type
enum Values {
    X = 1,
    Y = 2,
    Z = 3
}

// outcome points for win, draw, and loss
enum Outcome {
    W = 6,
    D = 3,
    L = 0
}

// A: rock, B: paper, C: scissors
// X: rock (+1), Y: paper (+2), Z: scissors (+3)
// win: +6, draw: +3, loss: +0
const mapping1: { [K in Pairs]: number } = {
    "A X": Values.X + Outcome.D,
    "A Y": Values.Y + Outcome.W,
    "A Z": Values.Z + Outcome.L,
    "B X": Values.X + Outcome.L,
    "B Y": Values.Y + Outcome.D,
    "B Z": Values.Z + Outcome.W,
    "C X": Values.X + Outcome.W,
    "C Y": Values.Y + Outcome.L,
    "C Z": Values.Z + Outcome.D
}

// A: rock, B: paper, C: scissors
// X: lose, Y: draw, Z: win
// win: +6, draw: +3, loss: +0
const mapping2: { [K in Pairs]: number } = {
    "A X": Values.Z + Outcome.L,
    "A Y": Values.X + Outcome.D,
    "A Z": Values.Y + Outcome.W,
    "B X": Values.X + Outcome.L,
    "B Y": Values.Y + Outcome.D,
    "B Z": Values.Z + Outcome.W,
    "C X": Values.Y + Outcome.L,
    "C Y": Values.Z + Outcome.D,
    "C Z": Values.X + Outcome.W
}

console.log(
    "Summary 1: ",
    data.reduce((acc, cur) => (acc += mapping1[cur]), 0)
)
console.log(
    "Summary 2: ",
    data.reduce((acc, cur) => (acc += mapping2[cur]), 0)
)

export {}
