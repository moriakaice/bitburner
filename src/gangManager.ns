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

function getMyGangInformation(ns) {
  return ns.gang.getGangInformation()
}

function getMemberNames(ns) {
  return ns.gang.getMemberNames()
}

function getMemberInformation(ns, name) {
  return ns.gang.getMemberInformation(name)
}

function getMemberAbilities(ns, name) {
  const gangMemberInfo = getMemberInformation(ns, name)
  const terrorismAbilities = gangMemberInfo.hack + gangMemberInfo.str + gangMemberInfo.def + gangMemberInfo.dex + gangMemberInfo.cha
  const vigilantieAbilities = gangMemberInfo.hack + gangMemberInfo.str + gangMemberInfo.def + gangMemberInfo.dex + gangMemberInfo.agi

  return { terrorismAbilities, vigilantieAbilities, str: gangMemberInfo.str }
}

const SORT_TYPES = {
  VIGILANTIE: 'Vigilantie',
  TERRORISM: 'Terrorism',
  REPUTATION: 'Reputation',
  STR: 'Strength',
  STR_MULT: 'Strength Multiplier',
  STR_ASC_MULT: 'Strength Ascencion Multiplier',
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
  ns.tprint(`[${localeHHMMSS()}] Starting gangManager.ns`)

  let hostname = ns.getHostname()

  if (hostname !== 'home') {
    throw new Exception('Run the script from home')
  }

  let nextAscensionAttempt = new Date().getTime() + 60 * 1000

  while (true) {
    const doAscension = getItem(settings.keys.doAscension) || false
    const buyEquipment = getItem(settings.keys.buyEquipment) || false
    const strengthAscensionMultHardLimit = getItem(settings.keys.strAscMultHardLimit) || 10
    setItem(settings.keys.doAscension, doAscension)
    setItem(settings.keys.buyEquipment, buyEquipment)
    setItem(settings.keys.strAscMultHardLimit, strengthAscensionMultHardLimit)

    const equipmentsToBuy = getItem(settings.keys.equipmentList) || []
    const augumentationssToBuy = getItem(settings.keys.augumentationList) || []

    while (ns.gang.canRecruitMember()) {
      const gangMemberNames = getMemberNames(ns)
      ns.gang.recruitMember(gangMemberNamesList[gangMemberNames.length])
      ns.tprint(`[${localeHHMMSS()}] Recruited ${gangMemberNamesList[gangMemberNames.length]}`)
      await ns.sleep(1)
    }

    const gangMemberNames = getMemberNames(ns)

    gangMemberNames
      .sort(sortBy(ns, SORT_TYPES.STR, DIRECTIONS.DESC))
      .sort(sortBy(ns, SORT_TYPES.STR_MULT, DIRECTIONS.DESC))
      .sort(sortBy(ns, SORT_TYPES.STR_ASC_MULT, DIRECTIONS.DESC))

    if (buyEquipment) {
      let hasAllEq = true

      gangMemberNames.forEach((gangMemberName) => {
        const gangMemberInfo = getMemberInformation(ns, gangMemberName)

        equipmentsToBuy.forEach((equipment) => {
          if (gangMemberInfo.upgrades.includes(equipment.name)) return

          const boughtEquipment = ns.gang.purchaseEquipment(gangMemberName, equipment.name)

          if (boughtEquipment) {
            ns.print(`[${localeHHMMSS()}] Bought ${equipment.name} (${equipment.type}) for ${gangMemberName}`)
          } else {
            hasAllEq = false
          }
        })
      })

      if (hasAllEq) {
        let hasAllNonHackAug = true

        gangMemberNames.forEach((gangMemberName) => {
          const gangMemberInfo = getMemberInformation(ns, gangMemberName)

          augumentationssToBuy
            .filter((aug) => !aug.hack)
            .forEach((equipment) => {
              if (gangMemberInfo.augmentations.includes(equipment.name)) return

              const boughtEquipment = ns.gang.purchaseEquipment(gangMemberName, equipment.name)

              if (boughtEquipment) {
                ns.print(`[${localeHHMMSS()}] Bought ${equipment.name} (${equipment.type}) for ${gangMemberName}`)
              } else {
                hasAllNonHackAug = false
              }
            })
        })

        if (hasAllNonHackAug) {
          gangMemberNames.forEach((gangMemberName) => {
            const gangMemberInfo = getMemberInformation(ns, gangMemberName)

            augumentationssToBuy
              .filter((aug) => aug.hack)
              .forEach((equipment) => {
                if (gangMemberInfo.augmentations.includes(equipment.name)) return

                const boughtEquipment = ns.gang.purchaseEquipment(gangMemberName, equipment.name)

                if (boughtEquipment) {
                  ns.print(`[${localeHHMMSS()}] Bought ${equipment.name} (${equipment.type}) for ${gangMemberName}`)
                }
              })
          })
        }
      }
    }

    if (gangMemberNames.length && new Date().getTime() > nextAscensionAttempt) {
      if (doAscension) {
        let strengthAscensionMultExpectation = 0
        let minimumStrengthAscensionMult = Infinity
        gangMemberNames.forEach((gangMemberName) => {
          const gangMemberInfo = getMemberInformation(ns, gangMemberName)

          minimumStrengthAscensionMult = Math.min(minimumStrengthAscensionMult, gangMemberInfo.str_asc_mult)
        })

        strengthAscensionMultExpectation = Math.max(0, minimumStrengthAscensionMult) + 2
        strengthAscensionMultExpectation = Math.min(strengthAscensionMultExpectation, strengthAscensionMultHardLimit)

        const isEarlyAscension = minimumStrengthAscensionMult < 2 ? true : false
        const gangMembersToAscend = []

        gangMemberNames.forEach((gangMemberName) => {
          const gangMemberInfo = getMemberInformation(ns, gangMemberName)
          if (gangMemberInfo.str_asc_mult < strengthAscensionMultExpectation) {
            const boughtEquipment = equipmentsToBuy.filter((equipment) => gangMemberInfo.upgrades.includes(equipment.name))

            if ((isEarlyAscension && boughtEquipment.length > 10) || boughtEquipment.length === equipmentsToBuy.length) {
              gangMembersToAscend.push(gangMemberName)
            }
          }
        })

        const maxMembersToAscend = Math.min(5, Math.ceil(gangMemberNames.length / 3))
        gangMembersToAscend
          .sort(sortBy(ns, SORT_TYPES.REPUTATION, DIRECTIONS.ASC))
          .slice(0, maxMembersToAscend)
          .forEach((gangMemberName) => {
            ns.gang.ascendMember(gangMemberName)
            ns.tprint(`[${localeHHMMSS()}] Ascended ${gangMemberName}`)
          })
      }

      nextAscensionAttempt = new Date().getTime() + 10 * 60 * 1000
    }

    const myGang = getMyGangInformation(ns)
    const minimumWanted = 10
    const wantedToRespectRatio = 10
    const wantToReduceWanted =
      myGang.wantedLevel > minimumWanted &&
      ((myGang.respectGainRate < myGang.wantedLevelGainRate * wantedToRespectRatio && myGang.wantedLevelGainRate) ||
        myGang.wantedLevel * wantedToRespectRatio > myGang.respect)

    let gangMembersTaskTargets = {
      wanted: 0,
      terrorism: 0,
      traffick: 0,
    }

    const terrorismDividerRate = myGang.wantedLevel > myGang.respect || myGang.respect < 2500000 ? 2 : 4

    gangMembersTaskTargets.wanted = wantToReduceWanted ? Math.ceil(gangMemberNames.length / 3) : 0
    gangMembersTaskTargets.terrorism = Math.max(0, Math.ceil((gangMemberNames.length - gangMembersTaskTargets.wanted) / terrorismDividerRate))
    gangMembersTaskTargets.traffick = Math.max(0, gangMemberNames.length - gangMembersTaskTargets.wanted - gangMembersTaskTargets.terrorism)

    gangMemberNames.sort(sortBy(ns, SORT_TYPES.TERRORISM, DIRECTIONS.DESC)).sort(sortBy(ns, SORT_TYPES.VIGILANTIE, DIRECTIONS.DESC))

    gangMemberNames.forEach((gangMemberName) => {
      const terrorismAbilities = getMemberAbilities(ns, gangMemberName).terrorismAbilities
      const isTerrorismRisky = terrorismAbilities > 620 && terrorismAbilities < 710

      if (gangMembersTaskTargets.wanted > 0) {
        ns.gang.setMemberTask(gangMemberName, 'Vigilante Justice')
        gangMembersTaskTargets.wanted -= 1
      } else if (!isTerrorismRisky && gangMembersTaskTargets.terrorism > 0) {
        ns.gang.setMemberTask(gangMemberName, 'Terrorism')
        gangMembersTaskTargets.terrorism -= 1
      } else if (terrorismAbilities > 800 && gangMembersTaskTargets.traffick > 0) {
        ns.gang.setMemberTask(gangMemberName, 'Traffick Illegal Arms')
        gangMembersTaskTargets.traffick -= 1
      } else {
        if (gangMemberNames.length < 30 && getMemberAbilities(ns, gangMemberName).str > 20 && getMemberAbilities(ns, gangMemberName).str < 120) {
          ns.gang.setMemberTask(gangMemberName, 'Mug People')
        } else if (isTerrorismRisky) {
          if (getMemberAbilities(ns, gangMemberName).str > 120) {
            ns.gang.setMemberTask(gangMemberName, 'Strongarm Civilians')
          } else if (getMemberAbilities(ns, gangMemberName).str > 20) {
            ns.gang.setMemberTask(gangMemberName, 'Mug People')
          } else {
            ns.gang.setMemberTask(gangMemberName, 'Vigilante Justice')
            gangMembersTaskTargets.wanted -= 1
          }
        } else {
          ns.gang.setMemberTask(gangMemberName, 'Terrorism')
          gangMembersTaskTargets.terrorism -= 1
        }
      }
    })

    await ns.sleep(2500)
  }
}
