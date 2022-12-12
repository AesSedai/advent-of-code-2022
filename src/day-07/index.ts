import fs from "fs"
import { z } from "zod"

const schema = z.string().array()

// load data from file
const data = schema.parse(
    (await fs.promises.readFile("./src/day-7/input.txt")).toString("utf8").slice(0, -1).split("$")
)

const fileSchema = z.tuple([z.number(), z.string()])

data.shift()

type Tree = {
    [k in string]: number
}

const tree: Tree = {}
let path: string[] = []

data.forEach((entry) => {
    const s = entry.split("\n")
    const command = s[0]?.trim()
    const rest = s.slice(1)

    if (command == null) {
        throw new Error("Command cannot be null")
    }

    if (command.startsWith("cd")) {
        const cd = command.replace("cd ", "")

        // go to the root
        if (cd.startsWith("/")) {
            path = ["/"]
        } else if (cd.startsWith("..")) {
            path.pop()
        } else {
            path.push(cd)
        }
        // console.log("cd", cd, "path", path.join("."))
    }

    if (command.startsWith("ls")) {
        let size = 0
        rest.forEach((line) => {
            if (line.length > 0) {
                if (line.startsWith("dir")) {
                    // new dir, ignore
                } else {
                    // file
                    // tree[[...path, ]]
                    const split = line.split(" ")
                    const [fileSize, fileName] = fileSchema.parse([parseInt(split[0] || ""), split[1]])
                    size += fileSize
                    // tree[[...path, fileName].join('.')] = fileSize
                }
            }
        })
        tree[path.join(".")] = size
    }

    // console.log("command", command, "rest", rest)
})

// console.log("tree", tree)

const allKeys = Object.keys(tree).sort()
// console.log("keys", allKeys)

const sumTree = Object.fromEntries(
    allKeys.map((key) => {
        const enclosingKeys = allKeys.filter((k) => k.includes(key))

        const sum = enclosingKeys.reduce((acc, elem) => {
            const e: number | undefined = tree[elem]
            if (e == null) {
                throw new Error("tree[elem] cannot be null")
            }
            return acc + e
        }, 0)
        // console.log("key", key, "enclosing", enclosingKeys, "sum", sum)
        return [key, sum]
    })
)

// console.log(sumTree)

const aggSize = Object.values(sumTree)
    .filter((value) => value <= 100000)
    .reduce((acc, elem) => acc + elem, 0)
console.log("result one", aggSize)

const root = sumTree["/"]
if (root == null) {
    throw new Error("root cannot be null")
}

const systemSize = 70000000
const minSize = 30000000
const currentlyFree = systemSize - root

// console.log("currentlyFree", currentlyFree, "need", minSize - currentlyFree)

const sortedTree = Object.entries(sumTree).sort((a, b) => (a[1] > b[1] ? 1 : -1))
// console.log("sortedTree", JSON.stringify(sortedTree, null, 2))

const smallest = sortedTree.find((elem) => {
    return currentlyFree + elem[1] >= minSize
})

if (smallest == null) {
    throw new Error("smallest cannot be null")
}

// console.log("smallest", smallest)
console.log("result two", smallest[1])
