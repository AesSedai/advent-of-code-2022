import fs from "fs"
import { z } from "zod"

const schema = z.number().array().array()

// load data from file
const data = schema.parse(
    (await fs.promises.readFile("./src/day-8/input.txt"))
        .toString("utf8")
        .slice(0, -1)
        .split("\n")
        .map((row) => row.split("").map((n) => parseInt(n)))
)

const height = data.length
const width = data[0]?.length || 0
const perimeter = height * 2 + width * 2 - 4

let visible = perimeter
let maxScen = 0

data.forEach((row, rIdx) => {
    if (rIdx != 0 && rIdx != height - 1) {
        row.forEach((cell, cIdx) => {
            if (cIdx != 0 && cIdx != width - 1) {
                const row = data?.[rIdx]
                const topRows = data.slice(0, rIdx)
                const bottomRows = data.slice(rIdx + 1, height)
                if (row == null) {
                    throw new Error("row cannot be null")
                }
                if (topRows == null) {
                    throw new Error("topRows cannot be null")
                }
                if (bottomRows == null) {
                    throw new Error("bottomRows cannot be null")
                }

                const leftVis = !row.slice(0, cIdx).some((elem) => elem >= cell)
                const leftScenIdx = row
                    .slice(0, cIdx)
                    .reverse()
                    .findIndex((elem) => elem >= cell)
                const leftScen = leftScenIdx === -1 ? cIdx : leftScenIdx + 1

                const rightVis = !row.slice(cIdx + 1, width).some((elem) => elem >= cell)
                const rightScenIdx = row.slice(cIdx + 1, width).findIndex((elem) => elem >= cell)
                const rightScen = rightScenIdx === -1 ? width - cIdx - 1 : rightScenIdx + 1

                const topVis = !topRows.some((row) => {
                    const elem = row[cIdx]
                    if (elem == null) {
                        throw new Error("topVis row elem cannot be null")
                    }
                    return elem >= cell
                })
                const topScenIdx = topRows.reverse().findIndex((row) => {
                    const elem = row[cIdx]
                    if (elem == null) {
                        throw new Error("topScenIdx row elem cannot be null")
                    }
                    return elem >= cell
                })
                const topScen = topScenIdx === -1 ? rIdx : topScenIdx + 1

                const bottomVis = !bottomRows.some((row) => {
                    const elem = row[cIdx]
                    if (elem == null) {
                        throw new Error("bottomVis row elem cannot be null")
                    }
                    return elem >= cell
                })
                const bottomScenIdx = bottomRows.findIndex((row) => {
                    const elem = row[cIdx]
                    if (elem == null) {
                        throw new Error("topScenIdx row elem cannot be null")
                    }
                    return elem >= cell
                })
                const bottomScen = bottomScenIdx === -1 ? height - rIdx - 1 : bottomScenIdx + 1

                const scen = leftScen * rightScen * topScen * bottomScen
                if (scen > maxScen) {
                    maxScen = scen
                }

                if ([leftVis, rightVis, topVis, bottomVis].some((elem) => elem)) {
                    visible += 1
                }
            }
        })
    }
})

console.log("visible", visible, "scen", maxScen)
