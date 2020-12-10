function SceneSubject(scene) {
	scene.add(new THREE.GridHelper(10, 10)); //(size, divisions)


	let Heff = new Heffective(scene);
	let spin = new Spin(scene, Heff);

	this.update = function(time) {
		//let newSourcePos = new THREE.Vector3(0, 0, 0);
		//let newTargetPos = new THREE.Vector3(Math.cos(time), 1, Math.sin(time));
		//direction = new THREE.Vector3().subVectors(newTargetPos, newSourcePos);
		

		if (time != 0){
			/*for(let arrow of arrows){
				hfield.x = 3.8*TESLA*Math.cos(time);
				hfield.y = 3.8*TESLA*(Math.sin(time)+Math.cos(time));
				hfield.z = 3.8*TESLA*Math.cos(time)+Math.sin(time);

				//arrow.setLength(3.8*Math.cos(time));
				//let newSourcePos = new THREE.Vector3(arrow.position.x-Math.cos(time), 1, arrow.position.y-Math.sin(time));
				//let newTargetPos = new THREE.Vector3(Math.cos(time), 1, Math.sin(time));
				//direction = new THREE.Vector3().subVectors(newTargetPos, newSourcePos);
				//arrow.setLength(hfield.clone().length()/TESLA/3.8);
				//arrow.position.copy(arrow.position.clone().multiplyScalar(-1));
				arrow.setDirection(hfield.clone().normalize());
			}*/

			//first.crossVectors(magnetization, hfield).multiplyScalar(-gamma*dt);
			spin.update(time);
		}

	}
}