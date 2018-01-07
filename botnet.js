nuke('foodnstuff');
run('copyPayload.script', 1, 'foodnstuff');

if (!scriptRunning('rent.script', 'home')) {
  exec('rent.script', 'home');
}

if (!scriptRunning('playerServers.script', 'home')) {
  exec('playerServers.script', 'home');
}

if (!scriptRunning('spider.script', 'home')) {
  exec('spider.script', 'home');
}

tprint('Botnet up and running. Keep monitoring the progress.');