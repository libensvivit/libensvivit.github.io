function SceneManager(canvas) {
    var clock = new THREE.Clock();
    
    var screenDimensions = {
        width: canvas.width,
        height: canvas.height
    }
    
    var scene = buildScene();
    var renderer = buildRender(screenDimensions);
    var camera = buildCamera(screenDimensions);
    var controls = buildControls();
    var sceneSubjects = createSceneSubjects(scene);
    var AxesHelper = new THREE.AxesHelper(50);
    scene.add(AxesHelper);

    function buildScene() {
        var scene = new THREE.Scene();
        scene.background = new THREE.Color("#fff");

        return scene;
    }

    function buildRender({ width, height }) {
        var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); 
        var DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
        renderer.setPixelRatio(DPR);
        renderer.setSize(width, height);

        renderer.gammaInput = true;
        renderer.gammaOutput = true; 

        return renderer;
    }

    function buildCamera({ width, height }) {
        var aspectRatio = width / height;
        var fieldOfView = 60;
        var nearPlane = 1;
        var farPlane = 500; 

        var camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
        camera.position.set(0, 0, 10);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        return camera;
    }

    function buildControls(){
        var controls = new THREE.OrbitControls(camera, renderer.domElement);
        return controls;
    }


    function createSceneSubjects(scene) {
        var sceneSubjects = [
            new GeneralLights(scene),
            new SceneSubject(scene)
        ];

        return sceneSubjects;
    }

    this.update = function() {
        var elapsedTime = clock.getElapsedTime();
        controls.update();
        
        for(let i=0; i<sceneSubjects.length; i++)
        	sceneSubjects[i].update(elapsedTime);

        renderer.render(scene, camera);
    }

    this.onWindowResize = function() {
        var { width, height } = canvas;

        screenDimensions.width = width;
        screenDimensions.height = height;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
    }
}