let app = new PIXI.Application({
    width: window.innerWidth, height: window.innerHeight,
    antialias: true,
    backgroundColor: 0xdddddd,
    autoResize: true
});


$(document).ready(function() {
    $("body").prepend(app.view);
    app.renderer.view.style.position = "absolute";
    app.renderer.view.style.display = "block";
    app.renderer.autoResize = true;
    app.renderer.resize(window.innerWidth, window.innerHeight);
    PIXI.loader.load(setup);
});
var i = 0;
function setup(){
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(dt){

    
}
