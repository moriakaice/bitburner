programs = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe']
scriptsToCopy = ['hack-scheduler.script', 'grow-scheduler.script', 'weaken-target.script', 'grow-target.script', 'hack-target.script', 'start.script', 'daemon.script', 'spider.script'];
fnsScripts = ['foodNStuffGrow.script', 'foodNStuffGrow.script', 'foodNStuffHack.script', 'foodNStuffWeaken.script', 'foodNStuffGrow.script'];

allServers = read('allServers');
allServers = allServers.split(';');
allServersLength = allServers.length;

fnsCounter = 0;

doLoop = true;
while (doLoop) {
  currentHackLevel = getHackingLevel();
  currentOpenPortSoftare = 0;

  for (i = 0; i < programs.length; ++i) {
    if (fileExists(programs[i], 'home')) {
      ++currentOpenPortSoftare;
    }
  }

  for (i = 0; i < allServersLength; ++i) {
    //hostName, numPorts, hackingLevel, maxMoney, growthRate, minSecurity, RAM
    //0         1         2             3         4           5            6
    currentServer = allServers[i].split(',');

    if (currentServer[2] <= currentHackLevel && currentServer[1] <= currentOpenPortSoftare) {
      if (!hasRootAccess(currentServer[0])) {
        for (j = 0; j < programs.length; ++j) {
          if (fileExists(programs[j], 'home')) {
            if (j === 0) { brutessh(currentServer[0]); }
            if (j === 1) { ftpcrack(currentServer[0]); }
            if (j === 2) { relaysmtp(currentServer[0]); }
            if (j === 3) { httpworm(currentServer[0]); }
            if (j === 4) { sqlinject(currentServer[0]); }
          }
        }
        nuke(currentServer[0]);
      }

      if (!fileExists('owned.script', currentServer[0])) {
        if (currentServer[6] >= 32 && currentServer[3] > 0) {
          for (j = 0; j < scriptsToCopy.length; ++j) {
            scp(scriptsToCopy[j], currentServer[0]);
          }
          exec('spider.script', currentServer[0]);
        } else if (currentServer[6] >= 4 && currentServer[3] > 0) {
          scp('basicHack.script', currentServer[0]);
          exec('basicHack.script', currentServer[0], Math.floor(currentServer[6] / getScriptRam('basicHack.script', 'home')));
        } else if (currentServer[6] >= 2) {
          for (j = 0; j < fnsScripts.length; ++j) {
            scp(fnsScripts[j], currentServer[0]);
          }
          fnsScriptToLaunch = Math.floor(Math.random() * fnsScripts.length) % fnsScripts.length;
          exec(fnsScripts[fnsScriptToLaunch], currentServer[0], Math.floor(currentServer[6] / getScriptRam(fnsScripts[fnsScriptToLaunch], 'home')));
          ++fnsCounter;
        }
  
        scp('owned.script', currentServer[0]);
        tprint('Owned ' + currentServer[0]);
      }
    }
  }
}
