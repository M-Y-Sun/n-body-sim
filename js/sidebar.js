const thetaSlider    = document.getElementById("slider_theta");
const thetaSliderOut = document.getElementById("slider_theta_val");

thetaSliderOut.innerText = parseFloat (thetaSlider.value).toFixed(2);

thetaSlider.oninput = function () { thetaSliderOut.innerText = parseFloat (this.value).toFixed(2); }
