let VW = window.innerWidth;
let VH = window.innerHeight;

function _pxToViewport (p, vp) { return 100 * p / vp; }

let cnt = 0;

function _getBodyHTML (sz, x, y)
{
    return `
<div
  id="body${cnt}"
  class="body"
  style="
    width: ${sz}px;
    height: ${sz}px;
    left: ${_pxToViewport (x - sz / 2, VW)}vw;
    top: ${_pxToViewport (y - sz / 2, VH)}vh
  "
></div>
`
}

const sidebarStyle = window.getComputedStyle(document.getElementById("sidebar"));
let   XOFFSET      = parseFloat (sidebarStyle.getPropertyValue("width"));

const qt = new Quadtree ((XOFFSET + VW) / 2, VH / 2, Math.max(VW - XOFFSET, VH));

function addBody (e)
{
    const mass    = 20;
    let   curbody = qt.addBody(e.pageX, e.pageY, mass, "body" + cnt, qt.root);

    qt.calcForceV(curbody, qt.root, 0.5);

    document.body.insertAdjacentHTML("beforeend", _getBodyHTML (mass, e.pageX, e.pageY));

    console.log(qt);

    ++cnt;
}

function getBodyPos (id)
{
    const bodyStyle = document.getElementById(id).style;
    const halfWidth = bodyStyle.width / 2;

    return [ bodyStyle.left + halfWidth, bodyStyle.top + halfWidth ];
}

document.addEventListener("click", addBody);
