// sliders
const thetaSlider   = document.getElementById("slider_theta");
const massSlider    = document.getElementById("slider_mass");
const curmassSlider = document.getElementById("slider_curmass");
const vxSlider      = document.getElementById("slider_vx");
const vySlider      = document.getElementById("slider_vy");

// slider values
const curmassSliderVal = document.getElementById("slider_curmass_val");
const vxSliderVal      = document.getElementById("slider_vx_val");
const vySliderVal      = document.getElementById("slider_vy_val");
const thetaSliderVal   = document.getElementById("slider_theta_val");
const massSliderVal    = document.getElementById("slider_mass_val");

const popup         = document.getElementById("popup");
const svgArrows     = document.getElementById("svg_arrows");
const editPosButton = document.getElementById("but_edit_pos");

const dragHitbox  = document.getElementById("drag_hitbox");
const popupNormal = document.getElementById("popup_normal");
const popupMove   = document.getElementById("popup_move");

const hitbox = document.getElementById("hitbox");

const bodyContainer = document.getElementById("body_container");
const svgPaths      = document.getElementById("svg_paths");
const runButton     = document.getElementById("but_run");

const vecToggle  = document.getElementById("toggle_vec");
const pathToggle = document.getElementById("toggle_path");

let VW = window.innerWidth;
let VH = window.innerHeight;

const sidebarStyle
    = window.getComputedStyle(document.getElementById("sidebar"));
let XOFFSET = parseFloat (sidebarStyle.getPropertyValue("width"));

let qt = new Quadtree ((XOFFSET + VW) / 2, VH / 2, Math.max(VW - XOFFSET, VH));
