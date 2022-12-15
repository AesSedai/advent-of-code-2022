import fs from "fs"
import { range } from "radash"
import { List } from "ts-toolbelt"
import { z } from "zod"

const schema = z
    .object({
        sx: z.number(),
        sy: z.number(),
        bx: z.number(),
        by: z.number(),
        dist: z.number()
    })
    .array()

// Sensor at x=2, y=18: closest beacon is at x=-2, y=15
const regExp = /Sensor at x=(?<sx>-?\d+), y=(?<sy>-?\d+): closest beacon is at x=(?<bx>-?\d+), y=(?<by>-?\d+)/gm

let xMin = 10000000
let xMax = 0
let yMin = 10000000
let yMax = 0

const data = schema.parse(
    (await fs.promises.readFile("./src/day-15/input.txt"))
        .toString("utf8")
        .slice(0, -1)
        .split("\n")
        .map((line) => {
            for (const match of line.matchAll(regExp)) {
                if (
                    match != null &&
                    match.groups != null &&
                    match.groups.sx != null &&
                    match.groups.sy != null &&
                    match.groups.bx != null &&
                    match.groups.by != null
                ) {
                    let result = {
                        sx: parseInt(match.groups.sx),
                        sy: parseInt(match.groups.sy),
                        bx: parseInt(match.groups.bx),
                        by: parseInt(match.groups.by),
                        dist:
                            Math.abs(parseInt(match.groups.sx) - parseInt(match.groups.bx)) +
                            Math.abs(parseInt(match.groups.sy) - parseInt(match.groups.by))
                    }

                    xMin = Math.min(xMin, result.sx, result.bx)
                    xMax = Math.max(xMax, result.sx, result.bx)
                    yMin = Math.min(yMin, result.sy, result.by)
                    yMax = Math.max(yMax, result.sy, result.by)

                    return result
                } else {
                    throw new Error("cannot be null")
                }
            }

            throw new Error("cannot have no matches")
        })
)

xMin -= 1000000
xMax += 1000000

console.log("boundary", xMin, xMax, yMin, yMax)
console.log("data", data)

let invalidSpots = 0
const y = 2000000

type cell = List.UnionOf<typeof data>

const getCoveringSensor = (map: typeof data, x: number, y: number): cell | undefined => {
    const closest = map.find((cell) => {
        const dist = Math.abs(cell.sx - x) + Math.abs(cell.sy - y)
        return dist > 0 && dist <= cell.dist
    })
    return closest
}

const isOnBeacon = (map: typeof data, x: Number, y: number): boolean => {
    return map.find((cell) => cell.bx === x && cell.by === y) != null
}

const isOnBeaconOrSensor = (map: typeof data, x: Number, y: number): boolean => {
    return map.find((cell) => (cell.sx === x && cell.sy === y) || (cell.bx === x && cell.by === y)) != null
}

for (const x of range(xMin, xMax)) {
    if (isOnBeacon(data, x, y)) {
        continue
    } else {
        // check distances
        const closest = getCoveringSensor(data, x, y)
        if (closest != null) {
            // console.log(`invalid spot at x=${x}, y=${y}`)
            invalidSpots += 1
        }
    }
}

console.log("invalidSpots", invalidSpots)

for (let py = 0; py < 4000000; py++) {
    for (let px = 0; px < 4000000; px++) {
        if (isOnBeaconOrSensor(data, px, py)) {
            continue
        }

        const sensor = getCoveringSensor(data, px, py)
        if (sensor == null) {
            console.log(`spot at x=${px}, y=${py}; ${px * 4000000 + py}`)
        } else {
            // jump to the edge of the detection range for this sensor on the x axis
            const xDist = sensor.dist - Math.abs(sensor.sy - py) + sensor.sx - px
            // console.log(`px: ${px}, py: ${py}, sensor: ${sensor.sx} ${sensor.sy}, xDist, ${xDist}`)
            px += xDist
        }
    }
}
