const settings = {
  keys: {
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

export async function main(ns) {
  ns.disableLog('ALL')
  const equpiments = ns.gang.getEquipmentNames().map((equipmentName) => {
    return {
      name: equipmentName,
      type: ns.gang.getEquipmentType(equipmentName),
      cost: ns.gang.getEquipmentCost(equipmentName),
      ...ns.gang.getEquipmentStats(equipmentName),
    }
  })
  equpiments.sort((a, b) => a.cost - b.cost)

  setItem(
    settings.keys.equipmentList,
    equpiments.filter((eq) => eq.type !== 'Augmentation')
  )
  setItem(
    settings.keys.augumentationList,
    equpiments.filter((eq) => eq.type === 'Augmentation')
  )

  ns.tprint('Done')
}
