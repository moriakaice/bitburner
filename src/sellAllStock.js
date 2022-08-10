const commission = 100000
let stockSymbols

function localeHHMMSS(ms = 0) {
  if (!ms) {
    ms = new Date().getTime()
  }

  return new Date(ms).toLocaleTimeString()
}

function sellShorts(ns, stockSymbol) {
  const stockInfo = getStockInfo(ns, stockSymbol)
  const shortSellValue = ns.sellShort(stockSymbol, stockInfo.sharesShort)

  if (shortSellValue) {
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
    ns.print(
      `[${localeHHMMSS()}][${stockSymbol}] Sold ${stockInfo.sharesLong} longs for ${ns.nFormat(longSellValue, '$0.000a')}. Profit: ${ns.nFormat(
        stockInfo.sharesLong * (longSellValue - stockInfo.avgPriceLong) - 2 * commission,
        '$0.000a'
      )}`
    )
  }
}

function getStockInfo(ns, stockSymbol) {
  const [sharesLong, avgPriceLong, sharesShort, avgPriceShort] = ns.getStockPosition(stockSymbol)

  const stockAskPrice = ns.getStockAskPrice(stockSymbol)
  const stockBidPrice = ns.getStockBidPrice(stockSymbol)

  return {
    stockSymbol,
    sharesLong,
    avgPriceLong,
    stockAskPrice,
    sharesShort,
    avgPriceShort,
    stockBidPrice,
  }
}

export async function main(ns) {
  ns.disableLog('ALL')

  stockSymbols = ns.getStockSymbols()
  stockSymbols.forEach((stockSymbol) => {
    sellLongs(ns, stockSymbol)
    sellShorts(ns, stockSymbol)
  })
}
