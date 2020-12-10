function Spin(scene, Heff){
    let arrow, arrowDir, arrowOrigin, startPos;
    let arrowLength = 1.25;
    let headLength = 0.25;
    let headWidth = 0.125;
	let sphereRadius = 0.4;
	let magnetization = new THREE.Vector3(1, 1, 0);


    // SPHERES
	let spheres = [];
	geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
	material = new THREE.MeshStandardMaterial();
	sphere = new THREE.Mesh(geometry, material);
	sphere.position.set(0, 0, 0);
	spheres.push(sphere);

	// MAGNETIZATION ARROWS
	this.arrows = [];
    arrowDir = new THREE.Vector3(5, 3, 0); arrowDir.normalize();
	arrowOrigin = new THREE.Vector3(0, 0, 0);
	arrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, arrowLength, 0x0055ff, headLength, headWidth);
	this.arrows.push(arrow);

	// ADD SUBJECTS TO SCENE
	for(let sphere of spheres) scene.add(sphere);
	for(let arrow of this.arrows) scene.add(arrow);

	this.update = function(time){
		let new_mag = new THREE.Vector3(0, 0, 0);
		let first = new THREE.Vector3(0, 0, 0);
		let second = new THREE.Vector3(0, 0, 0);
		let gamma = 2;
		let alpha = 0.4;
		let Ms = 1e6;
		let dt = 1e-8;
		let c = gamma/(1+alpha**2);

		new_mag.copy(magnetization);
		first.crossVectors(magnetization.clone(), Heff).multiplyScalar(-c*dt);
		second.crossVectors(magnetization.clone(), magnetization.clone().cross(Heff)).multiplyScalar(-c*alpha*dt);

		new_mag.add(first);
		new_mag.add(second);

		arrow.setDirection(new_mag.normalize());
		magnetization.copy(new_mag);
	}
}