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

console.log = divConsole("log");

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
var totalIterations = 0;
var totalPlotSeconds = 0;
var totalPlots = 0;
var successedIterations = 0;
var startTime = 0;
var startTimePlot = 0;
var i = 0;
var yearSec = 365*24*3600;

startTime = performance.now();

worker1.onmessage = (e) => {
    if(typeof e.data.whatType != 'undefined' && e.data.whatType == "generatedData"){
            try{
                readyForPlot.push(e.data.data);
                successedIterations += 1;
            }
            catch(e){}
            ready = true;
            working = false;
    }

    if(ready && !initialized_PIXI){
        X = readyForPlot[0][0];
        Y = readyForPlot[0][1];
        rad = readyForPlot[0][2];
        t = readyForPlot[0][3]
        readyForPlot.shift();

        PIXI.loader.load(setup);
        initialized_PIXI = true;
        startTimePlot = performance.now();
    }
}

function setup(){
    obj1 = new Circle({x:X[0][0], y:Y[0][1], rad:rad[0], color:0xCCCC33});
    obj2 = new Circle({x:X[1][0], y:Y[1][1], rad:rad[1], color:0xFFBB23});
    obj3 = new Circle({x:X[2][0], y:Y[2][1], rad:rad[2], color:0xBBEE16});

    app.ticker.add(delta => gameLoop(delta))
}


function gameLoop(delta){
    $("#readyplot").text(`Ready for plotting: ${readyForPlot.length}/10`);
    if(readyForPlot.length == 20){
        $("#work").text("Working status: Inactive")
    } else {
        $("#work").text("Working status: Active")
    }
    

    if(!stopped){
        obj1.x = X[0][i];
        obj1.y = Y[0][i];
        obj2.x = X[1][i];
        obj2.y = Y[1][i];
        obj3.x = X[2][i];
        obj3.y = Y[2][i];
        if(typeof t[i] != "undefined") $("#yearsPassed").text(`Years Passed: ${(t[i]/yearSec).toFixed(2)}`);
        else $("#yearsPassed").text(`Years Passed: 0`);

        i+=1;
    }

    if(stopped){
        if(readyForPlot.length >= 1){
            X = readyForPlot[0][0];
            Y = readyForPlot[0][1];
            rad = readyForPlot[0][2];
            t = readyForPlot[0][3]
            
            totalIterations += X[0].length;
            passedSeconds = (performance.now() - startTime)/1000;
            $("#success").text(`Iteration/Success: ${totalIterations/successedIterations}`);
            $("#secondPerSuccess").text(`Second/Success: ${passedSeconds/successedIterations}`);            
            $("#secondPerPlot").text(`Second/Plot: ${totalPlotSeconds/totalPlots}`);

            obj1 = new Circle({x:X[0][0], y:Y[0][1], rad:rad[0], color:0xCCCC33});
            obj2 = new Circle({x:X[1][0], y:Y[1][1], rad:rad[1], color:0xFFBB23});
            obj3 = new Circle({x:X[2][0], y:Y[2][1], rad:rad[2], color:0xBBEE16});
            readyForPlot.shift();
            stopped = false;
            startTimePlot = performance.now();
        }
    }

    if(!working && readyForPlot.length < 10){
        working = true;
        worker1.postMessage("generateData");
    }

    if(i > X[0].length && stopped == false){
        i = 0;
        stopped = true;
        totalPlots += 1;
        totalPlotSeconds += (performance.now() - startTimePlot)/1000;
    }
}

document.body.prepend(app.view);
