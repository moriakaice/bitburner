// based on https://github.com/Penndrageist/bitburner-scripts/blob/master/scripts/HackingMission.js.js
;(function (document) {
  const settings = {
    keys: {
      doAuto: 'BB_DO_AUTO',
    },
  }

  let lastValues = {
    player: [],
    enemy: [],
    readTime: 0,
    timeoutInstance: undefined,
  }

  function getItem(key) {
    let item = localStorage.getItem(key)

    try {
      item = JSON.parse(item)
    } catch (e) {
      item = undefined
    }

    return item ? item : undefined
  }

  function setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  // from https://gist.github.com/jpillora/7382441
  function solve(graph, s) {
    var solutions = {}
    solutions[s] = []
    solutions[s].weight = 0

    while (true) {
      var parent = null
      var nearest = null
      var dist = Infinity

      //for each existing solution
      for (var n in solutions) {
        if (!solutions[n]) continue
        var ndist = solutions[n].weight
        var adj = graph[n]
        //for each of its adjacent nodes...
        for (var a in adj) {
          //without a solution already...
          if (solutions[a]) continue
          //choose nearest node with lowest *total* cost
          var d = adj[a] + ndist
          if (d < dist) {
            //reference parent
            parent = solutions[n]
            nearest = a
            dist = d
          }
        }
      }

      //no more solutions
      if (dist === Infinity) {
        break
      }

      //extend parent's solution path
      solutions[nearest] = parent.concat(nearest)
      //extend parent's cost
      solutions[nearest].weight = dist
    }

    return solutions
  }

  function convertNodesToGraph(nodes) {
    function getNode(x, y) {
      return nodes.find((n) => n.x === x && n.y === y)
    }

    const graph = {}

    nodes.forEach((n) => {
      graph[n.id] = {}

      const siblings = [getNode(n.x, n.y + 1), getNode(n.x, n.y - 1), getNode(n.x + 1, n.y), getNode(n.x - 1, n.y)].filter((n) => n)

      siblings.forEach((sibling) => {
        graph[n.id][sibling.id] = sibling.isMine ? 0 : sibling.weight
      })
    })

    return graph
  }

  let instance

  async function main() {
    let ns = {
      sleep: async (ms) => {
        return new Promise((resolve) => setTimeout(resolve, ms))
      },
      print: console.log,
    }

    var delaySeconds = 5
    var missionCount = 0

    while (true) {
      ns.print(`Attempting Mission#: ${++missionCount}`)
      await ns.sleep(1000)
      await waitingToEnterGame(ns)
      await ns.sleep(500)

      ns.print('Getting information...')
      const buttons = getButtons(ns)
      const grid = []
      for (let i = 0; i < 8; i++) grid.push([])
      for (let y = 0; y < grid.length; y++) for (let x = 0; x < 8; x++) grid[y].push(new Node(x, y))

      const nodes = grid.flatMap((e) => e)
      const lookup = {}
      nodes.forEach((e) => (lookup[e.id] = e))
      injectMiddleMan(lookup)

      await startGame(ns)
      await ns.sleep(500)

      try {
        if (lastValues.timeoutInstance) {
          clearTimeout(lastValues.timeoutInstance)
        }

        lastValues = {
          player: [],
          enemy: [],
          readTime: 0,
          timeoutInstance: undefined,
        }
        calculateDeltaStats()

        await completeMission(ns, grid, nodes, lookup, buttons)

        if (lastValues.timeoutInstance) {
          clearTimeout(lastValues.timeoutInstance)
        }
      } catch (e) {
        console.error(e)
      }

      ns.print('Completed mission, starting next...')

      await ns.sleep(delaySeconds * 1000)

      if (getAuto()) {
        while (getHackMissionElement(ns) === null) await ns.sleep(100)

        var hackBtn = getHackMissionElement(ns)
        if (hackBtn !== null) {
          document.querySelector('#character-overview-save-button').click()
          hackBtn.click()
        }
      }
    }
  }

  function calculateDeltaStats() {
    const playerStats = document
      .querySelector('#hacking-mission-player-stats')
      .innerText.split('\n')
      .map((line) => parseFloat(line.trim().split(':').pop().trim().replace(/\s+/g, '').replace(',', '.')))

    if (!lastValues.player.length) {
      lastValues.player = playerStats
    }

    const enemyStats = document
      .querySelector('#hacking-mission-enemy-stats')
      .innerText.split('\n')
      .map((line) => parseFloat(line.trim().split(':').pop().trim().replace(/\s+/g, '').replace(',', '.')))

    if (!lastValues.enemy.length) {
      lastValues.enemy = enemyStats
    }

    const readTime = new Date().getTime()
    if (!lastValues.readTime) {
      lastValues.readTime = readTime
    }

    let deltaHolder = document.querySelector('#delta-holder')
    if (!deltaHolder) {
      const deltaHolderElement = document.createElement('p')
      deltaHolderElement.id = 'delta-holder'
      deltaHolderElement.style = 'display: inline-block; color: white; margin: 4px;'

      document.querySelector('#hacking-mission-enemy-stats').insertAdjacentElement('afterend', deltaHolderElement)
      deltaHolder = document.querySelector('#delta-holder')
    }

    const timeAdjustment = 1000 / Math.max(1, readTime - lastValues.readTime)

    deltaHolder.innerHTML = `
    Player attack delta: ${Math.round((playerStats[0] - lastValues.player[0]) * 100 * timeAdjustment) / 100}/s<br />
    Enemy defense delta: ${Math.round((enemyStats[1] - lastValues.enemy[1]) * 100 * timeAdjustment) / 100}/s
    `

    lastValues.player = playerStats
    lastValues.enemy = enemyStats
    lastValues.readTime = readTime

    lastValues.timeoutInstance = setTimeout(calculateDeltaStats, 1000)
  }

  function getHackMissionElement(ns) {
    var nodes = document.getElementsByClassName('std-button')

    for (var i = 0; i < nodes.length; i++) {
      //ns.print(`${i}: nodes[i].innerText == ${nodes[i].innerText}`);
      if (nodes[i].innerText == 'Hacking Mission') {
        return nodes[i]
      }
    }

    return null
  }

  function createPlan({ nodes, lookup, myAttack, goalTypes }) {
    function canWin({ n, myAttack, enemyDefence }) {
      return n.isEnemy ? myAttack > enemyDefence : myAttack > 100 + n.def
    }

    myAttack = lastValues.player[0] * 10 || myAttack

    const enemyDefence =
      lastValues.enemy[1] * 10 ||
      document
        .getElementById('hacking-mission-enemy-stats')
        .innerText.split('\n')
        .map((e) => {
          const temp = e.split(' ')
          return Number(temp[temp.length - 1].replace(/,/g, ''))
        })[1]

    let focusOnWin = myAttack > 5 * enemyDefence

    const graph = convertNodesToGraph(nodes)
    const solutions = solve(graph, 'hacking-mission-node-0-0')

    const targets = nodes
      .filter((n) => !n.isMine)
      .filter((n) => (focusOnWin ? n.type === types.Database : goalTypes.includes(n.type)))
      .filter((n) => canWin({ n, myAttack, enemyDefence }))
      .filter((n) => !solutions[n.id].find((nId) => !canWin({ n: lookup[nId], myAttack, enemyDefence })))

    if (targets.length) {
      targets.sort((a, b) => solutions[a.id].weight - solutions[b.id].weight)
      const topTarget = targets[0]

      return solutions[topTarget.id].filter((nId) => !lookup[nId].isMine).map((nId) => lookup[nId])
    } else {
      return []
    }
  }

  async function completeMission(ns, grid, nodes, lookup, buttons) {
    await ns.sleep(500)
    const scan = buttons.scan
    const attack = buttons.attack
    const overflow = buttons.overflow
    const fortify = buttons.fortify

    let databases = nodes.filter((n) => n.type === types.Database)
    const home = lookup[`hacking-mission-node-${0}-${0}`]

    const REVIEW_PLAN_TIME = 10000
    let remainingReviewTime

    let plan = []
    while (databases.filter((db) => !db.isMine).length > 0) {
      //ns.print("Ticking ...");
      nodes.forEach((n) => n.update())
      const cpus = nodes.filter((n) => n.isMine).filter((n) => n.type === types.CPU)
      const xferNodes = nodes.filter((n) => n.isMine).filter((n) => n.type === types.Transfer)

      const myAttack =
        lastValues.player[0] * 10 ||
        document
          .getElementById('hacking-mission-player-stats')
          .innerText.split('\n')
          .map((e) => {
            const temp = e.split(' ')
            return Number(temp[temp.length - 1].replace(/,/g, ''))
          })[0]

      const isIdle = !cpus.some((cpu) => cpu.connection)

      if (plan.length === 0 && isIdle) {
        plan = createPlan({
          lookup,
          nodes,
          myAttack,
          goalTypes: [types.Database, types.Transfer, types.Spam],
        })

        if (plan.length > 0) {
          console.log('plan', plan)
          plan.forEach((e) => (document.getElementById(e.id).style.backgroundColor = 'green'))
        }
      }

      if (plan.length > 0 && isIdle) {
        remainingReviewTime = REVIEW_PLAN_TIME
        const target = plan.shift()
        // console.log(target.id)
        // console.log(`Defence: ${target.def}, Enemy: ${target.isEnemy}`)
        cpus.forEach((cpu) => {
          cpu.connect(target)
          instance.connect({ source: cpu.id, target: target.id })
        })
        xferNodes.forEach((xfer) => {
          xfer.connect(target)
          instance.connect({ source: xfer.id, target: target.id })
        })
      }

      const playerHackingSkill = parseInt(document.querySelector('#character-hack-text').textContent.replace(/,/g, '').replace(/\s+/g, '').trim(), 10) || 1
      const minDefSelf = ((0.95 * playerHackingSkill) / 130) * 10 + 10
      const minDef = 10

      nodes
        .filter((n) => n.isMine)
        .forEach((node) => {
          node.click()
          switch (node.type) {
            case types.CPU:
              if (node.connection) {
                if (node.connection.isEnemy || node.connection.type !== types.Transfer)
                  if (node.connection.def > minDef) scan.click()
                  else attack.click()
                else if (node.connection.def > myAttack * 0.75) scan.click()
                else attack.click()
              } else {
                if (node.def > minDefSelf) {
                  overflow.click()
                  console.log(node.def, minDefSelf, minDef, playerHackingSkill)
                } else fortify.click()
              }
              break
            case types.Transfer:
              if (node.def > minDefSelf) {
                overflow.click()
              } else {
                if (node.connection) {
                  if (node.connection.isEnemy || node.connection.type !== types.Transfer)
                    if (node.connection.def > minDef) scan.click()
                    else if (node.connection.def > myAttack * 0.9) scan.click()
                    else fortify.click()
                } else {
                  fortify.click()
                }
              }
              break
            case types.Shield:
              fortify.click()
              break
            case types.Firewall:
              if (node.connection) {
                if (node.connection.isEnemy || node.connection.type !== types.Transfer)
                  if (node.connection.def > minDef) scan.click()
                  else if (node.connection.def > myAttack * 0.8) scan.click()
                  else fortify.click()
              } else {
                fortify.click()
              }
              break
          }
        })

      nodes
        .filter((n) => n.isMine)
        .filter((n) => n.type == types.CPU)
        .forEach((node) => {
          node.click()
        })

      await ns.sleep(100)

      if (plan.length > 0) {
        remainingReviewTime -= 100
        if (remainingReviewTime <= 0) {
          ns.print('Resetting plan ...')
          plan.forEach((e) => {
            const color = e.isMine ? '#00f' : e.isEnemy ? '#f00' : '#808080'

            document.getElementById(e.id).style.backgroundColor = color
          })
          plan = []
        }
      }
    }
  }

  function injectMiddleMan(lookup) {
    instance = null
    jsPlumb.factionHackerInstance = jsPlumb.factionHackerInstance ? jsPlumb.factionHackerInstance : jsPlumb.getInstance
    jsPlumb.getInstance = function (options) {
      instance = jsPlumb.factionHackerInstance.call(this, options)
      const oldConnect = instance.connect
      instance.connect = function (info) {
        const ids = {
          source: typeof info.source === 'string' ? info.source : info.source.id,
          target: typeof info.target === 'string' ? info.target : info.target.id,
        }
        if (lookup[ids.source]) {
          if (lookup[ids.source].isEnemy) return null
        }
        return oldConnect.call(this, info)
      }
      return instance
    }
  }

  async function startGame(ns) {
    ns.print('Starting mission...')
    document.getElementById('hack-mission-start-btn').click()
    while (!instance) {
      await ns.sleep(100)
    }
  }

  async function waitingToEnterGame(ns) {
    ns.print('Waiting for mission...')

    while (!document.getElementById('hack-mission-start-btn')) {
      await ns.sleep(250)

      if (getAuto()) {
        if (getHackMissionElement(ns)) {
          var hackBtn = getHackMissionElement(ns)
          if (hackBtn !== null) {
            document.querySelector('#character-overview-save-button').click()
            hackBtn.click()
          }
        }
      }
    }
  }

  function getButtons(ns) {
    const elements = document.getElementsByClassName('a-link-button-inactive tooltip hack-mission-header-element')

    return {
      attack: elements[0],
      scan: elements[1],
      weaken: elements[2],
      fortify: elements[3],
      overflow: elements[4],
      drop: elements[5],
    }
  }

  function getAuto() {
    let auto = getItem(settings.keys.doAuto) || false
    let reputation = 100000
    let reputationMax = 85000
    let minPlayerHackingSkill = 300

    let text = document.querySelector('p.tooltip span.reputation')

    if (text) {
      text = text.textContent.trim()

      reputation = parseFloat(
        text
          .replace(/,/g, '')
          .replace(/[^0-9\.]*/g, '')
          .trim()
      )

      if (text.includes('k')) {
        reputation *= 1000
      } else if (text.includes('m')) {
        reputation *= 1000000
      }
    }

    const playerHackingSkill = parseInt(document.querySelector('#character-hack-text').textContent.replace(/,/g, '').replace(/\s+/g, '').trim(), 10) || 1
    if (playerHackingSkill < minPlayerHackingSkill) {
      auto = false
    }

    reputationMax = Math.min(reputationMax, playerHackingSkill * 150)
    if (reputation > reputationMax) {
      auto = false
    }

    return auto
  }

  let types = {
    CPU: 'CPU',
    Shield: 'Shield',
    Transfer: 'Transfer',
    Firewall: 'Firewall',
    Spam: 'Spam',
    Database: 'Database',
  }

  class Node {
    constructor(x, y) {
      this.id = `hacking-mission-node-${y}-${x}`
      this.x = x
      this.y = y

      this.type = types[this.text.trim().split(/\s/, 1)[0]]
      this.connection = null

      this.update()
    }

    click() {
      this.element.click()
    }

    get element() {
      return document.getElementById(this.id)
    }

    get text() {
      return document.getElementById(this.id + '-txt').innerText
    }

    disconnect() {
      if (this.connection) this.connection.element.style.backgroundColor = ''
      this.connection = null
    }

    connect(other) {
      this.connection = other
    }

    update() {
      const element = this.element
      if (element === null) return

      this.isMine = element.classList.contains('hack-mission-player-node')
      this.isEnemy = element.classList.contains('hack-mission-enemy-node')
      this.isNeutral = element.classList.contains('hack-mission-enemy-node')

      if (this.connection && this.connection.isMine) this.disconnect()

      const text = this.text.split('\n').map((e) => e.trim())
      this.type = text[0].split(' ', 1)[0]
      this.hp = Number(text[1].split(' ', 2)[1].replace(/,/g, ''))
      this.atk = Number(text[2].split(' ', 2)[1].replace(/,/g, ''))
      this.def = Number(text[3].split(' ', 2)[1].replace(/,/g, ''))
      this.weight = this.isMine ? 0 : this.isEnemy ? lastValues.enemy[1] * 10 + this.hp : this.def + this.hp

      // avoid firewalls more
      switch (this.type) {
        case types.Firewall:
          this.weight *= 10
          break
        case types.CPU:
          this.weight *= 5
          break
        case types.Shield:
          this.weight *= 1
          break
        case types.Spam:
          this.weight *= 0.85
          break
        case types.Transfer:
          this.weight *= 0.7
          break
        case types.Database:
          this.weight *= 0.5
          break
        default:
          this.weight *= 100
          break
      }
    }
  }

  main()
})(document)
