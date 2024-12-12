thetaSliderVal.innerText = parseFloat (thetaSlider.value).toFixed(2);
massSliderVal.innerText  = massSlider.value;

thetaSlider.oninput = function () {
    thetaSliderVal.innerText = parseFloat (this.value).toFixed(2);
};
// massSlider oninput is defined in simulate.js
