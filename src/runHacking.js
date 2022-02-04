function localeHHMMSS(ms = 0) {
  if (!ms) {
    ms = new Date().getTime()
  }

  return new Date(ms).toLocaleTimeString()
}

export async function main(ns) {
  ns.tprint(`[${localeHHMMSS()}] Starting runHacking.js`)

  let hostname = ns.getHostname()

  if (hostname !== 'home') {
    throw new Exception('Run the script from home')
  }

  const homeRam = ns.getServerRam('home').shift()

  if (homeRam >= 32) {
    ns.tprint(`[${localeHHMMSS()}] Spawning spider.js`)
    await ns.run('spider.js', 1, 'playerServers.js')

    let player = ns.getPlayer();
    if (player.hasTixApiAccess) {
      ns.tprint(`[${localeHHMMSS()}] Player has Tix API Access`)
      try {
        ns.stock.short();
      }
      catch (e) {
        ns.tprint(e.toString())
        const cantShort = e.toString().includes("BitNode-8")
        if (player.has4SDataTixApi) {
          if (cantShort) {
            ns.tprint(`[${localeHHMMSS()}] Spawning startStock.js`)
            await ns.run('startStock.js', 1)
          } else {
            ns.tprint(`[${localeHHMMSS()}] Spawning stockMarketer4s.js`)
            await ns.run('stockMarketer4s.js', 1)
          }
        } else if (!player.has4SDataTixApi && !cantShort) {
          ns.tprint(`[${localeHHMMSS()}] Spawning stockMarketer.js`)
          await ns.run('stockMarketer.js', 1)
        }
      }
    }
    ns.tprint(`[${localeHHMMSS()}] Spawning spider.js`)
    ns.spawn('spider.js', 1, 'mainHack.js')
  } else {
    ns.tprint(`[${localeHHMMSS()}] Spawning spider.js`)
    ns.spawn('spider.js', 1, 'mainHack.js')
  }
}