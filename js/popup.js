const curmassSlider    = document.getElementById("slider_curmass");
const curmassSliderOut = document.getElementById("slider_curmass_val");

curmassSliderOut.innerText = curmassSlider.value;

const popup   = document.getElementById("popup");
let   curElem = null;

function showPopup (elem)
{
    curElem = elem;

    curmassSlider.value = curmassSliderOut.innerText = elem.style.width.slice(0, -2);

    popup.style.top        = (parseInt (elem.style.top) + 50) + "px";
    popup.style.left       = (parseInt (elem.style.left) - 90) + "px";
    popup.style.visibility = "visible";
}

curmassSlider.oninput = function () {
    curmassSliderOut.innerText = curmassSlider.value;
    const slidernum            = parseInt (curmassSlider.value);
    curElem.style.top  = (parseFloat (curElem.style.top) - (slidernum - parseFloat (curElem.style.height)) / 2) + "px";
    curElem.style.left = (parseFloat (curElem.style.left) - (slidernum - parseFloat (curElem.style.width)) / 2) + "px";
    curElem.style.width  = curmassSlider.value + "px";
    curElem.style.height = curmassSlider.value + "px";
}

function hidePopup (e)
{
    if (e == undefined || e.key == "Escape")
        popup.style.visibility = "hidden";
}

document.addEventListener ("keydown", hidePopup);
