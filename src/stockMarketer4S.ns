let stockSymbols
let corpus
let underperformingShares
const commission = 100000

function localeHHMMSS(ms = 0) {
  if (!ms) {
    ms = new Date().getTime()
  }

  return new Date(ms).toLocaleTimeString()
}

function getMoney(ns) {
  return ns.getServerMoneyAvailable('home') - 5 * commission
}

function sellShorts(ns, stockSymbol) {
  const stockInfo = getStockInfo(ns, stockSymbol)
  const shortSellValue = ns.sellShort(stockSymbol, stockInfo.sharesShort)

  if (shortSellValue) {
    corpus += stockInfo.sharesShort * (stockInfo.avgPriceShort - shortSellValue) - 2 * commission
    ns.print(
      `[${localeHHMMSS()}][${stockSymbol}] Sold ${stockInfo.sharesShort} shorts for ${ns.nFormat(shortSellValue, '$0.000a')}. Profit: ${ns.nFormat(
        stockInfo.sharesLong * (stockInfo.avgPriceShort - shortSellValue) - 2 * commission,
        '$0.000a'
      )}`
    )
  }
}

function sellLongs(ns, stockSymbol) {
  const stockInfo = getStockInfo(ns, stockSymbol)
  const longSellValue = ns.sellStock(stockSymbol, stockInfo.sharesLong)

  if (longSellValue) {
    corpus += stockInfo.sharesLong * (longSellValue - stockInfo.avgPriceLong) - 2 * commission
    ns.print(
      `[${localeHHMMSS()}][${stockSymbol}] Sold ${stockInfo.sharesLong} longs for ${ns.nFormat(longSellValue, '$0.000a')}. Profit: ${ns.nFormat(
        stockInfo.sharesLong * (longSellValue - stockInfo.avgPriceLong) - 2 * commission,
        '$0.000a'
      )}`
    )
  }
}

// Only if not going to lose money
function sellUnderperforming(ns, stockSymbol) {
  const stockInfo = getStockInfo(ns, stockSymbol)

  if (stockInfo.sharesShort && stockInfo.sharesShort * (stockInfo.avgPriceShort - stockInfo.stockAskPrice) > 2 * commission) {
    sellShorts(ns, stockSymbol)
  }

  if (stockInfo.sharesLong && stockInfo.sharesLong * (stockInfo.stockBidPrice - stockInfo.avgPriceLong) > 2 * commission) {
    sellLongs(ns, stockSymbol)
  }
}

function sellWrongPosition(ns, stockSymbol) {
  const stockInfo = getStockInfo(ns, stockSymbol)

  // Sell shorts if going up
  if (stockInfo.position === 'Long' && stockInfo.sharesShort) {
    sellShorts(ns, stockSymbol)
  }

  // Sell longs if going down
  if (stockInfo.position === 'Short' && stockInfo.sharesLong) {
    sellLongs(ns, stockSymbol)
  }
}

function buyNewShares(ns, stockSymbol) {
  const stockInfo = getStockInfo(ns, stockSymbol)
  const minimumMoneyToInvest = 10 * commission

  if (!stockInfo.haveMaxShares && getMoney(ns) > minimumMoneyToInvest) {
    let maxSharesToBuy
    let sharesToBuy
    let buyValue
    let shareType

    if (stockInfo.position === 'Long') {
      maxSharesToBuy = stockInfo.maxShares - stockInfo.sharesLong
      sharesToBuy = Math.max(0, Math.min(maxSharesToBuy, Math.floor(getMoney(ns) / stockInfo.stockAskPrice)))
      if (sharesToBuy) {
        buyValue = ns.buyStock(stockSymbol, sharesToBuy)
      }
      shareType = 'longs'
    } else {
      maxSharesToBuy = stockInfo.maxShares - stockInfo.sharesShort
      sharesToBuy = Math.max(0, Math.min(maxSharesToBuy, Math.floor(getMoney(ns) / stockInfo.stockBidPrice)))
      if (sharesToBuy) {
        buyValue = ns.shortStock(stockSymbol, sharesToBuy)
      }
      shareType = 'shorts'
    }

    if (sharesToBuy) {
      const invested = ns.nFormat(buyValue * sharesToBuy, '$0.000a')
      ns.print(`[${localeHHMMSS()}][${stockSymbol}] Bought ${sharesToBuy} ${shareType} for ${ns.nFormat(buyValue, '$0.000a')} each. Invested: ${invested}`)
    }
  }
}

function getStockInfo(ns, stockSymbol) {
  const [sharesLong, avgPriceLong, sharesShort, avgPriceShort] = ns.getStockPosition(stockSymbol)
  const volatility = ns.getStockVolatility(stockSymbol)
  const probability = ns.getStockForecast(stockSymbol) - 0.5
  const expectedReturn = Math.abs(volatility * probability)
  const maxShares = ns.getStockMaxShares(stockSymbol)

  const haveAnyShares = sharesLong + sharesShort > 0
  const haveMaxShares = sharesLong + sharesShort === maxShares

  const stockAskPrice = ns.getStockAskPrice(stockSymbol)
  const stockBidPrice = ns.getStockBidPrice(stockSymbol)

  const position = probability >= 0 ? 'Long' : 'Short'

  return {
    stockSymbol,
    maxShares,
    haveAnyShares,
    haveMaxShares,
    sharesLong,
    avgPriceLong,
    stockAskPrice,
    sharesShort,
    avgPriceShort,
    stockBidPrice,
    volatility,
    probability,
    expectedReturn,
    position,
  }
}

export async function main(ns) {
  ns.disableLog('ALL')
  let tickCounter = 1

  stockSymbols = ns.getStockSymbols()

  corpus = ns.getServerMoneyAvailable('home') - 1000000
  stockSymbols.forEach((stockSymbol) => {
    const stockInfo = getStockInfo(ns, stockSymbol)

    corpus += stockInfo.sharesLong * stockInfo.avgPriceLong + stockInfo.sharesShort * stockInfo.avgPriceShort
  })
  const startingCorpus = corpus

  while (true) {
    ns.clearLog()
    ns.print(`[${localeHHMMSS()}] Tick counter: ${tickCounter}, corpus: ${ns.nFormat(corpus, '$0.000a')}`)
    ns.print(`[${localeHHMMSS()}] Starting corpus: ${ns.nFormat(startingCorpus, '$0.000a')}`)

    stockSymbols.sort((a, b) => {
      const stockA = getStockInfo(ns, a)
      const stockB = getStockInfo(ns, b)

      if (stockB.expectedReturn === stockA.expectedReturn) {
        return Math.abs(stockB.probability) - Math.abs(stockA.probability)
      }

      return stockB.expectedReturn - stockA.expectedReturn
    })

    stockSymbols
      .filter((stockSymbol) => getStockInfo(ns, stockSymbol).haveAnyShares)
      .filter((stockSymbol, index) => stockSymbol !== stockSymbols[index])
      .forEach((stockSymbol) => sellUnderperforming(ns, stockSymbol))
    await ns.sleep(5)

    stockSymbols.forEach((stockSymbol) => sellWrongPosition(ns, stockSymbol))
    await ns.sleep(5)

    stockSymbols.forEach((stockSymbol) => buyNewShares(ns, stockSymbol))
    await ns.sleep(5)

    ns.print(`[${localeHHMMSS()}] After transactions: corpus: ${ns.nFormat(corpus, '$0.000a')}`)
    await ns.sleep(3500)
    tickCounter++
  }
}
