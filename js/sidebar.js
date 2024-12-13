thetaSliderVal.innerText = parseFloat (thetaSlider.value).toFixed(2);
massSliderVal.innerText  = massSlider.value;
gSliderVal.innerText     = parseFloat (gSlider.value).toFixed(2);

thetaSlider.oninput = function () {
    thetaSliderVal.innerText = parseFloat (this.value).toFixed(2);
};

// massSlider oninput is defined in simulate.js

gSlider.oninput = function () {
    const val            = parseFloat (this.value);
    gSliderVal.innerText = val.toFixed(2);
    qt.setGFac(val);
};
