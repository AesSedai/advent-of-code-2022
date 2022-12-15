import fs from "fs"
import { isNumber } from "radash"

type Tree<T> = T | Array<Tree<T>>

const data: Tree<number>[][] = (await fs.promises.readFile("./src/day-13/input.txt"))
    .toString("utf8")
    .slice(0, -1)
    .split("\n\n")
    .map((pair) => {
        // console.log("pair", pair)
        return pair.split("\n").map((v) => JSON.parse(v))
    })

const compare = (left: Tree<number>, right: Tree<number>): number => {
    if (left === right) return 0
    if (left == null) return -1
    if (right == null) return 1
    if (isNumber(left) && isNumber(right)) return left - right
    if (isNumber(left)) return compare([left], right)
    if (isNumber(right)) return compare(left, [right])

    const len = Math.max(left.length, right.length)

    for (let i = 0; i < len; i++) {
        // @ts-expect-error
        const val = compare(left[i], right[i])
        if (val === 0) continue
        return val
    }

    return 0
}

// part 1

let indexSum = 0

data.forEach(([left, right], index) => {
    if (left == null || right == null) {
        throw new Error("cannot be null")
    }

    if (compare(left, right) <= 0) {
        indexSum += index + 1
    }
})

console.log("indexSum", indexSum)

// part 2
const sorted = data
    .concat([[[[2]]], [[[6]]]])
    .flat()
    .sort(compare)

const firstDivider = JSON.stringify([[2]])
const secondDivider = JSON.stringify([[6]])

const firstIdx = sorted.findIndex((elem) => JSON.stringify(elem) == firstDivider) + 1
const secondIdx = sorted.findIndex((elem) => JSON.stringify(elem) == secondDivider) + 1
console.log("decoder", firstIdx * secondIdx)
