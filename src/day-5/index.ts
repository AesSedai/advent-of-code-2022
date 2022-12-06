import fs from "fs"
import { cluster } from "radash"
import { z } from "zod"

const isLetter = (input: string): boolean => {
    return input.length === 1 && /[A-Z]/.test(input)
}

const schema = z.string().array()

// load data from file; split by newline to get each tournament round
const data = schema.parse(
    (await fs.promises.readFile("./src/day-5/input.txt")).toString("utf8").slice(0, -1).split("\n\n")
)

// split firt part
const initialStacks = data[0]?.split("\n")
const instructions = data[1]?.split("\n")
const stackOne: { [K in number]: string[] } = {}
const stackTwo: { [K in number]: string[] } = {}

if (initialStacks == null) {
    throw new Error("Stacks cannot be null")
}

if (instructions == null) {
    throw new Error("Instructions cannot be null")
}

// remove the last element, it's the stacks numbers and not necessary
initialStacks.pop()

initialStacks.forEach((stack) => {
    // cluster each line into groups of 4, since it's either 4 spaces or "[letter] "
    const splitStack = cluster(stack.split(""), 4)

    // iterate over clusters in this line and push any letters to their respective stack
    splitStack.forEach((split, stackIdx) => {
        const letter = split.filter((str) => isLetter(str))[0]
        if (letter != null) {
            stackOne[stackIdx + 1] == null ? (stackOne[stackIdx + 1] = [letter]) : stackOne[stackIdx + 1]?.push(letter)
            stackTwo[stackIdx + 1] == null ? (stackTwo[stackIdx + 1] = [letter]) : stackTwo[stackIdx + 1]?.push(letter)
        }
    })
})

// regular expression to extract the instruction digits into known groups
const regExp = /move (?<quantity>\d+) from (?<from>\d+) to (?<to>\d+)/gm

// go over each instruction line, extract the params, and then splice the
// entries and reverse the order and unshift the result from the source
// to the target
instructions.forEach((line) => {
    for (const match of line.matchAll(regExp)) {
        if (
            match != null &&
            match.groups != null &&
            match.groups.quantity != null &&
            match.groups.from != null &&
            match.groups.to != null
        ) {
            const fromStackOne = stackOne[parseInt(match.groups.from)]
            const toStackOne = stackOne[parseInt(match.groups.to)]
            if (fromStackOne != null && toStackOne != null) {
                toStackOne.unshift(...fromStackOne.splice(0, parseInt(match.groups.quantity)).reverse())
            }

            const fromStackTwo = stackTwo[parseInt(match.groups.from)]
            const toStackTwo = stackTwo[parseInt(match.groups.to)]
            if (fromStackTwo != null && toStackTwo != null) {
                toStackTwo.unshift(...fromStackTwo.splice(0, parseInt(match.groups.quantity)))
            }
        }
    }
})

// I should have just used an array, oh well
// sort object by keys, then reduce and pluck first entry from each stack
const resultOne = Object.entries(stackOne)
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .reduce((acc, curr) => {
        return (acc += curr[1][0])
    }, "")

const resultTwo = Object.entries(stackTwo)
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .reduce((acc, curr) => {
        return (acc += curr[1][0])
    }, "")

console.log("resultOne", resultOne)
console.log("resultTwo", resultTwo)
