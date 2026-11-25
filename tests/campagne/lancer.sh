#!/bin/bash
cd /home/claude/tests/campagne
( node sim.js base 1500 1 > base1.jsonl; node sim.js des 600 1 > des1.jsonl; node sim.js carriere 100 1 assemblee assemblee 30 > car_aa.jsonl; node sim.js carriere 100 3 mairie mairie 30 > car_mm.jsonl ) 2> lane1.log &
( node sim.js base 1500 2 > base2.jsonl; node sim.js niveaux 1600 2 > niv2.jsonl; node sim.js carriere 100 2 assemblee elysee 30 > car_ae.jsonl; node sim.js carriere 100 4 mairie assemblee 30 > car_ma.jsonl ) 2> lane2.log &
wait; echo FINI > fini.txt
