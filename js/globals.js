// sliders
const thetaSlider   = document.getElementById("slider_theta");
const massSlider    = document.getElementById("slider_mass");
const curmassSlider = document.getElementById("slider_curmass");
const gSlider       = document.getElementById("slider_G");
const fpsSlider     = document.getElementById("slider_fps");
const vxSlider      = document.getElementById("slider_vx");
const vySlider      = document.getElementById("slider_vy");

// slider values
const thetaSliderVal   = document.getElementById("slider_theta_val");
const massSliderVal    = document.getElementById("slider_mass_val");
const curmassSliderVal = document.getElementById("slider_curmass_val");
const gSliderVal       = document.getElementById("slider_G_val");
const fpsSliderVal     = document.getElementById("slider_fps_val");
const vxSliderVal      = document.getElementById("slider_vx_val");
const vySliderVal      = document.getElementById("slider_vy_val");

const runButton = document.getElementById("but_run");

const popup       = document.getElementById("popup");
const popupNormal = document.getElementById("popup_normal");
const popupMove   = document.getElementById("popup_move");

const editPosButton = document.getElementById("but_edit_pos");

const svgArrows = document.getElementById("svg_arrows");
const svgPaths  = document.getElementById("svg_paths");

const bodyContainer = document.getElementById("body_container");
const hitbox        = document.getElementById("hitbox");
const dragHitbox    = document.getElementById("drag_hitbox");

const vecToggle  = document.getElementById("toggle_vec");
const pathToggle = document.getElementById("toggle_path");

let VW = window.innerWidth;
let VH = window.innerHeight;

const sidebarStyle
    = window.getComputedStyle(document.getElementById("sidebar"));

let XOFFSET = parseFloat (sidebarStyle.getPropertyValue("width"));

let qt = new Quadtree ((XOFFSET + VW) / 2, VH / 2, Math.max(VW - XOFFSET, VH));
