import fs from "fs"
import { cluster } from "radash"
import { z } from "zod"

const schema = z.union([z.tuple([z.literal("addx"), z.number()]), z.literal("noop")]).array()

const input = (await fs.promises.readFile("./src/day-10/input.txt"))
    .toString("utf8")
    .slice(0, -1)
    .split("\n")
    .map((row) => {
        const fields = row.split(" ")
        const op = fields[0]
        const arg = fields[1]
        if (op === "addx") {
            if (arg == null) {
                throw new Error("arg cannot be null when op is addx")
            }
            return [op, parseInt(arg)]
        } else if (op === "noop") {
            return op
        } else {
            throw new Error("unsupported op type")
        }
    })

const cycles = [20, 60, 100, 140, 180, 220]
let signal = 0
let cycle = 0
let register = 1

const data = schema.parse(input)
// console.log("data", data)

const screen = Array.from({ length: 240 }, () => ".")

const print = (screen: string[]): string => {
    const lines = cluster(screen, 40).map((line) => line.join(""))
    return lines.join("\n")
}

data.forEach((command) => {
    if (cycle <= 240) {
        if (command === "noop") {
            cycle += 1
            if (cycles.includes(cycle)) {
                signal += cycle * register
            }

            if (Math.abs((cycle % 40) - register - 1) <= 1) {
                // draw at prev
                screen[cycle - 1] = "#"
            }
        } else {
            cycle += 1
            if (cycles.includes(cycle)) {
                signal += cycle * register
            }

            if (Math.abs((cycle % 40) - register - 1) <= 1) {
                // draw at prev
                screen[cycle - 1] = "#"
            }

            cycle += 1
            if (cycles.includes(cycle)) {
                signal += cycle * register
            }

            if (Math.abs((cycle % 40) - register - 1) <= 1) {
                // draw at prev
                screen[cycle - 1] = "#"
            }
            register += command[1]
        }
        // console.log("register", register, "cycle", cycle, "mod", (cycle) % 40)
        // console.log(print(screen))
    }
})

console.log("signal", signal)
console.log(print(screen))
