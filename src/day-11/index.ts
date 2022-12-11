import fs from "fs"
import { partial } from "radash"

const opHof = (input: string): ((old: number) => number) => {
    input = input.trim().replace("Operation: new = old", "")
    // console.log("opHof input", input)
    let op = ""

    if (input.includes("*")) {
        op = "*"
    } else if (input.includes("/")) {
        op = "/"
    } else if (input.includes("+")) {
        op = "+"
    } else if (input.includes("-")) {
        op = "-"
    }

    if (input.includes("old")) {
        // no constant, just self reference
        if (op === "*") {
            return (old: number): number => {
                return old * old
            }
        }
        if (op === "/") {
            return (old: number): number => {
                return old / old
            }
        }
        if (op === "+") {
            return (old: number): number => {
                return old - old
            }
        }
        if (op === "-") {
            return (old: number): number => {
                return old - old
            }
        }
    } else {
        const constant = extractConst(input)
        if (op === "*") {
            return partial((constant: number, old: number): number => {
                return old * constant
            }, constant)
        }
        if (op === "/") {
            return partial((constant: number, old: number): number => {
                return old / constant
            }, constant)
        }
        if (op === "+") {
            return partial((constant: number, old: number): number => {
                return old + constant
            }, constant)
        }
        if (op === "-") {
            return partial((constant: number, old: number): number => {
                return old - constant
            }, constant)
        }
    }

    throw new Error("Oops")
}

const testHof = (input: string): ((old: number) => boolean) => {
    return partial((constant: number, num: number) => {
        return num % constant === 0
    }, extractConst(input))
}

const extractConst = (input: string): number => {
    const regExp = /(?<constant>\d+)/
    const extract = input.match(regExp)?.groups?.constant
    const constant = extract == null ? null : parseInt(extract)
    if (constant == null) {
        throw new Error("constant cannot be null")
    }

    return constant
}

const data = (await fs.promises.readFile("./src/day-11/input.txt"))
    .toString("utf8")
    .slice(0, -1)
    .split("\n\n")
    .map((row) => {
        const lines = row.split("\n")
        const items = lines[1]
        const operation = lines[2]
        const test = lines[3]
        const truthy = lines[4]
        const falsey = lines[5]

        if (items == null || operation == null || test == null || truthy == null || falsey == null) {
            throw new Error("cannot be null")
        }

        return {
            items: items
                .trim()
                .replace("Starting items: ", "")
                .split(",")
                .map((item) => parseInt(item.trim())),
            op: opHof(operation),
            test: testHof(test),
            div: extractConst(test),
            truthy: extractConst(truthy),
            falsey: extractConst(falsey),
            inspectCount: 0
        }
    })

// calculate divisor LCMs to optimize stored number size for part 2
const lcm = data.reduce((acc, curr) => (acc *= curr.div), 1)

// part 1 is 20 rounds
// part 2 is 10000 rounds
const part: 1 | 2 = 2
// @ts-expect-error
const rounds = part === 1 ? 20 : 10000

for (let i = 0; i < rounds; i++) {
    data.forEach((monkey) => {
        while (monkey.items.length > 0) {
            const item = monkey.items.shift()
            if (item == null) {
                throw new Error("cannot be length 0 and null?? Bad TS")
            }

            // part 1 has a Math.floor(worry / 3)
            // part 2 uses LCM to keep divisors low
            // @ts-expect-error
            const newWorry = part === 1 ? Math.floor(monkey.op(item) / 3) : monkey.op(item) % lcm
            const recipient = data[monkey.test(newWorry) ? monkey.truthy : monkey.falsey]

            if (recipient == null) {
                throw new Error("recipient cannot be null")
            }

            recipient.items.push(newWorry)
            monkey.inspectCount += 1
        }
    })
}

console.log("data after", data)

const most = data.sort((a, b) => (a.inspectCount > b.inspectCount ? -1 : 1))
console.log("most", (most[0]?.inspectCount || 0) * (most[1]?.inspectCount || 0))
