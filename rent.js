//1% of current funds, per cycle.
allowancePercentage = 0.01;
while (true) {
  currentCash = getServerMoneyAvailable('home');
  currentCash *= allowancePercentage;
  if (hacknet.getPurchaseNodeCost() <= currentCash) {
    hacknet.purchaseNode();
  } else {
    for (i = 0; i < hacknet.numNodes(); i++) {
      node = i;
      upgradeCost = hacknet.getLevelUpgradeCost(node, 1);
      if (upgradeCost <= currentCash) {
        hacknet.upgradeLevel(node, 1);
        break;
      } else {
        ramCost = hacknet.getRamUpgradeCost(node, 1);
        if (ramCost <= currentCash) {
          hacknet.upgradeRam(node, 1);
          break;
        } else {
          coreCost = hacknet.getCoreUpgradeCost(node, 1);
          if (coreCost <= currentCash) {
            hacknet.upgradeCore(node, 1);
            break;
          }
        }
      }
    }
  }
}