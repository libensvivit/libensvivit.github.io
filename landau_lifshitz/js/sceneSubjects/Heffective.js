function Heffective(scene){
    let arrow, arrowDir, startPos;
    let arrowLength = 1.25;
    let headLength = 0.25;
    let headWidth = 0.125;
    let TESLA = 795774;

	let hfield = new THREE.Vector3(0, 3.8*TESLA, 0);

    this.arrows = [];
    for(let x = -2; x < 3; x++){
		for(let z = -2; z < 3; z++){
			if(x !==0 || z !== 0){
				arrowDir = new THREE.Vector3(0, 1, 0); arrowDir.normalize();
				startPos = new THREE.Vector3(x, -arrowLength/2, z);
				arrow = new THREE.ArrowHelper(arrowDir, startPos, arrowLength, 0x00ff11, headLength, headWidth);
				this.arrows.push(arrow); scene.add(arrow);
			}
		}
    }

    this.update = function(time){
        //
    }

    return hfield;
}