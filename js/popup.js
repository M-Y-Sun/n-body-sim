const curmassSlider    = document.getElementById("slider_curmass");
const vxSlider         = document.getElementById("slider_vx");
const vySlider         = document.getElementById("slider_vy");
const curmassSliderVal = document.getElementById("slider_curmass_val");
const vxSliderVal      = document.getElementById("slider_vx_val");
const vySliderVal      = document.getElementById("slider_vy_val");

curmassSliderVal.innerText = curmassSlider.value;
vxSliderVal.innerText      = parseFloat (vxSlider.value).toFixed(1);
vySliderVal.innerText      = parseFloat (vySlider.value).toFixed(1);

const popup   = document.getElementById("popup");
let   curElem = null;

function showPopup (elem)
{
    curElem = elem;

    curmassSlider.value = curmassSliderVal.innerText = elem.style.width.slice(0, -2);

    const id              = parseInt (elem.id.slice(4));
    vxSliderVal.innerText = vxSlider.value = qt.nodes[id].force.x.toFixed(1);
    vySliderVal.innerText = vySlider.value = qt.nodes[id].force.y.toFixed(1);

    popup.style.top        = (parseInt (elem.style.top) + 50) + "px";
    popup.style.left       = (parseInt (elem.style.left) - 90) + "px";
    popup.style.visibility = "visible";
}

curmassSlider.oninput = function () {
    curmassSliderVal.innerText = curmassSlider.value;

    const slidernum            = parseInt (curmassSlider.value);
    const id = parseInt(curElem.id.slice(4));

    qt.nodes[id].com.x = parseFloat (curElem.style.left) - (slidernum - parseFloat (curElem.style.width)) / 2;
    qt.nodes[id].com.y = parseFloat (curElem.style.top) - (slidernum - parseFloat (curElem.style.height)) / 2;
    qt.nodes[id].totalMass = parseInt (curmassSlider.value);

    curElem.style.left = qt.nodes[id].com.x + "px";
    curElem.style.top  = qt.nodes[id].com.y + "px";
    curElem.style.width  = curmassSlider.value + "px";
    curElem.style.height = curmassSlider.value + "px";
}

vxSlider.oninput = function () {
    vxSliderVal.innerText = parseFloat(vxSlider.value).toFixed(1);

    const id = parseInt(curElem.id.slice(4));
    qt.nodes[id].force.x = parseFloat (vxSlider.value) * qt.nodes[id].totalMass;
}

vySlider.oninput = function () {
    vySliderVal.innerText = parseFloat(vySlider.value).toFixed(1);

    const id = parseInt(curElem.id.slice(4));
    qt.nodes[id].force.y = -1 * parseFloat (vySlider.value) * qt.nodes[id].totalMass;
}

function hidePopup (e)
{
    if (e == undefined || e.key == "Escape")
        popup.style.visibility = "hidden";
}

document.addEventListener ("keydown", hidePopup);
