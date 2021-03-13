export async function main(ns) {
  const target = ns.args[0]
  const threads = ns.args[1]
  const delay = ns.args[2]

  if (delay && delay > 0) {
    await ns.sleep(delay)
  }

  ns.print(`Starting operation: weaken on ${target} in ${threads} threads`)
  await ns.weaken(target, { threads, stock: true })
  ns.exit()
}
