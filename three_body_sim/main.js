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

var obj1, obj2, obj3, X, Y, rad;
var waitingMessage = false;
var readyForPlot = [];
var ready = false;
var stopped = false;
var initialized_PIXI = false;
var working = true;
var worker1 = new Worker('webworker.js');
var i = 0;

worker1.onmessage = (e) => {
    if(typeof e.data.whatType != 'undefined' && e.data.whatType == "generatedData"){
            try{
                readyForPlot.push(e.data.data);
            }
            catch(e){}
            ready = true;
            working = false;
    }

    if(ready && !initialized_PIXI){
        X = readyForPlot[0][0];
        Y = readyForPlot[0][1];
        rad = readyForPlot[0][2];
        readyForPlot.shift();

        PIXI.loader.load(setup);
        initialized_PIXI = true;
    }
}

function setup(){

    obj1 = new Circle({x:X[0][0], y:Y[0][1], rad:rad[0], color:0xCCCC33});
    obj2 = new Circle({x:X[1][0], y:Y[1][1], rad:rad[1], color:0xFFBB23});
    obj3 = new Circle({x:X[2][0], y:Y[2][1], rad:rad[2], color:0xBBEE16});

    app.ticker.add(delta => gameLoop(delta))
}


function gameLoop(delta){
    $("#iter").text(`Ready for plotting: ${readyForPlot.length}`);

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
        if(readyForPlot.length >= 1){
            X = readyForPlot[0][0];
            Y = readyForPlot[0][1];
            rad = readyForPlot[0][2];
            
            obj1 = new Circle({x:X[0][0], y:Y[0][1], rad:rad[0], color:0xCCCC33});
            obj2 = new Circle({x:X[1][0], y:Y[1][1], rad:rad[1], color:0xFFBB23});
            obj3 = new Circle({x:X[2][0], y:Y[2][1], rad:rad[2], color:0xBBEE16});
            readyForPlot.shift();
            stopped = false
        }
    }

    if(!working && readyForPlot.length < 5){
        working = true;
        worker1.postMessage("generateData");
    }

    if(i > X[0].length && stopped == false){
        console.log("Simulation ended.");
        i = 0;
        stopped = true;
    }
}

document.body.prepend(app.view);
