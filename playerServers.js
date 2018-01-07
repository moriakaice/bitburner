scriptsToCopy = ['hack-scheduler.script', 'grow-scheduler.script', 'weaken-target.script', 'grow-target.script', 'hack-target.script', 'start.script', 'daemon.script', 'spider.script'];

ramToBuy = 64;
if (serverExists('pserv-0')) {
  ramToBuy = Math.max(ramToBuy, getServerRam('pserv-0')[0]);
}

if ((getServerMoneyAvailable('home') > 50000 * ramToBuy)) {
  ramToBuy *= 2;

  while (getServerMoneyAvailable('home') > 50000 * ramToBuy) {
    ramToBuy *= 2;
  }
  ramToBuy /= 2;
}
print('Buying player servers. Target: ' + ramToBuy + ' GB RAM for ' + 50000 * ramToBuy + '$');

i = 0;
doLoop = true;
while (doLoop) {
  if (i >= 25) {
    if (serverExists('pserv-0')) {
      ramToBuy = Math.max(ramToBuy, getServerRam('pserv-0')[0] * 4);
    }

    if ((getServerMoneyAvailable('home') > 50000 * ramToBuy)) {
      ramToBuy *= 4;

      while (getServerMoneyAvailable('home') > 50000 * ramToBuy) {
        ramToBuy *= 4;
      }

      ramToBuy /= 4;
    }

    print('Buying player servers. Target: ' + ramToBuy + ' GB RAM for ' + 50000 * ramToBuy + '$');
    i = 0;
    sleep(600 * 1000, false);
  } else {
    if (!serverExists('pserv-' + i) || getServerRam('pserv-' + i)[0] < ramToBuy) {
      if (getServerMoneyAvailable('home') > 50000 * ramToBuy) {
        if (serverExists('pserv-' + i)) {
          killall('pserv-' + i);
          sleep(20 * 1000, false);
          deleteServer('pserv-' + i);
          sleep(5 * 1000, false);
        }
  
        if (!serverExists('pserv-' + i)) {
          hostname = purchaseServer('pserv-' + i, ramToBuy);
          if (hostname) {
            for (j = 0; j < scriptsToCopy.length; ++j) {
              scp(scriptsToCopy[j], hostname);
            }
            exec('spider.script', hostname);
            ++i;
          }
        }
      }
    } else {
      ++i;
    }
  }
}