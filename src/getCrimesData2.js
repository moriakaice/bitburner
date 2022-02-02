const settings = {
  keys: {
    crimes: 'BB_CRIMES',
  },
  crimes: [
    'shoplift',
    'rob store',
    'mug',
    'larceny',
    'deal drugs',
    'bond forgery',
    'traffick arms',
    'homicide',
    'grand theft auto',
    'kidnap',
    'assassinate',
    'heist',
  ],
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
  ns.tprint(`[${localeHHMMSS()}] Starting getCrimesData2.js`)

  const scriptToRunAfter = ns.args[0] || 'commitCrime.js'

  let hostname = ns.getHostname()

  if (hostname !== 'home') {
    throw new Exception('Run the script from home')
  }

  const crimesCache = getItem(settings.keys.crimes) || {}
  const crimes = {}

  settings.crimes.map((crime) => {
    const stats = ns.getCrimeStats(crime)

    crimes[crime] = { ...crimesCache[crime], stats }
  })

  setItem(settings.keys.crimes, crimes)

  if (scriptToRunAfter) {
    ns.tprint(`[${localeHHMMSS()}] Spawning ${scriptToRunAfter}`)
    ns.spawn(scriptToRunAfter, 1)
  }
}
