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
    await ns.run('spider.js', 1, 'mainHack.js')
    await ns.sleep(3000)
    ns.tprint(`[${localeHHMMSS()}] Spawning playerServers.js`)
    ns.spawn('playerServers.js', 1)
    const player = eval("ns.getPlayer();") //hehe
    if (player.hasTixApiAccess) {
      try {
        eval("ns.stock.short();"); //Schauen ob eval geht
      }
      catch (e){
      const cantShort = e.toString().includes("Cannot use short")
      if (player.has4SDataTixApi && cantShort) {
        ns.tprint(`[${localeHHMMSS()}] Spawning startStock.js`)
        ns.spawn('startStock.js', 1)
      }else if (player.has4SDataTixApi && !cantShort){
        ns.tprint(`[${localeHHMMSS()}] Spawning stockMarketer4s.js`)
        ns.spawn('stockMarketer4s.js', 1)
      }else if (!cantShort){
        ns.tprint(`[${localeHHMMSS()}] Spawning stockMarketer.js`)
        ns.spawn('stockMarketer.js', 1)
      }
      }

    }
    if (player.has4SDataTixApi && player.hasTixApiAccess) {
      ns.tprint(`[${localeHHMMSS()}] Spawning startStock.js`)
      ns.spawn('startStock.js', 1)
    }
  } else {
    ns.tprint(`[${localeHHMMSS()}] Spawning spider.js`)
    ns.spawn('spider.js', 1, 'mainHack.js')
  }
}