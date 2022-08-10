const settings = {
  keys: {
    crimesStop: 'BB_CRIMES_STOP',
  },
  intervalToRecheck: 10 * 60 * 1000,
}

function getItem(key) {
  let item = localStorage.getItem(key)

  return item ? JSON.parse(item) : undefined
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function localeHHMMSS(ms = 0) {
  if (!ms) {
    ms = new Date().getTime()
  }

  return new Date(ms).toLocaleTimeString()
}

export async function main(ns) {
  ns.tprint(`[${localeHHMMSS()}] Starting karmaReducer.js`)

  let hostname = ns.getHostname()

  if (hostname !== 'home') {
    throw new Exception('Run the script from home')
  }

  let continueCommitingCrime = true
  const crimeToCommit = 'homicide'

  while (continueCommitingCrime) {
    const crimesStop = getItem(settings.keys.crimesStop)

    if (crimesStop) {
      continueCommitingCrime = false
    } else {
      while (ns.isBusy()) {
        await ns.sleep(100)
      }

      ns.tprint(`[${localeHHMMSS()}] Commiting crime: ${crimeToCommit}`)
      ns.commitCrime(crimeToCommit)
      await ns.sleep(1000)
    }
  }

  setItem(settings.keys.crimesStop, false)
}
