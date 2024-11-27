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

/**
 * Shows the popup from selecting the specified element and indicates that element as selected.
 * @param {HTMLElement} elem The selected element.
 */
function showPopup (elem)
{
    curElem = elem;

    // width = cbrt(mass) * 10 => mass = (width / 10)^3
    curmassSlider.value = curmassSliderVal.innerText
        = Math.round(Math.pow(parseFloat (elem.style.width.slice(0, -2)) / 10, 3)).toString();

    const id              = parseInt (elem.id.slice(4));
    const m               = qt.nodes[id].totalMass;
    vxSliderVal.innerText = vxSlider.value = (qt.nodes[id].force.x / m).toFixed(1);
    vySliderVal.innerText = vySlider.value = (qt.nodes[id].force.y / m).toFixed(1);

    popup.style.visibility = "visible";
    elem.classList.add("selected");
}

curmassSlider.oninput = function () {
    curmassSliderVal.innerText = curmassSlider.value;

    const slidernum            = Math.cbrt(parseInt (curmassSlider.value)) * 10;
    const id = parseInt(curElem.id.slice(4));

    qt.nodes[id].com.x = parseFloat (curElem.style.left) - (slidernum - parseFloat (curElem.style.width)) / 2;
    qt.nodes[id].com.y = parseFloat (curElem.style.top) - (slidernum - parseFloat (curElem.style.height)) / 2;
    qt.nodes[id].totalMass = parseInt (curmassSlider.value);

    curElem.style.left = qt.nodes[id].com.x + "px";
    curElem.style.top  = qt.nodes[id].com.y + "px";
    curElem.style.width  = (Math.cbrt(curmassSlider.value) * 10) + "px";
    curElem.style.height = (Math.cbrt(curmassSlider.value) * 10) + "px";
}

/** The amount to scale the velocity vector in the display */
const mfac = 32;

vxSlider.oninput = function () {
    const vxVal = parseFloat(vxSlider.value);
    vxSliderVal.innerText = vxVal.toFixed(1);

    const id = parseInt(curElem.id.slice(4));
    qt.nodes[id].force.x = vxVal * qt.nodes[id].totalMass;

    const svg = document.getElementById("arrow_line" + id);
    const node = qt.nodes[id];
    const offset = Math.cbrt(node.totalMass) * 5;
    svg.setAttribute("d", `M${node.com.x + offset},${node.com.y + offset} L${node.com.x + mfac * vxVal + offset},${
                              node.com.y + -mfac * (parseFloat (vySlider.value)) + offset}`);
}

vySlider.oninput = function () {
    const vyVal = parseFloat(vySlider.value);
    vySliderVal.innerText = vyVal.toFixed(1);

    const id = parseInt(curElem.id.slice(4));
    qt.nodes[id].force.y = -vyVal * qt.nodes[id].totalMass;

    const svg = document.getElementById("arrow_line" + id);
    const node = qt.nodes[id];
    const offset = Math.cbrt(node.totalMass) * 5;
    svg.setAttribute("d", `M${node.com.x + offset},${node.com.y + offset} L${
                              node.com.x + mfac * (parseFloat (vxSlider.value))
                              + offset},${node.com.y + -mfac * vyVal + offset}`);
}

const editPosButton = document.getElementById("but_edit_pos");
let editingPos = false;

/**
 * Hides the popup and resets it for the next selection
 * @param {KeyboardEvent} e An HTML keyboard event. Triggers the function if the escape key is pressed.
 */
function hidePopup (e)
{
    if (e == undefined || e.key == "Escape") {
        popup.style.visibility = "hidden";

        if (curElem != null) {
            curElem.classList.remove("selected");
            curElem = null;

            editingPos                = false;
            popupMove.style.display   = "none";
            popupNormal.style.display = "flex";
            editPosButton.innerText   = "Edit Position";
        }
    }
}

/** Deletes a body. */
function deleteBody ()
{
    const id     = parseInt (curElem.id.slice(4));
    qt.nodes[id] = undefined;

    popup.style.visibility = "hidden";

    curElem.classList.remove("selected");
    curElem.remove();
    curElem = null;

    document.getElementById("arrow_line" + id).remove();
    document.getElementById("arrow_head" + id).remove();
    document.getElementById("path" + id).remove();
}

