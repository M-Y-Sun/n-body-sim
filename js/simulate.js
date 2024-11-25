const FPS = 60;
// const FPS = 5;

let VW = window.innerWidth;
let VH = window.innerHeight;

let cnt = 0;

const sidebarStyle = window.getComputedStyle(document.getElementById("sidebar"));
let   XOFFSET      = parseFloat (sidebarStyle.getPropertyValue("width"));

const bodyContainer = document.getElementById("body_container");
const svgContainer  = document.getElementById("svg_container");

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
  onclick="togglePopup(this);"
></div>
`
}

/**
 * SVG code from https://stackoverflow.com/a/60714330.
 * @param {number} idx The index.
 * @returns HTML of an svg with id idx.
 */
function _getSVGHTML (idx)
{
    const node = qt.nodes[idx];

    return `
<svg height="100%" width="100%">
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
    d="M${node.com.x},${node.com.y} L${node.com.x + node.force.x},${node.com.y + node.force.y}"
  />
</svg>
`
}

let mass = parseInt (massSlider.value);

massSlider.oninput = function () {
    massSliderVal.innerText = this.value;
    mass                    = parseInt (this.value);
};

function addBody (e)
{
    hidePopup ();

    if (!qt.addBody(e.pageX - mass / 2, e.pageY - mass / 2, mass, new Vec (0, 0), "body" + cnt))
        return;

    bodyContainer.insertAdjacentHTML("beforeend", _getBodyHTML (mass, e.pageX, e.pageY));
    svgContainer.insertAdjacentHTML("beforeend", _getSVGHTML (cnt++));

    console.log(qt);
}

function runSim ()
{
    qt.rebuild(parseFloat (thetaSlider.value));

    for (var node of qt.nodes) {
        if (node != undefined) {
            const bodyElem      = document.getElementById(node.id);
            bodyElem.style.left = node.com.x + "px";
            bodyElem.style.top  = node.com.y + "px";

            // console.log("center of mass:")
            // console.log(node.com);
        }
    }
}

const runButton = document.getElementById("but_run");
let   running   = false;
let   iid       = -1;

function toggleRun ()
{
    if (running) {
        clearInterval (iid);

        svgContainer.innerHTML = "";

        for (var node of qt.nodes)
            if (node != undefined)
                svgContainer.insertAdjacentHTML("beforeend", _getSVGHTML (parseInt (node.id.slice(4))));

        svgContainer.style.display = "block";
        runButton.innerText        = "Run";
        running                    = false;
    } else {
        iid                        = setInterval (runSim, 1000 / FPS);
        svgContainer.style.display = "none";
        runButton.innerText        = "Stop";
        running                    = true;
    }
}

function reset ()
{
    bodyContainer.innerHTML = "";
    running                 = true;
    qt                      = new Quadtree ((XOFFSET + VW) / 2, VH / 2, Math.max(VW - XOFFSET, VH));
    toggleRun ();
}

document.getElementById("hitbox").addEventListener("click", addBody);
