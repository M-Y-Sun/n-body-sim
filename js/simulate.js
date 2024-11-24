let VW = window.innerWidth;
let VH = window.innerHeight;

let cnt = 0;

const colors = [ "red", "blue" ];

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
    background-color: ${colors[cnt % 2]};
  "
></div>
`
}

const sidebarStyle = window.getComputedStyle(document.getElementById("sidebar"));
let   XOFFSET      = parseFloat (sidebarStyle.getPropertyValue("width"));

const hitbox = document.getElementById("hitbox");

const qt = new Quadtree ((XOFFSET + VW) / 2, VH / 2, Math.max(VW - XOFFSET, VH));

function addBody (e)
{
    const mass = 20;

    if (!qt.addBody(e.pageX - mass / 2, e.pageY - mass / 2, mass, "body" + cnt))
        return;

    hitbox.insertAdjacentHTML("beforeend", _getBodyHTML (mass, e.pageX, e.pageY));

    console.log(qt);

    ++cnt;
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
        runButton.innerText = "Run";
        running             = false;
    } else {
        iid                 = setInterval (runSim, 34);
        runButton.innerText = "Stop";
        running             = true;
    }
}

hitbox.addEventListener("click", addBody);
