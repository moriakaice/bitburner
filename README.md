# Bitburner scripts collection
Welcome to my log of [Bitburner](https://danielyxie.github.io/bitburner/) scripts. They are written using the in-game language of Netscript, which is a mutation of Javascript.

If you want to play the game itself - click on the name above.

A lot of this code is copied/based on a great [Reddit post](https://www.reddit.com/r/Bitburner/comments/70ikjm/progression_scripts_0286/) by [/u/MercuriusXeno](https://www.reddit.com/user/MercuriusXeno). I've modded some parts of it to fit my own requirements and playstyle, but their code forms a significant amount of this code and was a great base.

## Requirements
I only started using my scripts after an upgrade or two of my home server RAM, so be aware they might require more memory than you have when you first start the game. If you're just a beginner, you might want to read [Chapt3rs Guide to Getting Started with Bitburner](http://bitburner.wikia.com/wiki/Chapt3rsGettingStartedGuide) and use the tips&trick provided there.

After you manage to get your stuff going, feel free to try mine to see how they compare to how you're doing.

## How to use
1. Copy the scripts to your home server, running `nano <filename>` and pasting the content provided (`js` file extension is used within the repo for an ease of formatting and markup highlighting and should be replaced with `script` when created within the context of Bitburner).
2. After everything is in place, type `run botnet.script`
3. After each reset (installing Augumentations), make sure to edit values in `daemon.script` with what you find on the Stats tab in Bitburner.

## File list and description
Please note that you should create all the files listed here on your home server before running anything, otherwise bad things will happen. Don't forget to map `js` exntension here to `script` in Bitburner.

* `botnet.script`: core of the things, running most of the other stuff. Fire and forget about the game, it'll do it all for you;
* `playerServers.script`: a script to buy player-owned servers (up to the limit of 25) and then upgrade them as you gain more money. Runs big server scripts on all of them;
* `hackAll.script`: this goes over all the servers and tries to hack them if the player has means to do so;
* `rent.script`: manages buying Hacknet nodes - they bring very little profit that won't be noticeable later in the game, but since it's an option, let's have it automated;
* `owned.script`: simple marker that the server was handled by the script;
* `copyPayload.script`: script to allow for manual server owning, when waiting for `hackAll.script` is just too much. Takes one parameter, target server's name;
* Big server scripts:
  * `spider.script`: maps all exisitng servers into file. Unfortunately, that file can't yet be copied over to different servers in Bitburner yet;
  * `start.script`: main script responsible for selecting the best server to be weakened, grown and hacked continously;
  * `daemon.script`: core for the hacking, decides what to do with the target: weaken it, grow it, or hack it. Contains some variables towards the top, be sure to edit those after each run;
  * `hack-scheduler.script`: schedules weaken-hack cycle;
  * `grow-scheduler.script`: schedules weaken-grow cycle;
  * `weaken-target.script`: a single weaken target script;
  * `grow-target.script`: a single grow target script;
  * `hack-target.script`: a single hack target script;
* Small server scripts:
  * `basicHack.js`: a small script that weakens/grows/hacks the host over and over;
* No money server scripts:
  * `foodnStuffGrow.script`: script to grow Food'n'stuff server in a loop;
  * `foodnStuffHack.script`: script to hack Food'n'stuff server in a loop;
  * `foodnStuffWeaken.script`: script to weaken Food'n'stuff server in a loop;