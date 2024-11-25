const thetaSlider    = document.getElementById("slider_theta");
const massSlider     = document.getElementById("slider_mass");
const thetaSliderOut = document.getElementById("slider_theta_val");
const massSliderOut  = document.getElementById("slider_mass_val");

thetaSliderOut.innerText = parseFloat (thetaSlider.value).toFixed(2);
massSliderOut.innerText  = massSlider.value;

thetaSlider.oninput = function () { thetaSliderOut.innerText = parseFloat (this.value).toFixed(2); };
// massSlider oninput is defined in simulat.js
