//responsible for scheduling a single cycle of daemon work for the target server
//as always.. ARRRRGS

target = args[0];
threadsNeededToWeakenForGrow = args[1];
threadsNeededToGrow = args[2];
weakenExecutionTime = args[3];
growExecutionTime = args[4];
i = args[5]; //i allows this script to run concurrent copies

stepDelay = 7;

scripts = ['weaken-target.script', 'grow-target.script'];
//moved this out of the two-script "loop" to optimize out an if statement.
threadsNeeded = threadsNeededToWeakenForGrow;
growWeakenSleep = (weakenExecutionTime - growExecutionTime) - stepDelay; //fire grow's weaken a step later
discriminationVariable = 'grow'; //this allows two weakens with the same index-arg to exist at the same time.
for (j = 0; j < scripts.length; j++) {
  if (threadsNeeded > 0) {
    run(scripts[j], threadsNeeded, target, i, discriminationVariable);
    sleep(growWeakenSleep * 1000, false); //waits a step.
  }
  threadsNeeded = threadsNeededToGrow; //sets up the threads needed for the next pass.
  discriminationVariable = '';
  growWeakenSleep = 0.001; //causes the sleep cycle to be arbitrarily slow.
}