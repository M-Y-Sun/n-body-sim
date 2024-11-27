const FPS           = 60;
const samplesPerSec = 10;

let VW = window.innerWidth;
let VH = window.innerHeight;

let cnt = 0;

const sidebarStyle = window.getComputedStyle(document.getElementById("sidebar"));
let   XOFFSET      = parseFloat (sidebarStyle.getPropertyValue("width"));

const bodyContainer = document.getElementById("body_container");
const svgArrows     = document.getElementById("svg_arrows");
const svgPaths      = document.getElementById("svg_paths");

let qt = new Quadtree ((XOFFSET + VW) / 2, VH / 2, Math.max(VW - XOFFSET, VH));

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
  onmousemove="bodyDrag(event);"
  onmouseup="bodyEndDrag(this);"
  onmouseover="bodyOnHover();"
  onmouseout="bodyLeaveHover();"
></div>
`
}

/**
 * Code of <defs> element is from https://stackoverflow.com/a/60714330 (arrow head).
 * @param {number} idx The index.
 * @returns HTML that goes inside an SVG element representing an arrow.
 */
function _getSVGArrowHTML (idx)
{
    const node   = qt.nodes[idx];
    const vx     = node.force.x / node.totalMass;
    const vy     = node.force.y / node.totalMass;
    const offset = Math.cbrt(node.totalMass) * 5; // width / 2

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
  d="M${node.com.x + offset},${node.com.y + offset} L${node.com.x + mfac * vx + offset},${
        node.com.y + mfac * vy + offset}"
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

let nodesz = Math.cbrt(parseInt (massSlider.value)) * 10;

massSlider.oninput = function () {
    massSliderVal.innerText = this.value;
    nodesz                  = Math.cbrt(parseInt (this.value)) * 10;
};

function addBody (e)
{
    if (popup.style.visibility == "hidden") {
        if (!qt.addBody(e.pageX - nodesz / 2, e.pageY - nodesz / 2, parseInt (massSlider.value), new Vec (0, 0),
                        "body" + cnt))
            return;

        bodyContainer.insertAdjacentHTML("beforeend", _getBodyHTML (nodesz, e.pageX, e.pageY));
        svgArrows.insertAdjacentHTML("beforeend", _getSVGArrowHTML (cnt));
        svgPaths.insertAdjacentHTML("beforeend", _getSVGPathHTML (cnt));

        console.log(qt);

        ++cnt;
    } else if (svgArrows.style.display == "none") {
        hidePopup ();
    }
}

let frame = 0;

function runSim ()
{
    svgArrows.innerHTML = "";

    qt.rebuild(parseFloat (thetaSlider.value));

    for (var node of qt.nodes) {
        if (node != undefined) {
            const bodyElem      = document.getElementById(node.id);
            bodyElem.style.left = node.com.x + "px";
            bodyElem.style.top  = node.com.y + "px";

            const id = parseInt (node.id.slice(4));
            svgArrows.insertAdjacentHTML("beforeend", _getSVGArrowHTML (id));

            if (frame % (FPS / samplesPerSec) == 0) {
                const curpath = document.getElementById("path" + id);
                const pathstr = curpath.getAttribute("d");
                const offset  = Math.cbrt(node.totalMass) * 5;
                curpath.setAttribute("d", pathstr + ` L${node.com.x + offset},${node.com.y + offset}`);
            }
        }
    }

    frame = (frame + 1) % 256;
}

const runButton = document.getElementById("but_run");
let   running   = false;
let   iid       = -1;

function toggleRun ()
{
    if (running) {
        clearInterval (iid);
        runButton.innerText = "Run";
        running             = false;

        hitbox.style.pointerEvents        = "auto";
        bodyContainer.style.pointerEvents = "auto";
    } else {
        iid                 = setInterval (runSim, 1000 / FPS);
        runButton.innerText = "Stop";
        running             = true;

        hitbox.style.pointerEvents        = "none";
        bodyContainer.style.pointerEvents = "none";
    }
}

function reset ()
{
    bodyContainer.innerHTML = "";
    svgArrows.innerHTML     = "";
    svgPaths.innerHTML      = "";

    qt = new Quadtree ((XOFFSET + VW) / 2, VH / 2, Math.max(VW - XOFFSET, VH));

    running = true;
    toggleRun ();
}

hitbox.addEventListener("click", addBody);
document.getElementById("toggle_vec")
    .addEventListener("change", (e) => { svgArrows.style.display = e.currentTarget.checked ? "block" : "none"; })
document.getElementById("toggle_path")
    .addEventListener("change", (e) => { svgPaths.style.display = e.currentTarget.checked ? "block" : "none"; })
