hostname = getHostname();

while (true) {
  if (getServerSecurityLevel(hostname) > round(getServerBaseSecurityLevel(hostname) / 3) + 2) {
    weaken(hostname);
  } else if (getServerMoneyAvailable(hostname) / getServerMaxMoney(hostname) < 0.75) {
    grow(hostname);
  } else {
    hack(hostname);
  }
}