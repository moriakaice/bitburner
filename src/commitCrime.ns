const settings = {
  keys: {
    crimes: 'BB_CRIMES',
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

function getCrimesData(ns) {
  ns.tprint(`[${localeHHMMSS()}] Spawning getCrimesData.js`)
  ns.spawn('getCrimesData.js', 1)
}

function selectCrime(crimes) {
  const crimesList = Object.keys(crimes)
  crimesList.sort((a, b) => crimes[b].chance - crimes[a].chance)
  const solidChanceCrimes = crimesList.filter((crime) => crimes[crime].chance >= 0.8)
  const topCrimesList = solidChanceCrimes.length > 3 ? solidChanceCrimes : crimesList.slice(0, 2)

  let bestCrime = 'shoplift'
  let bestCrimeWeight = 0

  topCrimesList.forEach((crime) => {
    const crimeWeight =
      crimes[crime].chance *
      (crimes[crime].stats.money / crimes[crime].stats.time) *
      ((crimes[crime].stats.intelligence_exp * 0.1 + 1) / (crimes[crime].stats.intelligence_exp * 0.1 + 2))

    if (crimeWeight > bestCrimeWeight) {
      bestCrime = crime
      bestCrimeWeight = crimeWeight
    }
  })

  return bestCrime
}

export async function main(ns) {
  ns.tprint(`[${localeHHMMSS()}] Starting commitCrime.js`)

  let hostname = ns.getHostname()

  if (hostname !== 'home') {
    throw new Exception('Run the script from home')
  }

  let continueCommitingCrime = true
  const crimes = getItem(settings.keys.crimes)

  if (!crimes) {
    getCrimesData(ns)
    return
  }

  const crimeToCommit = selectCrime(crimes)
  const endTime = new Date().getTime() + settings.intervalToRecheck

  while (continueCommitingCrime) {
    const crimesStop = getItem(settings.keys.crimesStop)

    if (crimesStop || new Date().getTime() > endTime) {
      continueCommitingCrime = false
    } else {
      while (ns.isBusy()) {
        await ns.sleep(100)
      }

      ns.tprint(`[${localeHHMMSS()}] Commiting crime: ${crimeToCommit}`)
      ns.commitCrime(crimeToCommit)
      await ns.sleep(crimes[crimeToCommit].stats.time + 5)
    }
  }

  const crimesStop = getItem(settings.keys.crimesStop)
  if (!crimesStop) {
    getCrimesData(ns)
  } else {
    setItem(settings.keys.crimesStop, false)
  }
}
