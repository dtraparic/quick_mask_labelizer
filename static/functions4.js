// Tentatives pour main4
// un canvas d'image puis un canvas_tmp qui s'applique dessus a chaque frame: Faudrait plutot un canvas_tmp par trait de souris levée (down+up)
// Un canvas avec background:url(imgpath) + les traits sur le contexte du canvas = impossible de mettre juste les traits en transparence
// On essaie un tag img+canvas forcément, c'est la seule solution
// Je devrais garder tout pareil, mais plutôt utiliser un canvas Fabric, ca a l'air vraiment dingue

function init(relative_path){
    let img_tag = document.querySelector('img');
    let centered_container = document.querySelector('.centered_container');
    let canvas = document.querySelector('#canvas_editor');
    let ctx = canvas.getContext("2d");
    let canvas_mask = document.querySelector('.canvas_mask');
    let ctx_mask = canvas_mask.getContext("2d");


    let pilImg = new Image();
    console.log("On cherche l'img dans : ", relative_path)

    pilImg.src = relative_path
    console.log("Border :", pilImg.width, pilImg.height)

    pilImg.onload = function(){
        canvas.width = pilImg.width;
        canvas.height = pilImg.height;
        canvas_mask.width = pilImg.width;
        canvas_mask.height = pilImg.height;
        ctx_mask.fillStyle = "black";
        ctx_mask.fillRect(0, 0, canvas_mask.width, canvas_mask.height);
        console.log("mask canvas filled")

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
let mask_grabcut;
let canvas_mask = document.querySelector('.canvas_mask');
let ctx_mask = canvas_mask.getContext("2d");
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
document.addEventListener('mouseup', sendLinesServer);
document.addEventListener('keyup', foo);

function sendLinesServer(e){
    canvas_data = ctx.getImageData(0,0,canvas.width, canvas.height)

    console.log("canvas : ", canvas_data)
    data_URL_png = canvas.toDataURL("image/png")
    console.log("jsonified canvas :", data_URL_png)
    test_dict = {salut: true, coucou: false}

    fetch('raw_cut_hints', {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: 'POST',
      body: JSON.stringify(data_URL_png)
    }).then(response => response.json())
    .then(data =>{
        console.log(data)
        console.log(typeof(data))
        let canvas_mask = document.querySelector('.canvas_mask');
        console.log("allez la le canvas", canvas_mask)
        console.log("allez la2 le canvas", canvas_mask.width, canvas_mask.height)
        let data2 = Uint8ClampedArray.from(data)
        console.log("allez la data", data.length, data2.length)
        let imgData = new ImageData(data2, canvas_mask.width, canvas_mask.height)

        ctx_mask.putImageData(imgData, 0, 0);
    })

}

function foo(e){
    if (e.code=='Space' || e.key==' '){
        truc = ctx.getImageData(0,0,canvas.width, canvas.height)
        console.log(truc)
    }
}

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
            color = "rgb(255,255,255)"
            break;
        case 2:
            color = "rgb(0,0,0)"
            break;
        default:
            break;
    }
    console.log("salutcc")

//    can2 = document.createElement('canvas')
//    can2.width = canvas.width;
//    can2.height = canvas.height;

//    ctx2 = can2.getContext('2d')

    ctx.beginPath(); // begin

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
//    ctx.globalCompositeOperation = 'destination-atop';

    ctx.moveTo(pos.x, pos.y); // from
    setPosition(e);
    ctx.lineTo(pos.x, pos.y); // to
    ctx.stroke(); // draw it!

//    ctx.drawImage(can2, 0, 0)

}