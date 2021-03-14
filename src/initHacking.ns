const baseUrl = 'https://raw.githubusercontent.com/moriakaice/bitburner/master/src/'
const filesToDownload = [
  'common.ns',
  'mainHack.ns',
  'spider.ns',
  'grow.ns',
  'hack.ns',
  'weaken.ns',
  'playerServers.ns',
  'killAll.ns',
  'runHacking.ns',
  'find.ns',
]
const valuesToRemove = ['BB_SERVER_MAP']

function localeHHMMSS(ms = 0) {
  if (!ms) {
    ms = new Date().getTime()
  }

  return new Date(ms).toLocaleTimeString()
}

export async function main(ns) {
  ns.tprint(`[${localeHHMMSS()}] Starting initHacking.ns`)

  let hostname = ns.getHostname()

  if (hostname !== 'home') {
    throw new Exception('Run the script from home')
  }

  for (let i = 0; i < filesToDownload.length; i++) {
    const filename = filesToDownload[i]
    const path = baseUrl + filename
    await ns.scriptKill(filename, 'home')
    await ns.rm(filename)
    await ns.sleep(200)
    ns.tprint(`[${localeHHMMSS()}] Trying to download ${path}`)
    await ns.wget(path + '?ts=' + new Date().getTime(), filename)
  }

  valuesToRemove.map((value) => localStorage.removeItem(value))

  ns.tprint(`[${localeHHMMSS()}] Spawning killAll.ns`)
  ns.spawn('killAll.ns', 1, 'runHacking.ns')
}
