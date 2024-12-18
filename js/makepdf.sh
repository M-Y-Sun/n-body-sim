#!/bin/bash

enscript -B -PPDF quadtree.js globals.js sidebar.js popup.js simulate.js keybinds.js -p js.ps
ps2pdf js.ps js.pdf
rm js.ps
