let app = new PIXI.Application({
    width: 256,
    height: 256,
    antialias: true,
    transparent: false,
    resolution: 1    
});

document.body.appendChild(app.view);

app.renderer.autoResize = true;
app.renderer.resize(512, 512);