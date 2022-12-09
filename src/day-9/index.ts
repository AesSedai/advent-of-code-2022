import fs from "fs"
import { z } from "zod"

const schema = z.tuple([z.enum(["L", "R", "U", "D"]), z.number()]).array()

const input = (await fs.promises.readFile("./src/day-9/input.txt"))
    .toString("utf8")
    .slice(0, -1)
    .split("\n")
    .map((row) => {
        const fields = row.split(" ")
        const dir = fields[0]
        const amt = fields[1]
        if (dir == null || amt == null) {
            throw new Error("dir and amt cannot be null")
        }
        return [dir, parseInt(amt)]
    })

const data = schema.parse(input)

// number of trailing elements
// part one length = 1, part two length = 9
const length = 9

const head: [number, number] = [0, 0]
const tail: [number, number][] = Array.from({ length: length }, () => [0, 0])
const visited = new Set<string>()

const isAdjacent = (p1: [number, number], p2: [number, number]): boolean => {
    return Math.abs(p1[0] - p2[0]) <= 1 && Math.abs(p1[1] - p2[1]) <= 1
}

data.forEach((line) => {
    const steps = [...Array(line[1]).keys()]
    steps.forEach((elem) => {
        switch (line[0]) {
            case "L":
                head[0] -= 1
                break
            case "R":
                head[0] += 1
                break
            case "U":
                head[1] -= 1
                break
            case "D":
                head[1] += 1
                break
        }

        let prev = head

        tail.forEach((elem) => {
            if (!isAdjacent(prev, elem)) {
                if (prev[0] === elem[0]) {
                    // same column
                    if (prev[1] > elem[1]) {
                        elem[1] += 1
                    } else {
                        elem[1] -= 1
                    }
                } else if (prev[1] === elem[1]) {
                    // same row
                    if (prev[0] > elem[0]) {
                        elem[0] += 1
                    } else {
                        elem[0] -= 1
                    }
                } else if (prev[0] > elem[0]) {
                    elem[0] += 1
                    // tail is to the left
                    if (prev[1] > elem[1]) {
                        // tail is below head
                        elem[1] += 1
                    } else {
                        // tail is above head
                        elem[1] -= 1
                    }
                } else if (prev[0] < elem[0]) {
                    // tail is to the right
                    elem[0] -= 1
                    if (prev[1] > elem[1]) {
                        // tail is below head
                        elem[1] += 1
                    } else {
                        // tail is above head
                        elem[1] -= 1
                    }
                }
            }
            prev = elem
        })
        visited.add(tail.slice(-1).join(":"))
    })
})

console.log("visited", visited.size)
