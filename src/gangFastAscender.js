const settings = {
  keys: {
    buyEquipment: 'BB_BUY_EQUIPMENT',
    doAscension: 'BB_DO_ASCENSION',
    strAscMultHardLimit: 'BB_STR_ASC_MULT_HARD_LIMIT',
    equipmentList: 'BB_EQUIPMENT_LIST',
    augumentationList: 'BB_AUGUMENTATION_LIST',
  },
}

function getItem(key) {
  let item = localStorage.getItem(key)

  return item ? JSON.parse(item) : undefined
}

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

const gangMemberNamesList = [
  'Darth Vader',
  'Joker',
  'Two-Face',
  'Warden Norton',
  'Hannibal Lecter',
  'Sauron',
  'Bane',
  'Tyler Durden',
  'Agent Smith',
  'Gollum',
  'Vincent Vega',
  'Saruman',
  'Loki',
  'Vito Corleone',
  'Balrog',
  'Palpatine',
  'Michael Corleone',
  'Talia al Ghul',
  'John Doe',
  'Scarecrow',
  'Commodus',
  'Jabba the Hutt',
  'Scar',
  'Grand Moff Tarkin',
  'Boba Fett',
  'Thanos',
  'Terminator',
  'Frank Costello',
  'Hector Barbossa',
  'Xenomorph',
]

const equipmentTypes = ['Weapon', 'Armor', 'Vehicle', 'Rootkit', 'Augmentation']

function localeHHMMSS(ms = 0) {
  if (!ms) {
    ms = new Date().getTime()
  }

  return new Date(ms).toLocaleTimeString()
}

function getMemberNames(ns) {
  return ns.gang.getMemberNames()
}

function getMemberInformation(ns, name) {
  return ns.gang.getMemberInformation(name)
}

function getMoney(ns) {
  return ns.getServerMoneyAvailable('home') - 1000000000
}

const SORT_TYPES = {
  VIGILANTIE: 'Vigilantie',
  TERRORISM: 'Terrorism',
  REPUTATION: 'Reputation',
  STR: 'Strength',
  STR_MULT: 'Strength Multiplier',
  STR_ASC_MULT: 'Strength Ascencion Multiplier',
  DEX: 'Dexterity',
  DEX_MULT: 'Dexterity Multiplier',
  DEX_ASC_MULT: 'Dexterity Ascencion Multiplier',
}
const DIRECTIONS = {
  ASC: 'Ascending',
  DESC: 'Descending',
}
function sortBy(ns, sortType = null, direction = DIRECTIONS.ASC) {
  return function (a, b) {
    const memberInfoA = getMemberInformation(ns, a)
    const memberInfoB = getMemberInformation(ns, b)

    let statA
    let statB

    if (sortType === SORT_TYPES.VIGILANTIE) {
      statA = memberInfoA.hack + memberInfoA.str + memberInfoA.def + memberInfoA.dex + memberInfoA.agi
      statB = memberInfoB.hack + memberInfoB.str + memberInfoB.def + memberInfoB.dex + memberInfoB.agi
    } else if (sortType === SORT_TYPES.TERRORISM) {
      statA = memberInfoA.hack + memberInfoA.str + memberInfoA.def + memberInfoA.dex + memberInfoA.cha
      statB = memberInfoB.hack + memberInfoB.str + memberInfoB.def + memberInfoB.dex + memberInfoB.cha
    } else if (sortType === SORT_TYPES.REPUTATION) {
      statA = memberInfoA.earnedRespect
      statB = memberInfoB.earnedRespect
    } else if (sortType === SORT_TYPES.STR) {
      statA = memberInfoA.str
      statB = memberInfoB.str
    } else if (sortType === SORT_TYPES.STR_MULT) {
      statA = memberInfoA.str_mult
      statB = memberInfoB.str_mult
    } else if (sortType === SORT_TYPES.STR_ASC_MULT) {
      statA = memberInfoA.str_asc_mult
      statB = memberInfoB.str_asc_mult
    } else if (sortType === SORT_TYPES.DEX) {
      statA = memberInfoA.dex
      statB = memberInfoB.dex
    } else if (sortType === SORT_TYPES.DEX_MULT) {
      statA = memberInfoA.dex_mult
      statB = memberInfoB.dex_mult
    } else if (sortType === SORT_TYPES.DEX_ASC_MULT) {
      statA = memberInfoA.dex_asc_mult
      statB = memberInfoB.dex_asc_mult
    } else {
      const indexA = gangMemberNamesList.findIndex((name) => name === memberInfoA.name)
      const indexB = gangMemberNamesList.findIndex((name) => name === memberInfoB.name)

      return indexA - indexB
    }

    if (statA === statB) {
      return 0
    }

    if (direction === DIRECTIONS.ASC) {
      return statA - statB
    } else {
      return statB - statA
    }
  }
}

