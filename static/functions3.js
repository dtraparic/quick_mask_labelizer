function init(relative_path){
    let canvas = document.querySelector('#canvas_editor');
    let ctx = canvas.getContext("2d");

    let background = new Image();
    console.log("On cherche l'img dans : ", relative_path)

    background.src = relative_path
    console.log("Border :", background.width, background.height)

    background.onload = function(){
        canvas.width = background.width;
        canvas.height = background.height;
        console.log("Border2 :", background.width, background.height)
        ctx.drawImage(background, 0, 0);
    }
}
//mouseIsDown = false
//function draw(){
//    if(mouseIsDown){
//    }
//}
//function mouseDown(evt){
//    console.log("mousedown", evt);
//    if(!mouseIsDown){
//        mouseIsDown=true
//    }
//}
//function mouseUp(evt){
//    console.log("mouseup", evt);
//    if(mouseIsDown){
//        mouseIsDown=false
//    }
//}
//document.addEventListener("mousedown", mouseDown);
//document.addEventListener("mouseup", mouseUp);
//document.addEventListener("mousemove", draw);

// create canvas element and append it to document body
let canvas = document.querySelector('#canvas_editor');
// get canvas 2D context and set him correct size
let ctx = canvas.getContext('2d');

//// some hotfixes... ( ≖_≖)
//document.body.style.margin = 0;
//canvas.style.position = 'fixed';
// resize canvas
//function resize() {
//  ctx.canvas.width = window.innerWidth;
//  ctx.canvas.height = window.innerHeight;
//}


// last known position
let pos = { x: 0, y: 0 };

//window.addEventListener('resize', resize);
document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('mouseenter', setPosition);

// new position from mouse event
function setPosition(e) {
    let rect = canvas.getBoundingClientRect();
    pos.x = e.clientX - rect.left;
    pos.y = e.clientY - rect.top;

    // rect.top, rect.right, rect.bottom, rect.left);
}

function draw(e) {
    // mouse left button must be pressed
    if (e.buttons !== 1 && e.buttons !== 2) return;

    switch (e.buttons){
        case 1:
            color = "rgba(255,255,255,0.4)"
            break;
        case 2:
            color = "rgba(0,0,0,0.4)"
            break;
        default:
            break;
    }
    console.log("salut")

    can2 = document.createElement('canvas')
    can2.width = canvas.width;
    can2.height = canvas.height;

    let ctx2 = ctx
    ctx2 = can2.getContext('2d')

    ctx2.beginPath(); // begin

    ctx2.lineWidth = 5;
    ctx2.lineCap = 'round';
    ctx2.strokeStyle = color;
    ctx2.globalCompositeOperation = 'destination-atop';

    ctx2.moveTo(pos.x, pos.y); // from
    setPosition(e);
    ctx2.lineTo(pos.x, pos.y); // to
    ctx2.stroke(); // draw it!

    ctx.drawImage(can2, 0, 0)

}