const settings = {
  keys: {
    serverMap: 'BB_SERVER_MAP',
  },
}

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

function printPathToServer(servers, serverToFind) {
  if (serverToFind === 'home') return 'home'
  if (!servers[serverToFind]) return `-- Unable to locate ${serverToFind} --`

  const jumps = []

  let isParentHome = servers.parent === 'home'
  let currentServer = serverToFind

  while (!isParentHome) {
    jumps.push(servers[currentServer].parent)

    if (servers[currentServer].parent !== 'home') {
      currentServer = servers[currentServer].parent
    } else {
      isParentHome = true
    }
  }

  jumps.unshift(serverToFind)

  return jumps.reverse().join('; connect ')
}

export async function main(ns) {
  ns.tprint(`[${localeHHMMSS()}] Starting find.ns`)

  const serverToFind = ns.args[0]

  let hostname = ns.getHostname()

  if (hostname !== 'home') {
    throw new Exception('Run the script from home')
  }

  const serverMap = getItem(settings.keys.serverMap)

  if (serverToFind) {
    if (Object.keys(serverMap.servers).includes(serverToFind)) {
      ns.tprint(`[${localeHHMMSS()}] Path to ${serverToFind} found:`)
      ns.tprint(printPathToServer(serverMap.servers, serverToFind))
    } else {
      ns.tprint(`[${localeHHMMSS()}] Unable to find the path to ${serverToFind}`)
    }
  } else {
    ns.tprint(`[${localeHHMMSS()}] Common servers:`)
    ns.tprint(`* CSEC (CyberSec faction)`)
    ns.tprint(printPathToServer(serverMap.servers, 'CSEC') + '; hack;')
    ns.tprint('')
    ns.tprint(`* avmnite-02h (NiteSec faction)`)
    ns.tprint(printPathToServer(serverMap.servers, 'avmnite-02h') + '; hack;')
    ns.tprint('')
    ns.tprint(`* I.I.I.I (The Black Hand faction)`)
    ns.tprint(printPathToServer(serverMap.servers, 'I.I.I.I') + '; hack;')
    ns.tprint('')
    ns.tprint(`* run4theh111z (Bitrunners faction)`)
    ns.tprint(printPathToServer(serverMap.servers, 'run4theh111z') + '; hack;')
    ns.tprint('')
    ns.tprint(`* w0r1d_d43m0n`)
    ns.tprint(printPathToServer(serverMap.servers, 'w0r1d_d43m0n') + '; hack;')
    ns.tprint('')
    ns.tprint(`[${localeHHMMSS()}] Looking for servers with coding contracts:`)
    Object.keys(serverMap.servers).forEach((hostname) => {
      const files = ns.ls(hostname)
      if (files && files.length) {
        const contract = files.find((file) => file.includes('.cct'))

        if (!!contract) {
          ns.tprint('')
          ns.tprint(`* ${hostname} has a coding contract(s)! Connect using:`)
          ns.tprint(printPathToServer(serverMap.servers, hostname) + `; run ${contract};`)
        }
      }
    })
    ns.tprint('')
    ns.tprint('Buy all hacks command:')
    ns.tprint('home; connect darkweb; buy BruteSSH.exe; buy FTPCrack.exe; buy relaySMTP.exe; buy HTTPWorm.exe; buy SQLInject.exe; home;')
    ns.tprint('')
  }
}
