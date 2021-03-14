const settings = {
  mapRefreshInterval: 24 * 60 * 60 * 1000,
  keys: {
    serverMap: 'BB_SERVER_MAP',
  },
}
const scriptsToKill = [
  'mainHack.ns',
  'spider.ns',
  'grow.ns',
  'hack.ns',
  'weaken.ns',
  'playerServers.ns',
  'runHacking.ns',
  'initHacking.ns',
  'start.ns',
  'find.ns',
]

function getItem(key) {
  let item = localStorage.getItem(key)

  return item ? JSON.parse(item) : undefined
}

function localeHHMMSS(ms = 0) {
  if (!ms) {
    ms = new Date().getTime()
  }

  return new Date(ms).toLocaleTimeString()
}

export async function main(ns) {
  ns.tprint(`[${localeHHMMSS()}] Starting killAll.ns`)

  const scriptToRunAfter = ns.args[0]

  let hostname = ns.getHostname()

  if (hostname !== 'home') {
    throw new Exception('Run the script from home')
  }

  const serverMap = getItem(settings.keys.serverMap)

  if (!serverMap || serverMap.lastUpdate < new Date().getTime() - settings.mapRefreshInterval) {
    ns.tprint(`[${localeHHMMSS()}] Spawning spider.ns`)
    ns.spawn('spider.ns', 1, 'killAll.ns')
    ns.exit()
    return
  }

  for (let i = 0; i < scriptsToKill.length; i++) {
    await ns.scriptKill(scriptsToKill[i], 'home')
  }

  const killAbleServers = Object.keys(serverMap.servers)
    .filter((hostname) => ns.serverExists(hostname))
    .filter((hostname) => hostname !== 'home')

  for (let i = 0; i < killAbleServers.length; i++) {
    await ns.killall(killAbleServers[i])
  }

  ns.tprint(`[${localeHHMMSS()}] All processes killed`)

  if (scriptToRunAfter) {
    ns.tprint(`[${localeHHMMSS()}] Spawning ${scriptToRunAfter}`)
    ns.spawn(scriptToRunAfter, 1)
  } else {
    ns.tprint(`[${localeHHMMSS()}] Spawning runHacking.ns`)
    ns.spawn('runHacking.ns', 1)
  }
}
