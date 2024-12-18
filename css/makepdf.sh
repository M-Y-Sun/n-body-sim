#!/bin/bash

enscript -B -PPDF core.css sidebar.css popup.css body.css -p css.ps
ps2pdf css.ps css.pdf
rm css.ps