const dragHitbox  = document.getElementById("drag_hitbox");
const popupNormal = document.getElementById("popup_normal");
const popupMove   = document.getElementById("popup_move");

// Activates add body mode and changes the popup
editPosButton.onclick = () => {
    if (editingPos) {
        editingPos = false;
        dragHitbox.style.pointerEvents = "none";
        popupMove.style.display = "none";
        popupNormal.style.display = "flex";
        editPosButton.innerText = "Edit Position";
    } else {
        editingPos = true;
        dragHitbox.style.pointerEvents = "auto";
        popupMove.style.display = "flex";
        popupNormal.style.display = "none";
        editPosButton.innerText = "Finish";
    }
}

let draggingBody = false;

/** Starts the body drag gesture. */
function bodyStartDrag ()
{
    if (popup.style.visibility == "visible" && editingPos) {
        draggingBody               = true;
        document.body.style.cursor = "grabbing";
    }
}

/** Ends the body drag gesture. */
function bodyEndDrag (elem)
{
    if (!editingPos) {
        togglePopup (elem);
    } else {
        draggingBody               = false;
        document.body.style.cursor = "grab";
    }
}

/**
 * Updates the position of the selected body when it is being moved.
 * @param {PointerEvent} e An HTML pointer event to track the position of the mouse.
 */
function bodyDrag (e)
{
    if (draggingBody) {
        const id           = parseInt (curElem.id.slice(4));
        const offset       = Math.cbrt(qt.nodes[id].totalMass) * 5;
        const x            = e.pageX - offset;
        const y            = e.pageY - offset;
        qt.nodes[id].com.x = x;
        qt.nodes[id].com.y = y;
        curElem.style.left = x + "px";
        curElem.style.top  = y + "px";
    }
}

dragHitbox.addEventListener("mousemove", bodyDrag);

/** Changes the cursor to grab when hovering over a body in move body mode. */
function bodyOnHover ()
{
    if (!draggingBody && editingPos)
        document.body.style.cursor = "grab";
}

/** Restores the cursor to normal when not hovering over a body in move body mode. */
function bodyLeaveHover ()
{
    if (!draggingBody && editingPos)
        document.body.style.cursor = "default";
}

/** Toggles the display of a popup and updates the selected element accordingly. */
function togglePopup (elem)
{
    if (popup.style.visibility == "hidden") {
        showPopup (elem);
    } else if (curElem != null && elem.id == curElem.id) {
        hidePopup ();
    } else {
        curElem.classList.remove("selected");
        showPopup (elem);
    }
}

/**
 * Updates the velocity vector when updating it graphically.
 * @param {PointerEvent} e An HTML ponter event to track the position of the mouse.
 */
function mouseDrag (e)
{
    if (draggingArrow) {
        const id             = parseInt (curElem.id.slice(4));
        const node           = qt.nodes[id];
        const offset         = Math.cbrt(node.totalMass) * 5;
        const x              = node.com.x + offset;
        const y              = node.com.y + offset;
        const lim            = 5 * mfac;
        const vx             = Math.min(lim, Math.max(-lim, e.pageX - x));
        const vy             = Math.min(lim, Math.max(-lim, e.pageY - y));
        qt.nodes[id].force.x = vx * qt.nodes[id].totalMass / mfac;
        qt.nodes[id].force.y = vy * qt.nodes[id].totalMass / mfac;
        document.getElementById("arrow_line" + id).setAttribute("d", `M${x},${y} L${x + vx},${y + vy}`);
    }
}

const hitbox = document.getElementById("hitbox");

let draggingArrow = false;

hitbox.addEventListener("mousemove", mouseDrag);

// Starts the arrow dragging
hitbox.onmousedown = (e) => {
    if (popup.style.visibility == "visible" && document.getElementById("svg_arrows").style.display == "block") {
        draggingArrow = true;
        mouseDrag (e);
    }
};

hitbox.onmouseup = () => { draggingArrow = false; };

document.addEventListener("keydown", hidePopup);
