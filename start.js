//presume the host to be the machine this script is running on, should probably be home, but don't let it assume so.
hostName = getHostname();

//create an object (array) to hold our servers
servers = read('allServers.txt');
servers = servers.split(';');

doLoop = true;

//arbitrary value added for valuating min security in a growth formula for speed/growth value.
minSecurityWeight = 100;
//here is where we keep track of the last run Daemon; when we run a new daemon, we kill the old one.
//this is a less sort-heavy method of targetting "optimally", though it comes with its own imperfections
lastTarget = [];
while (doLoop) {
  //loop over all the servers and find potential victims.
  for (i = 0; i < servers.length; ++i) {
    server = servers[i].split(',');
    //we need to know hacking level and ports needed to nuke to determine viable targets.
    numPorts = server[1];
    hackingLevel = server[2];
    minSecurity = server[5];
    //ignore servers above your level and servers you don't have the busters for.
    if (hasRootAccess(server[0])) {
      // if (getHackingLevel() >= hackingLevel && numPorts <= ownedBusters) {
      print('Vulnerable server ' + server[0] + ' found with difficulty of ' + hackingLevel + ' and ports: ' + numPorts);
      //now grab the other data, we're passing this to the knock script so it can pass it further to the daemon.
      target = server[0];
      hasRun = false;

      //we don't run a daemon on anything like CSEC - stuff with no money is nuke-only.
      maxMoney = server[3];
      //here is where we can provide our algorithm with some manner of targetting
      //currently I'm using max money as the only metric, which might be a bit ignorant.
      //lastTarget[1] is money
      shouldSwitchTargets = false;
      //a lastTarget length of 0 means we've never had a target, so we need a first target for starters.
      if (lastTarget.length === 0) {
        shouldSwitchTargets = true;
      } else {
        //per chapt3r, take minSecurity into account for evaluating best target.
        weightedValueOfLastTarget = lastTarget[1] * (minSecurityWeight / lastTarget[3]);
        weightedValueOfCurrentTarget = maxMoney * (minSecurityWeight / minSecurity);
        //if the last target can make us more money don't switch, just blow it off.
        shouldSwitchTargets = weightedValueOfLastTarget < weightedValueOfCurrentTarget;
      }
      if (shouldSwitchTargets) {
        if (lastTarget.length > 0) {
          scriptKill('daemon.script', hostName);
          print('Targeting daemon has found a more suitable target than ' + lastTarget[0] + ' - switching to ' + target);
        }
        hasRunDaemon = false;
        growthRate = server[4];
        while (!hasRunDaemon) {
          run('daemon.script', 1, target, maxMoney, growthRate, minSecurity, hackingLevel);
          hasRunDaemon = isRunning('daemon.script', hostName, target, maxMoney, growthRate, minSecurity, hackingLevel);
        }

        //lastTarget is now our current target - we won't access it again until we're ready to change targets.
        lastTarget = [target, maxMoney, growthRate, minSecurity, hackingLevel];
      }

      //remove the server from the list, it will eventually be compromised. this lets us stop iterating on it.
      servers.splice(i, 1);
    }
  }
  //if there are servers left in the list, keep going.
  doLoop = servers.length > 0
}