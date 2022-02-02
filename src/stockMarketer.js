const stockSymbols = ['ECP', 'BLD', 'OMTK', 'FSIG', 'FLCM', 'CTYS']
const avgTrackers = {}
const profitTrackers = {}
const risingTrackers = {}
const firstInvests = {}

let corpus

function localeHHMMSS(ms = 0) {
  if (!ms) {
    ms = new Date().getTime()
  }

  return new Date(ms).toLocaleTimeString()
}

const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length

function getMoney(ns) {
  return ns.getServerMoneyAvailable('home') - 300000
}

function processTick(ns, stockSymbol) {
  const profitMargin = 0.05
  const minimumMoneyToInvest = 1000000
  let profitTracker = profitTrackers[stockSymbol] || {}
  let positionChanged = false
  let avgTracker = avgTrackers[stockSymbol] || []
  let rising = risingTrackers[stockSymbol]
  avgTracker.push(ns.getStockPrice(stockSymbol))
  avgTracker = avgTracker.slice(-40)

  if (avgTracker.length === 40) {
    let profitPercentage
    let profitMarginCrossed = false
    const avg40 = average(avgTracker)
    const avg10 = average(avgTracker.slice(-10))

    if (profitTracker.volume && profitTracker.position) {
      const stockSaleGain = ns.getStockSaleGain(stockSymbol, profitTracker.volume, profitTracker.position)
      profitPercentage = (stockSaleGain - profitTracker.volume * profitTracker.value) / (profitTracker.volume * profitTracker.value)

      if (Math.abs(profitPercentage) > profitMargin) {
        profitMarginCrossed = true
      }
    }

    if (profitMarginCrossed) {
      const shortSellValue = ns.sellShort(stockSymbol, 9999999999999999999999999)
      if (shortSellValue && profitTracker.volume) {
        const profit = profitTracker.volume * (profitTracker.value - shortSellValue) - 200000
        corpus += profit

        const message = `[${localeHHMMSS()}] ${stockSymbol}, profitPercentage: ${ns.nFormat(profitPercentage, '0.0%')}, selling shorts,
          profitTracker.volume: ${profitTracker.volume}, profitTracker.value: ${ns.nFormat(profitTracker.value, '$0.000a')},
          shortSellValue: ${ns.nFormat(shortSellValue, '$0.000a')},
          profit: ${ns.nFormat(profit, '$0.000a')}, corpus: ${ns.nFormat(corpus, '$0.000a')}`
          .replace(/\r/g, '')
          .replace(/\n/g, '')
          .replace(/\s+/g, ' ')
          .trim()
        ns.tprint(message)

        profitTracker = {
          position: '',
          value: 0,
          volume: 0,
        }
      }

      const longSellValue = ns.sellStock(stockSymbol, 9999999999999999999999999)
      if (longSellValue && profitTracker.volume) {
        const profit = profitTracker.volume * (longSellValue - profitTracker.value) - 200000
        corpus += profit

        const message = `[${localeHHMMSS()}] ${stockSymbol}, profitPercentage: ${ns.nFormat(profitPercentage, '0.0%')}, selling longs,
          profitTracker.volume: ${profitTracker.volume}, profitTracker.value: ${ns.nFormat(profitTracker.value, '$0.000a')},
          longSellValue: ${ns.nFormat(longSellValue, '$0.000a')},
          profit: ${ns.nFormat(profit, '$0.000a')}, corpus: ${ns.nFormat(corpus, '$0.000a')}`
          .replace(/\r/g, '')
          .replace(/\n/g, '')
          .replace(/\s+/g, ' ')
          .trim()
        ns.tprint(message)

        profitTracker = {
          position: '',
          value: 0,
          volume: 0,
        }
      }
    }

    if (rising !== avg10 > avg40 || profitMarginCrossed) {
      positionChanged = true
      rising = avg10 > avg40
    }

    if (positionChanged) {
      if (rising) {
        // It's rising now, sell short, buy long
        const shortSellValue = ns.sellShort(stockSymbol, 9999999999999999999999999)
        if (shortSellValue && profitTracker.volume) {
          const profit = profitTracker.volume * (profitTracker.value - shortSellValue) - 200000
          corpus += profit

          const message = `[${localeHHMMSS()}] ${stockSymbol}, selling shorts,
            profitTracker.volume: ${profitTracker.volume}, profitTracker.value: ${ns.nFormat(profitTracker.value, '$0.000a')},
            shortSellValue: ${ns.nFormat(shortSellValue, '$0.000a')},
            profit: ${ns.nFormat(profit, '$0.000a')}, corpus: ${ns.nFormat(corpus, '$0.000a')}`
            .replace(/\r/g, '')
            .replace(/\n/g, '')
            .replace(/\s+/g, ' ')
            .trim()
          ns.tprint(message)

          profitTracker = {
            position: '',
            value: 0,
            volume: 0,
          }
        }

        const moneyToInvest = firstInvests[stockSymbol] ? getMoney(ns) : Math.floor(corpus / 6)
        if (moneyToInvest > minimumMoneyToInvest) {
          let volume = Math.floor(moneyToInvest / ns.getStockAskPrice(stockSymbol))
          volume = Math.min(volume, ns.getStockMaxShares(stockSymbol))

          if (volume > 0) {
            const longBuyValue = ns.buyStock(stockSymbol, volume)

            const message = `[${localeHHMMSS()}] ${stockSymbol}, buying longs,
              volume: ${volume},
              price per share: ${ns.nFormat(longBuyValue, '$0.000a')},
              invested: ${ns.nFormat(volume * longBuyValue, '$0.000a')},
              moneyToInvest: ${ns.nFormat(moneyToInvest, '$0.000a')},
              corpus: ${ns.nFormat(corpus, '$0.000a')}`
              .replace(/\r/g, '')
              .replace(/\n/g, '')
              .replace(/\s+/g, ' ')
              .trim()
            ns.tprint(message)

            if (longBuyValue && volume) {
              firstInvests[stockSymbol] = true
              profitTracker = {
                position: 'Long',
                value: longBuyValue,
                volume,
              }
            }
          } else {
            ns.tprint(`[${localeHHMMSS()}] ERROR #1: ${stockSymbol}, buying longs, volume: ${volume},
              getMoney(ns): ${getMoney(ns)}, Math.floor(corpus / 6): ${Math.floor(corpus / 6)},
              moneyToInvest: ${ns.nFormat(moneyToInvest, '$0.000a')}`)
          }
        } else {
          ns.tprint(`[${localeHHMMSS()}] ERROR #2: ${stockSymbol}, buying longs,
            getMoney(ns): ${getMoney(ns)}, Math.floor(corpus / 6): ${Math.floor(corpus / 6)},
            moneyToInvest: ${ns.nFormat(moneyToInvest, '$0.000a')}`)
        }
      } else {
        // It's falling now, sell long, buy short
        const longSellValue = ns.sellStock(stockSymbol, 9999999999999999999999999)
        if (longSellValue && profitTracker.volume) {
          const profit = profitTracker.volume * (longSellValue - profitTracker.value) - 200000
          corpus += profit

          const message = `[${localeHHMMSS()}] ${stockSymbol}, selling longs,
            profitTracker.volume: ${profitTracker.volume}, profitTracker.value: ${ns.nFormat(profitTracker.value, '$0.000a')},
            longSellValue: ${ns.nFormat(longSellValue, '$0.000a')},
            profit: ${ns.nFormat(profit, '$0.000a')}, corpus: ${ns.nFormat(corpus, '$0.000a')}`
            .replace(/\r/g, '')
            .replace(/\n/g, '')
            .replace(/\s+/g, ' ')
            .trim()
          ns.tprint(message)

          profitTracker = {
            position: '',
            value: 0,
            volume: 0,
          }
        }

        const moneyToInvest = firstInvests[stockSymbol] ? getMoney(ns) : Math.floor(corpus / 6)
        if (moneyToInvest > minimumMoneyToInvest) {
          let volume = Math.floor(moneyToInvest / ns.getStockBidPrice(stockSymbol))
          volume = Math.min(volume, ns.getStockMaxShares(stockSymbol))

          if (volume > 0) {
            const shortBuyValue = ns.shortStock(stockSymbol, volume)

            const message = `[${localeHHMMSS()}] ${stockSymbol}, buying shorts,
              volume: ${volume},
              price per share: ${ns.nFormat(shortBuyValue, '$0.000a')},
              invested: ${ns.nFormat(volume * shortBuyValue, '$0.000a')},
              moneyToInvest: ${ns.nFormat(moneyToInvest, '$0.000a')},
              corpus: ${ns.nFormat(corpus, '$0.000a')}`
              .replace(/\r/g, '')
              .replace(/\n/g, '')
              .replace(/\s+/g, ' ')
              .trim()
            ns.tprint(message)

            if (shortBuyValue && volume) {
              firstInvests[stockSymbol] = true
              profitTracker = {
                position: 'Short',
                value: shortBuyValue,
                volume,
              }
            }
          } else {
            ns.tprint(`[${localeHHMMSS()}] ERROR #3: ${stockSymbol}, buying shorts, volume: ${volume},
              getMoney(ns): ${getMoney(ns)}, Math.floor(corpus / 6): ${Math.floor(corpus / 6)},
              moneyToInvest: ${ns.nFormat(moneyToInvest, '$0.000a')}`)
          }
        } else {
          ns.tprint(`[${localeHHMMSS()}] ERROR #4: ${stockSymbol}, buying shorts,
            getMoney(ns): ${getMoney(ns)}, Math.floor(corpus / 6): ${Math.floor(corpus / 6)},
            moneyToInvest: ${ns.nFormat(moneyToInvest, '$0.000a')}`)
        }
      }
    }
  }

  avgTrackers[stockSymbol] = avgTracker
  profitTrackers[stockSymbol] = profitTracker
  risingTrackers[stockSymbol] = rising
}

export async function main(ns) {
  ns.disableLog('ALL')
  let tickCounter = 1
  corpus = ns.getServerMoneyAvailable('home') - 1000000

  stockSymbols.forEach((stockSymbol) => {
    const [sharesLong, avgPriceLong, sharesShort, avgPriceShort] = ns.getStockPosition(stockSymbol)

    corpus += sharesLong * avgPriceLong + sharesShort * avgPriceShort
  })

  ns.print(`[${localeHHMMSS()}] Tick counter: 1, corpus: ${ns.nFormat(corpus, '$0.000a')}`)
  while (true) {
    for (let i = 0; i < stockSymbols.length; i++) {
      const stockSymbol = stockSymbols[i]
      processTick(ns, stockSymbol)
      await ns.sleep(1)
    }
    if (tickCounter % 10 === 0) {
      ns.print(`[${localeHHMMSS()}] Tick counter: ${tickCounter}, corpus: ${ns.nFormat(corpus, '$0.000a')}`)
    }

    if (tickCounter % 50 === 0) {
      ns.tprint(`[${localeHHMMSS()}] Tick counter: ${tickCounter}, corpus: ${ns.nFormat(corpus, '$0.000a')}`)
    }
    await ns.sleep(5995)
    tickCounter++
  }
}
