import fs from "fs"
import { List } from "ts-toolbelt"

const strToNum = (s: string): number => {
    let ascii = s.charCodeAt(0)
    if (ascii >= 97) {
        ascii -= 96
    } else if (ascii >= 65) {
        if (s === "S") {
            // S => 1
            return 1
        } else if (s === "E") {
            // E => 26
            return 26
        } else {
            throw new Error("invalid char")
        }
    }
    return ascii
}

// [y, x] because this is row-major
let startPos: [number, number] = [-1, -1]
let endPos: [number, number] = [-1, -1]

const map = (await fs.promises.readFile("./src/day-12/input.txt"))
    .toString("utf8")
    .slice(0, -1)
    .split("\n")
    .map((row, rIdx) => {
        const cols = row.split("")

        return cols.map((col, cIdx) => {
            const isStart = col === "S"
            const isEnd = col === "E"
            if (isStart) {
                startPos = [rIdx, cIdx]
            } else if (isEnd) {
                endPos = [rIdx, cIdx]
            }
            return {
                x: cIdx,
                y: rIdx,
                isStart: isStart,
                isEnd: isEnd,
                height: strToNum(col),
                distance: isStart ? 0 : -1
            }
        })
    })

// console.log("start", startPos, "end", endPos)

type mapCell = List.UnionOf<List.UnionOf<typeof map>>

const getCell = (cells: typeof map, x: number, y: number): mapCell => {
    const cell = cells?.[y]?.[x]
    if (cell == null) {
        throw new Error(`cell cannot be null for x=${x}, y=${y}`)
    }
    return cell
}

const resetMap = (cells: typeof map): void => {
    cells.forEach((row) => {
        row.forEach((cell) => {
            cell.distance = -1
            cell.isStart = false
        })
    })
}

const getNeighbors = (cells: typeof map, x: number, y: number): mapCell[] => {
    let result: mapCell[] = []
    let u = y - 1
    let up = u >= 0 ? cells?.[u]?.[x] : null
    let d = y + 1
    let down = d < cells.length ? cells?.[d]?.[x] : null
    let l = x - 1
    let left = l >= 0 ? cells?.[y]?.[l] : null
    let r = x + 1
    let right = r < (cells[0]?.length || -1) ? cells?.[y]?.[r] : null

    let current = getCell(cells, x, y)

    if (up != null && up.height - current.height <= 1) {
        result.push(up)
    }
    if (down != null && down.height - current.height <= 1) {
        result.push(down)
    }
    if (left != null && left.height - current.height <= 1) {
        result.push(left)
    }
    if (right != null && right.height - current.height <= 1) {
        result.push(right)
    }

    return result
}

let frontier: mapCell[] = [getCell(map, startPos[1], startPos[0])]

let found = false
let dist = -1

while (!found && frontier.length > 0) {
    // console.log("length", frontier.length)
    const current = frontier.shift()
    if (current == null) {
        throw new Error("current cannot be null")
    }

    const neighbors = getNeighbors(map, current.x, current.y)
    neighbors.forEach((neighbor) => {
        if (neighbor.distance === -1) {
            neighbor.distance = current.distance + 1
            // also add to frontiers
            frontier.push(neighbor)
            // console.log("pushing neighbor to frontier", neighbor)

            if (neighbor.isEnd) {
                // console.log("found end", neighbor, neighbor.distance)
                // found it
                found = true
                dist = neighbor.distance
            }
        }
    })
}

console.log("distance", dist)

// part 2
const bestStart = -1

const possibleStarts = map.flat().filter((cell) => cell.height === 1)

const leastDist = possibleStarts.reduce((acc, curr) => {
    resetMap(map)
    const start = getCell(map, curr.x, curr.y)
    start.isStart = true
    start.distance = 0
    let frontier: mapCell[] = [getCell(map, start.x, start.y)]

    let found = false
    let dist = -1

    while (!found && frontier.length > 0) {
        // console.log("length", frontier.length)
        const current = frontier.shift()
        if (current == null) {
            throw new Error("current cannot be null")
        }

        const neighbors = getNeighbors(map, current.x, current.y)
        neighbors.forEach((neighbor) => {
            if (neighbor.distance === -1) {
                neighbor.distance = current.distance + 1
                // also add to frontiers
                frontier.push(neighbor)
                // console.log("pushing neighbor to frontier", neighbor)

                if (neighbor.isEnd) {
                    // console.log("found end", neighbor, neighbor.distance)
                    // found it
                    found = true
                    dist = neighbor.distance
                }
            }
        })
    }

    // console.log("newStart", start, "distance", dist)

    if (dist > -1) {
        return acc < dist ? acc : dist
    } else {
        return acc
    }
}, 100000)

console.log("leastDist", leastDist)
