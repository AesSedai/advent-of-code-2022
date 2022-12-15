import fs from "fs"
import { range } from "radash"
import { z } from "zod"

const schema = z.tuple([z.number(), z.number()]).array().array()

let xMin = 1000
let xMax = 0
let yMin = 1000
let yMax = 0

const data = schema.parse(
    (await fs.promises.readFile("./src/day-14/input.txt"))
        .toString("utf8")
        .slice(0, -1)
        .split("\n")
        .map((line) => {
            const parts = line.split(" -> ")

            return parts.map((piece) => {
                const bits = piece.split(",")
                let x = parseInt(bits?.[0] ?? "-1")
                let y = parseInt(bits?.[1] ?? "-1")

                if (x === -1 || y === -1) {
                    throw new Error("x / y cannot be null")
                }

                if (x < xMin) {
                    xMin = x
                }
                if (x > xMax) {
                    xMax = x
                }
                if (y < yMin) {
                    yMin = y
                }
                if (y > yMax) {
                    yMax = y
                }

                return [x, y]
            })
        })
)

console.log("data", data, "xMin", xMin, "xMax", xMax, "yMin", yMin, "yMax", yMax)
xMin = xMin - 400
xMax = xMax + 400
yMax = yMax + 3

interface Point {
    x: number
    y: number
}

const startPos: Point = { x: 500, y: 0 }
const map: string[][] = Array.from({ length: yMax }, () => [])

enum State {
    Air = ".",
    Sand = "o",
    Rock = "#"
}

// fill the map with air
map.forEach((row) => {
    for (const i of range(xMin, xMax)) {
        row[i] = State.Air
    }
})

// fill the map with rocks
data.forEach((path) => {
    let prev: [number, number] = [-1, -1]
    path.forEach((rock, idx) => {
        if (idx === 0) {
            prev = rock
        } else {
            // fill in from prev to rock

            if (prev[0] === rock[0]) {
                // x coord is the same, draw a vertical line
                const bottom = Math.max(prev[1], rock[1])
                const top = Math.min(prev[1], rock[1])
                for (const i of range(top, bottom)) {
                    const row = map[i]
                    if (row == null) {
                        throw new Error("row cannot be null")
                    }
                    row[prev[0]] = State.Rock
                }
            } else if (prev[1] === rock[1]) {
                // y coord is the same, draw a horizontal line
                const left = Math.min(prev[0], rock[0])
                const right = Math.max(prev[0], rock[0])
                const row = map[prev[1]]
                if (row == null) {
                    throw new Error("row cannot be null")
                }
                for (const i of range(left, right)) {
                    row[i] = State.Rock
                }
            }

            prev = rock
        }
    })
})

// add bottom layer for part 2
const floor = map.at(-1)
if (floor == null) {
    throw new Error("floor cannot be null")
}
for (const i of range(xMin, xMax)) {
    floor[i] = State.Rock
}

const print = (cells: typeof map): void => {
    cells.forEach((row) => {
        console.log(row.slice(xMin).join(""))
    })
}

print(map)

const getNextCoord = (cells: typeof map, start: Point): Point | null => {
    let current: Point = { x: start.x, y: start.y }
    let settled = false
    let voided = false

    if (cells?.[start.y]?.[start.x] === State.Sand) {
        return null
    }

    while (!settled && !voided) {
        // has it fallen?
        if (current.y >= yMax - 1) {
            // voided
            voided = true
            continue
        }

        // can go down?
        const nextRow = cells[current.y + 1]
        if (nextRow == null) {
            throw new Error("nextRow cannot be null")
        }

        const down = nextRow[current.x]
        if (down == null) {
            throw new Error("down cannot be null")
        }
        if (down === State.Air) {
            // keep falling
            current = { x: current.x, y: current.y + 1 }
            continue
        } else if (down === State.Rock || down === State.Sand) {
            // try to move down and left
            const downLeft = nextRow[current.x - 1]
            if (downLeft == null) {
                throw new Error("downLeft cannot be null")
            }
            if (downLeft === State.Air) {
                current = { x: current.x - 1, y: current.y + 1 }
                continue
            } else {
                // try to move down and right
                const downRight = nextRow[current.x + 1]
                if (downRight == null) {
                    throw new Error("downRight cannot be null")
                }
                if (downRight === State.Air) {
                    current = { x: current.x + 1, y: current.y + 1 }
                    continue
                } else {
                    // settled
                    settled = true
                }
            }
        }
    }

    if (settled) {
        return current
    } else {
        return null
    }
}

let grains = 0

let next = getNextCoord(map, startPos)
while (next != null) {
    grains += 1
    if (next == null) {
        console.log("oops, next is null")
        break
    } else {
        const row = map?.[next.y]
        if (row == null) {
            throw new Error(`row shouldn't be null? next: ${next}`)
        }
        row[next.x] = State.Sand
        if (grains % 1000 == 0) {
            console.log("grains", grains)
            print(map)
        }
    }
    next = getNextCoord(map, startPos)
}

print(map)
console.log("grains", grains)
