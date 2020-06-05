var width = 1024;
var height = 768;
var gridPoints = [];
var tx = Math.PI / 9;
var ty = Math.PI / 4;
var xFreq = 1.0;
var yFreq = 1.0;
var xFreqDir = 1.0;
var yFreqDir = 1.0;
var cols = Math.ceil(width / 100);
var cellWidth = Math.ceil(width / cols);

// Col Points
for(var i = 0; i < cols-1; i++) {
    var x = i*cellWidth + cellWidth;
    for(var j = 0; j < height; j++) {
        gridPoints.push({x: x, y: j});
    }
}

let app = new PIXI.Application({
    width: width,
    height: height,
    antialias: true,
    transparent: false,
    autoDensity: true,
    backgroundColor: 0xEEEEEE
});

document.body.appendChild(app.view);
app.ticker.add(delta => gameLoop(delta));

var graphics = new PIXI.Graphics();

var drawPoint = function(x, y){
    graphics.beginFill(0x00FF00);
    graphics.drawRect(x, y, 1, 1);
}

function Flyer(x, y, radius, color){
    this.x = x;
    this.y = y;
    this.radius = radius;

    let circle = new PIXI.Graphics();

    circle.beginFill(color)
    circle.drawCircle(0, 0, radius);
    circle.endFill();

    circle.x = this.x;
    circle.y = this.y;

    return circle;
}

function Wheat(x, h){
    for(let i = 0; i < h; i++){
        let y = height - i;
        drawPoint(x + 10*Math.sin((y)/20 + tx), y);
    }
}


function gameLoop(dt){
    graphics.clear();
    for(let j = -10; j < 10; j++){
        for(let i = -3; i < 3; i++){ // pixel width = 6
            Wheat(256 + i + 10*j, height - 256);
        }
    }
    tx += 0.1;
}

let c1 = new Flyer(256, 256, 64, 0xFF00FF);
let c2 = new Flyer(768, 256, 64, 0x00FFFF);

app.stage.addChild(graphics);
app.stage.addChild(c1);
app.stage.addChild(c2);
