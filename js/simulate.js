let fps = 30;

let cnt = 0;

/**
 * @param {number} x The x-coordinate of the body.
 * @param {number} y The y-coordinate of the body.
 * @param {number} sz The size of the body.
 * @returns HTML of a body with size sz and its coordinates.
 */
function _getBodyHTML (sz, x, y)
{
    return `
<div
  id="body${cnt}"
  class="body"
  style="
    width: ${sz}px;
    height: ${sz}px;
    left: ${x - sz / 2}px;
    top: ${y - sz / 2}px;
  "
  onmousedown="bodyStartDrag();"
  onmouseup="bodyEndDrag(this);"
  onmouseover="bodyOnHover();"
  onmouseout="bodyLeaveHover();"
></div>
`
}

/**
 * Code of <marker> element for the arrow head inspired by Cagri Tacyildiz and
 * Bumhan Yu from https://stackoverflow.com/a/60714330.
 * @param {number} idx The index.
 * @returns HTML that goes inside an SVG element representing an arrow.
 */
function _getSVGArrowHTML (idx)
{
    const node   = qt.nodes[idx];
    const vx     = node.force.x / node.totalMass;
    const vy     = node.force.y / node.totalMass;
    const offset = Math.cbrt(node.totalMass) * 5;

    return `
<defs>
  <marker
    id="arrow_head${idx}"
    orient="auto"
    markerWidth="2"
    markerHeight="4"
    refX="0.1"
    refY="2"
  >
    <path d="M0,0 V4 L2,2 Z" fill="red" />
  </marker>
</defs>

<path
  id="arrow_line${idx}"
  marker-end="url(#arrow_head${idx})"
  stroke-width="4"
  fill="none"
  stroke="red"
  d="M${node.com.x + offset},${node.com.y + offset} L${
        node.com.x + mfac * vx + offset},${node.com.y + mfac * vy + offset}"
/>
`
}

/**
 * @param {number} idx The index.
 * @returns HTML that goes inside an SVG element representing an arrow.
 */
function _getSVGPathHTML (idx)
{
    const node   = qt.nodes[idx];
    const offset = Math.cbrt(node.totalMass) * 5;

    return `
<path
  id="path${idx}"
  stroke-width="4"
  fill="none"
  stroke="blue"
  d="M${node.com.x + offset},${node.com.y + offset}"
/>
`
}

/** The diameter of the node. d = cbrt(mass) and * 10 for visual purposes */
let nodesz = Math.cbrt(parseInt (massSlider.value)) * 10;

massSlider.oninput = function () {
    massSliderVal.innerText = this.value;
    nodesz                  = Math.cbrt(parseInt (this.value)) * 10;
};

/**
 * Adds a body to the display.
 */
hitbox.onclick = (e) => {
    if (popup.style.visibility == "hidden") {
        if (!qt.addBody(e.pageX - nodesz / 2, e.pageY - nodesz / 2,
                        parseInt (massSlider.value), new Vec (0, 0),
                        "body" + cnt))
            return;

        bodyContainer.insertAdjacentHTML(
            "beforeend", _getBodyHTML (nodesz, e.pageX, e.pageY));
        svgArrows.insertAdjacentHTML("beforeend", _getSVGArrowHTML (cnt));
        svgPaths.insertAdjacentHTML("beforeend", _getSVGPathHTML (cnt));

        console.log(qt);

        ++cnt;
    }
}

/** Runs the simulation and updates SVG graphics accordingly. */
function runSim ()
{
    svgArrows.innerHTML = "";

    qt.rebuild(parseFloat (thetaSlider.value), true);

    for (var node of qt.nodes) {
        if (node != undefined) {
            const bodyElem      = document.getElementById(node.id);
            bodyElem.style.left = node.com.x + "px";
            bodyElem.style.top  = node.com.y + "px";

            const id = parseInt (node.id.slice(4));
            svgArrows.insertAdjacentHTML("beforeend", _getSVGArrowHTML (id));

            const curpath = document.getElementById("path" + id);
            const pathstr = curpath.getAttribute("d");
            const offset  = Math.cbrt(node.totalMass) * 5;

            curpath.setAttribute(
                "d",
                pathstr + ` L${node.com.x + offset},${node.com.y + offset}`);
        }
    }
}


let running = false;
let iid = -1;

/** Toggles the run button. */
function toggleRun ()
{
    if (running) {
        clearInterval (iid);
        runButton.innerText = "Run";
        running             = false;

        hitbox.style.pointerEvents        = "auto";
        bodyContainer.style.pointerEvents = "auto";
    } else {
        iid                 = setInterval (runSim, 1000 / fps);
        runButton.innerText = "Stop";
        running             = true;

        hitbox.style.pointerEvents        = "none";
        bodyContainer.style.pointerEvents = "none";
    }
}

fpsSlider.oninput = function () {
    fpsSliderVal.innerText = this.value;
    fps                    = parseInt (this.value);

    if (running) {
        clearInterval (iid);
        iid = setInterval (runSim, 1000 / fps);
    }
};

/** Resets the simulation by clearing the display. */
function reset ()
{
    bodyContainer.innerHTML = "";
    svgArrows.innerHTML     = "";
    svgPaths.innerHTML      = "";

    qt = new Quadtree ((XOFFSET + VW) / 2, VH / 2, Math.max(VW - XOFFSET, VH));

    running = true;
    toggleRun ();
}

vecToggle.onchange = (e) => {
    svgArrows.style.display = e.currentTarget.checked ? "block" : "none";
};

pathToggle.onchange = (e) => {
    svgPaths.style.display = e.currentTarget.checked ? "block" : "none";
};
