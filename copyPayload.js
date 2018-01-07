programs = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe']
scriptsToCopy = ['hack-scheduler.script', 'grow-scheduler.script', 'weaken-target.script', 'grow-target.script', 'hack-target.script', 'start.script', 'daemon.script', 'spider.script'];
fnsScripts = ['foodNStuffGrow.script', 'foodNStuffGrow.script', 'foodNStuffHack.script', 'foodNStuffWeaken.script', 'foodNStuffGrow.script'];

target = args[0]

if (!hasRootAccess(target)) {
  for (j = 0; j < programs.length; ++j) {
    if (fileExists(programs[j], 'home')) {
      if (j === 0) { brutessh(target); }
      if (j === 1) { ftpcrack(target); }
      if (j === 2) { relaysmtp(target); }
      if (j === 3) { httpworm(target); }
      if (j === 4) { sqlinject(target); }
    }
  }
  nuke(target);
}

scp('owned.script', target);
maxRam = getServerRam(target)[0];

if (maxRam >= 32 && (getServerMaxMoney(target) > 0 || target.includes('pserv'))) {
  for (j = 0; j < scriptsToCopy.length; ++j) {
    scp(scriptsToCopy[j], target);
  }
  exec('spider.script', target);
} else if (maxRam >= 4 && getServerMaxMoney(target) > 0 && !target.includes('pserv')) {
  scp('basicHack.script', target);
  exec('basicHack.script', target, Math.floor(maxRam / getScriptRam('basicHack.script', 'home')));
} else if (maxRam >= 2) {
  for (j = 0; j < fnsScripts.length; ++j) {
    scp(fnsScripts[j], target);
  }
  fnsScriptToLaunch = Math.floor(Math.random() * fnsScripts.length) % fnsScripts.length;
  exec(fnsScripts[fnsScriptToLaunch], target, Math.floor(maxRam / getScriptRam(fnsScripts[fnsScriptToLaunch], 'home')));
}

tprint('Owned ' + target);