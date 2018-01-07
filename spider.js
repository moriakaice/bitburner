doLoop = true;
servers = [];
scanArray = ['home'];
currentScanLength = 0;

while (doLoop) {
  previousScanLength = currentScanLength;
  currentScanLength = scanArray.length;
  for (i = previousScanLength; i < currentScanLength; i++) {
    currentHost = scanArray[i];

    //hostName, numPorts, hackingLevel, maxMoney, growthRate, minSecurity, RAM
    //0         1         2             3         4           5            6
    server = [
      currentHost,
      getServerNumPortsRequired(currentHost),
      getServerRequiredHackingLevel(currentHost),
      getServerMaxMoney(currentHost),
      getServerGrowth(currentHost),
      getServerMinSecurityLevel(currentHost),
      getServerRam(currentHost)[0]
    ];

    if (server[0] != 'home' && !server[0].includes('pserv')) {
      //add the server to the servers object
      servers.push(server.join(','));
    }

    //add this servers connected nodes (other servers) to the scan list
    newScan = scan(currentHost);

    for (j = 0; j < newScan.length; j++) {
      //exclude anything we have already scanned. names are unique indexes which allows this to work.
      if (!scanArray.includes(newScan[j]) && !newScan[j].includes('pserv')) {
        scanArray.push(newScan[j]);
      }
    }
  }
  //if we're about to exit the loop, switch a mode variable from 0 to 1. This moves the script to phase 2, nuking.
  if (currentScanLength == scanArray.length) {
    doLoop = false;
  }
}
write('allServers', servers.join(';'), 'w');

hostName = getHostname();
if (hostName === 'home') {
  exec('hackAll.script', hostName);
}

exec('start.script', hostName);