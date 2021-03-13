export async function main(ns) {
  const target = ns.args[0]
  const threads = ns.args[1]
  const delay = ns.args[2]

  if (delay && delay > 0) {
    await ns.sleep(delay)
  }

  ns.print(`Starting operation: grow on ${target} in ${threads} threads`)
  await ns.grow(target, { threads, stock: true })
  ns.exit()
}
