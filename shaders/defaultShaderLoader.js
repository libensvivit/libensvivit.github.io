var container;
var camera, scene, renderer;
var uniforms, material, mesh;
var mouseX = 0, mouseY = 0,
lat = 0, lon = 0, phy = 0, theta = 0;

var startTime = Date.now();

renderer = new THREE.WebGLRenderer();
document.getElementById("container").appendChild(renderer.domElement);

camera = new THREE.Camera();
camera.position.z = 1;

scene = new THREE.Scene();
uniforms = {
    time: { type: "f", value: 1.0 },
    resolution: { type: "v2", value: new THREE.Vector2() }
};

material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertShader,
    fragmentShader: fragShader
});

mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(mesh);

uniforms.resolution.value.x = renderer.domElement.clientWidth;
uniforms.resolution.value.y = renderer.domElement.clientHeight;

function resizeCanvasToDisplaySize() {
    let canvas = renderer.domElement;
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        uniforms.resolution.value.x = width;
        uniforms.resolution.value.y = height;
    }
  }

function render() {
    var elapsedMilliseconds = Date.now() - startTime;
    var elapsedSeconds = elapsedMilliseconds / 1000.;
    uniforms.time.value = 60. * elapsedSeconds;
    renderer.render(scene, camera);
}

function animate() {
    resizeCanvasToDisplaySize();
    
    requestAnimationFrame(animate);
    render();
}

animate();