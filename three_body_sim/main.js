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

function setCookie(cname, cvalue){
    document.cookie = cname + "=" + cvalue + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

var canvasHeight = window.innerHeight*0.75;
var canvasWidth = canvasHeight;

let app = new PIXI.Application({
    width: canvasWidth,
    height: canvasHeight,
    antialias: true,
    backgroundColor: 0xdddddd
});

//console.log = divConsole("log");

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

var obj1, obj2, obj3, X, Y, rad, t;
var waitingMessage = false;
var readyForPlot = [];
var ready = false;
var stopped = false;
var initialized_PIXI = false;
var totalIterations = 0;
var totalPlotSeconds = 0;
var totalPlots = 0;
var successedIterations = 0;
var startTime = 0;
var startTimePlot = 0;
var waitingDataLimit = 10;
var i = 0;
var yearSec = 365*24*3600;
var working = true;
var objects = [];
var com = {
    "flag": "init",
    "width": canvasWidth, "height": canvasHeight,
    "minTime": 15, "maxTime": 70,
    "maxSep": 120, "numSteps": 1500
}
var DEFAULT = com;

var worker1 = new Worker('webworker.js');
if(getCookie("minTime") == null || getCookie("minTime") == "NaN"){
    $("#minTime").val(DEFAULT.minTime);
    $("#maxTime").val(DEFAULT.maxTime);
    $("#maxSep").val(DEFAULT.maxSep);
    $("#numSteps").val(DEFAULT.numSteps);
} else{
    $("#minTime").val(getCookie("minTime"));
    $("#maxTime").val(getCookie("maxTime"));
    $("#maxSep").val(getCookie("maxSep"));
    $("#numSteps").val(getCookie("numSteps"));
}

worker1.postMessage(com);

startTime = performance.now();

worker1.onmessage = (e) => {
    if (e.data == "active") {
        $("#work").text("Running..");
    }

    if(typeof e.data.flag != 'undefined' && e.data.flag == "generatedData"){
            try{
                readyForPlot.push(e.data.data);
                successedIterations += 1;
                if(readyForPlot.length == waitingDataLimit){
                    $("#work").text("Stopped.");
                }
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

function reset(){
    readyForPlot = [];
    totalIterations = 0;
    totalPlotSeconds = 0;
    totalPlots = 0;
    successedIterations = 0;
    startTime = 0;
    startTimePlot = 0;
    waitingDataLimit = 10;
    i = 0;
}

function gameLoop(delta){
    $("#readyplot").text(`Ready for plotting: ${readyForPlot.length}/${waitingDataLimit}`);

    if(!stopped){
        obj1.x = X[0][i];
        obj1.y = Y[0][i];
        obj2.x = X[1][i];
        obj2.y = Y[1][i];
        obj3.x = X[2][i];
        obj3.y = Y[2][i];
        if(typeof t[i] != "undefined") $("#yearsPassed").text(`${(t[i]/yearSec).toFixed(2)}`);
        else $("#yearsPassed").text(`0`);

        i+=1;
    }

    if(stopped){
        if(readyForPlot.length >= 1){
            X = readyForPlot[0][0];
            Y = readyForPlot[0][1];
            rad = readyForPlot[0][2];
            t = readyForPlot[0][3];
            
            totalIterations += X[0].length;
            let passedSeconds = (performance.now() - startTime)/1000;
            $("#IterationPerSecond").text(`Iteration/Second: ${(totalIterations/passedSeconds).toFixed(4)}`)
            $("#success").text(`Iteration/Success: ${(totalIterations/successedIterations).toFixed(4)}`);
            $("#secondPerSuccess").text(`Second/Success: ${(passedSeconds/successedIterations).toFixed(4)}`);            
            $("#secondPerPlot").text(`Second/Plot: ${(totalPlotSeconds/totalPlots).toFixed(4)}`);

            readyForPlot.shift();
            stopped = false;
            startTimePlot = performance.now();
        }
    }
    
    if(!working && readyForPlot.length < waitingDataLimit){
        working = true;
        
        setCookie("minTime", parseInt($("#minTime").val()));
        setCookie("maxTime", parseInt($("#maxTime").val()));
        setCookie("maxSep", parseInt($("#maxSep").val()));
        setCookie("numSteps", parseInt($("#numSteps").val()));
        
        com = {
            "flag": "config",
            "width": canvasWidth, "height": canvasHeight,
            "minTime": parseInt($("#minTime").val()), "maxTime": parseInt($("#maxTime").val()),
            "maxSep": parseInt($("#maxSep").val()), "numSteps": parseInt($("#numSteps").val())
        }
        
        $("#work").text("Running..");
        
        if(com.flag != DEFAULT.flag || com.minTime != DEFAULT.minTime ||
           com.maxTime != DEFAULT.maxTime || com.maxSep != DEFAULT.maxSep ||
           com.numSteps != DEFAULT.numSteps) "";//reset();

        worker1.postMessage(com);
    }

    if(i > X[0].length && stopped == false){
        i = 0;
        stopped = true;
        totalPlots += 1;
        totalPlotSeconds += (performance.now() - startTimePlot)/1000;
    }
}

document.body.prepend(app.view);
