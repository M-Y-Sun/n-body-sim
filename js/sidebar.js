const thetaSlider    = document.getElementById("slider_theta");
const massSlider     = document.getElementById("slider_mass");
const thetaSliderVal = document.getElementById("slider_theta_val");
const massSliderVal  = document.getElementById("slider_mass_val");

thetaSliderVal.innerText = parseFloat (thetaSlider.value).toFixed(2);
massSliderVal.innerText  = massSlider.value;

thetaSlider.oninput = function () { thetaSliderVal.innerText = parseFloat (this.value).toFixed(2); };
// massSlider oninput is defined in simulate.js
