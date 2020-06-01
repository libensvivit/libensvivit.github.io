mathbox = mathBox({
    plugins: ['core', 'controls', 'cursor', 'stats'],
    controls: {
      klass: THREE.OrbitControls
    },
});

three = mathbox.three;
three.camera.position.set(0, 0, 3);
three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);

view = mathbox.cartesian({
    range: [[-1, 1], [-1, 1], [-1, 1]],
    scale: [1, 1, 1],
}).axis({
    width: 5,
    start: true,
    end: true,
}).grid({});

view.interval({
    width: 128,
    expr: function(emit, x, i, t){
        var theta = x + t;
        var a = Math.cos(theta);
        var b = Math.sin(theta);

        emit(x, a, b);
    },
    items: 1,
    channels: 3,
}).line({
    color: 0x3090FF,
    width: 10,
    size: 2.5,
    start: true,
    end: true,
});