export async function main(ns) {
  ns.disableLog('ALL')
  ns.tprint(`[${localeHHMMSS()}] Starting gangFastAscender.js`)

  let hostname = ns.getHostname()

  if (hostname !== 'home') {
    throw new Exception('Run the script from home')
  }

  if (getMoney(ns) > 0) {
    const doAscension = getItem(settings.keys.doAscension) || false
    const buyEquipment = getItem(settings.keys.buyEquipment) || false
    const strengthAscensionMultHardLimit = getItem(settings.keys.strAscMultHardLimit) || 100
    setItem(settings.keys.doAscension, doAscension)
    setItem(settings.keys.buyEquipment, buyEquipment)
    setItem(settings.keys.strAscMultHardLimit, strengthAscensionMultHardLimit)

    const baseballBat = 'Baseball Bat'

    const gangMemberNames = getMemberNames(ns)

    gangMemberNames
      .sort(sortBy(ns, SORT_TYPES.STR, DIRECTIONS.DESC))
      .sort(sortBy(ns, SORT_TYPES.STR_MULT, DIRECTIONS.DESC))
      .sort(sortBy(ns, SORT_TYPES.STR_ASC_MULT, DIRECTIONS.DESC))

    ns.tprint(`[${localeHHMMSS()}] Members (${gangMemberNames.length}) to check: ${gangMemberNames.join(', ')}`)

    for (let i = 0; i < gangMemberNames.length; i++) {
      const gangMemberName = gangMemberNames[i]
      let ascended = true
      let counter = 0

      ns.tprint(`[${localeHHMMSS()}][${gangMemberName}][${i + 1}/${gangMemberNames.length}] Starting ${baseballBat} ascension`)

      while (ascended) {
        ascended = false

        const gangMemberInfo = getMemberInformation(ns, gangMemberName)
        if (gangMemberInfo.str_asc_mult < strengthAscensionMultHardLimit) {
          let hasBat = gangMemberInfo.upgrades.includes(baseballBat)

          if (!hasBat && getMoney(ns) > 0) {
            hasBat = ns.gang.purchaseEquipment(gangMemberName, baseballBat)
          }

          if (hasBat) {
            if (gangMemberInfo.str_asc_mult < strengthAscensionMultHardLimit) {
              ns.gang.ascendMember(gangMemberName)
              ascended = true
              counter += 1
            } else {
              ns.gang.setMemberTask(gangMemberName, 'Terrorism')
            }
          }
        }

        await ns.sleep(1)
      }

      ns.tprint(`[${localeHHMMSS()}][${gangMemberName}][${i + 1}/${gangMemberNames.length}] ${counter} ascensions done, moving on`)

      await ns.sleep(1)
    }

    ns.tprint(`[${localeHHMMSS()}] Finished Basball Bat ascension`)

    let myGangReputation = ns.gang.getGangInformation().respect
    const minimumReputationToBuyDex = 50000000

    if (myGangReputation > minimumReputationToBuyDex && getMoney(ns) > 0) {
      let equipmentList = ['Baseball Bat', 'Bulletproof Vest', 'Ford Flex V20', 'Katana', 'Glock 18C']

      gangMemberNames
        .sort(sortBy(ns, SORT_TYPES.DEX, DIRECTIONS.DESC))
        .sort(sortBy(ns, SORT_TYPES.DEX_MULT, DIRECTIONS.DESC))
        .sort(sortBy(ns, SORT_TYPES.DEX_ASC_MULT, DIRECTIONS.DESC))

      ns.tprint(`[${localeHHMMSS()}] Members (${gangMemberNames.length}) to check: ${gangMemberNames.join(', ')}`)

      for (let i = 0; i < gangMemberNames.length && myGangReputation > minimumReputationToBuyDex; i++) {
        const gangMemberName = gangMemberNames[i]
        let ascended = true
        let counter = 0

        ns.tprint(`[${localeHHMMSS()}][${gangMemberName}][${i + 1}/${gangMemberNames.length}] Starting dex ascension`)

        while (ascended) {
          ascended = false

          let gangMemberInfo = getMemberInformation(ns, gangMemberName)
          if (gangMemberInfo.dex_asc_mult < strengthAscensionMultHardLimit) {
            let missingEq = equipmentList.filter((equipment) => !gangMemberInfo.upgrades.includes(equipment))

            if (missingEq.length && getMoney(ns) > 0) {
              missingEq.forEach((equipment) => {
                if (getMoney(ns) > 0) {
                  ns.gang.purchaseEquipment(gangMemberName, equipment)
                }
              })
            }

            gangMemberInfo = getMemberInformation(ns, gangMemberName)
            missingEq = equipmentList.filter((equipment) => !gangMemberInfo.upgrades.includes(equipment))

            if (!missingEq.length) {
              if (gangMemberInfo.dex_asc_mult < strengthAscensionMultHardLimit) {
                ns.gang.ascendMember(gangMemberName)
                ascended = true
                counter += 1
              } else {
                ns.gang.setMemberTask(gangMemberName, 'Terrorism')
              }
            }
          }

          await ns.sleep(1)
        }

        ns.tprint(`[${localeHHMMSS()}][${gangMemberName}][${i + 1}/${gangMemberNames.length}] ${counter} ascensions done, moving on`)
        myGangReputation = ns.gang.getGangInformation().respect
        await ns.sleep(1)
      }

      ns.tprint(`[${localeHHMMSS()}] Finished Dex ascension`)
    }

    myGangReputation = ns.gang.getGangInformation().respect
    const minimumReputationToBuyAll = 100000000

    if (myGangReputation > minimumReputationToBuyAll && getMoney(ns) > 0) {
      let equipmentList = [
        'Baseball Bat',
        'Bulletproof Vest',
        'Ford Flex V20',
        'Full Body Armor',
        'NUKE Rootkit',
        'ATX1070 Superbike',
        'Katana',
        'Mercedes-Benz S9001',
        'Glock 18C',
        'Liquid Body Armor',
        'Soulstealer Rootkit',
        'White Ferrari',
        'Graphene Plating Armor',
        'Hmap Node',
        'P90C',
        'Steyr AUG',
        'Demon Rootkit',
        'Jack the Ripper',
        'AK-47',
        'M15A10 Assault Rifle',
        'AWM Sniper Rifle',
      ]

      gangMemberNames.sort(sortBy(ns, SORT_TYPES.REPUTATION, DIRECTIONS.ASC))

      ns.tprint(`[${localeHHMMSS()}] Members (${gangMemberNames.length}) to check: ${gangMemberNames.join(', ')}`)

      for (let i = 0; i < gangMemberNames.length && myGangReputation > minimumReputationToBuyAll; i++) {
        const gangMemberName = gangMemberNames[i]
        let ascended = true
        let counter = 0

        ns.tprint(`[${localeHHMMSS()}][${gangMemberName}][${i + 1}/${gangMemberNames.length}] Starting full ascension`)

        while (ascended) {
          ascended = false

          let gangMemberInfo = getMemberInformation(ns, gangMemberName)
          if (gangMemberInfo.hack_asc_mult < strengthAscensionMultHardLimit) {
            let missingEq = equipmentList.filter((equipment) => !gangMemberInfo.upgrades.includes(equipment))

            if (missingEq.length && getMoney(ns) > 0) {
              missingEq.forEach((equipment) => {
                if (getMoney(ns) > 0) {
                  ns.gang.purchaseEquipment(gangMemberName, equipment)
                }
              })
            }

            gangMemberInfo = getMemberInformation(ns, gangMemberName)
            missingEq = equipmentList.filter((equipment) => !gangMemberInfo.upgrades.includes(equipment))

            if (!missingEq.length) {
              if (gangMemberInfo.hack_asc_mult < strengthAscensionMultHardLimit) {
                ns.gang.ascendMember(gangMemberName)
                ascended = true
                counter += 1
              } else {
                ns.gang.setMemberTask(gangMemberName, 'Terrorism')
              }
            }
          }

          await ns.sleep(1)
        }

        ns.tprint(`[${localeHHMMSS()}][${gangMemberName}][${i + 1}/${gangMemberNames.length}] ${counter} ascensions done, moving on`)
        myGangReputation = ns.gang.getGangInformation().respect
        await ns.sleep(1)
      }

      ns.tprint(`[${localeHHMMSS()}] Finished full ascension`)
    }
  }

  ns.tprint(`[${localeHHMMSS()}] Finished, exiting`)
}
