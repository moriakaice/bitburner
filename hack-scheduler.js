//responsible for scheduling a single cycle of daemon work for the target server
//as always.. ARRRRGS

target = args[0];
threadsNeededToWeakenForHack = args[1];
threadsNeededToHack = args[2];
weakenExecutionTime = args[3];
hackExecutionTime = args[4];
i = args[5]; //i allows this script to run concurrent copies

stepDelay = 7;

hackWeakenSleep = (weakenExecutionTime - hackExecutionTime) - stepDelay; //fire weaken a step after
discriminationVariable = 'hack';
threadsNeeded = threadsNeededToWeakenForHack;

scripts = ['weaken-target.script', 'hack-target.script'];
for (j = 0; j < scripts.length; j++) {
  if (threadsNeeded > 0) {
    run(scripts[j], threadsNeeded, target, i, discriminationVariable);
    sleep(hackWeakenSleep * 1000, false);
  }
  threadsNeeded = threadsNeededToHack;
  discriminationVariable = '';
  hackWeakenSleep = 0.001;
}