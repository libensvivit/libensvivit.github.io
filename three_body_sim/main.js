function divConsole(div){
    var logger = document.getElementById(div);
    return function(msg){
        if(typeof msg == 'object'){
            logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(msg) : msg) + '<br />';
        } else{
            logger.innerHTML += msg + '<br />'; 
        }
    }
}

let app = new PIXI.Application({
    width: 512,
    height: 512,
    antialias: true,
    backgroundColor: 0xdddddd
});

class Circle{
    constructor(param){
        self.circle = new PIXI.Graphics();
        self.circle.beginFill(param.color);
        self.circle.drawCircle(0, 0, param.rad);
        self.circle.endFill();
        self.circle.rad = param.rad;
        self.circle.x = param.x;
        self.circle.y = param.y;
        self.circle.vx = param.vx ? param.vx : 0;
        self.circle.vy = param.vy ? param.vy : 0;
        self.circle.ax = 0;
        self.circle.ay = 0;
        app.stage.addChild(self.circle);
        return self.circle;
    }
}

var obj1, obj2, obj3, X, Y;
var plottingAlready = false;
var readyForPlot = [];
var getReadyForPlot;

function setup(){
    getReadyForPlot = pyodide.globals.getReadyForPlot;
    [X, Y, rad] = getReadyForPlot();
    
    obj1 = new Circle({x:X[0][0], y:Y[0][1], rad:rad[0], color:0xCCCC33});
    obj2 = new Circle({x:X[1][0], y:Y[1][1], rad:rad[1], color:0xFFBB23});
    obj3 = new Circle({x:X[2][0], y:Y[2][1], rad:rad[2], color:0xBBEE16});

    app.ticker.add(delta => gameLoop(delta))
}

i = 0;
var stopped = false;

function gameLoop(delta){
    //console sync error?
    if(!stopped){
        obj1.x = X[0][i];
        obj1.y = Y[0][i];
        obj2.x = X[1][i];
        obj2.y = Y[1][i];
        obj3.x = X[2][i];
        obj3.y = Y[2][i];
        i+=1;
    }

    if(stopped){
        [X, Y, rad] = getReadyForPlot();
    
        obj1 = new Circle({x:X[0][0], y:Y[0][1], rad:rad[0], color:0xCCCC33});
        obj2 = new Circle({x:X[1][0], y:Y[1][1], rad:rad[1], color:0xFFBB23});
        obj3 = new Circle({x:X[2][0], y:Y[2][1], rad:rad[2], color:0xBBEE16});

        stopped = false
    }

    if(i > X[0].length && stopped == false){
        //console.log("Simulation ended.");
        i = 0;
        stopped = true;
    }
}

document.body.prepend(app.view);

//document.body.appendChild(app.view);