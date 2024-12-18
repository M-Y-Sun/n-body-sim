#!/bin/bash

enscript -B -PPDF index.html -p index.ps
ps2pdf index.ps index.pdf
rm index.ps
