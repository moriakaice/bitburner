//1% of current funds, per cycle.
allowancePercentage = 0.01;
while (true) {
  currentCash = getServerMoneyAvailable('home');
  currentCash *= allowancePercentage;
  if (getNextHacknetNodeCost() <= currentCash) {
    purchaseHacknetNode();
  } else {
    for (i = 0; i < hacknetnodes.length; i++) {
      node = hacknetnodes[i];
      upgradeCost = node.getLevelUpgradeCost(1);
      if (upgradeCost <= currentCash) {
        node.upgradeLevel(1);
        break;
      } else {
        ramCost = node.getRamUpgradeCost();
        if (ramCost <= currentCash) {
          node.upgradeRam();
          break;
        } else {
          coreCost = node.getCoreUpgradeCost();
          if (coreCost <= currentCash) {
            node.upgradeCore();
            break;
          }
        }
      }
    }
  }
}