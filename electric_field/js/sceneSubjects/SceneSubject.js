class Charge{
	constructor(settings){
		this.direction = new THREE.Vector3();
		this.normal = new THREE.Vector3();
		this.forceVector = new THREE.Vector3();
		this.directions = [];
		this.result = new THREE.Vector3();

		this.cubeDim = settings.cubeDim;
		this.scene = settings.scene;
		this.arrows = settings.arrows;
		this.charges = settings.charges;
		this.radius = settings.radius;
		//this.charge = charge;
		this.velocity = [0, 0, 0];		
		
	}


	arrangeArrows(){
		this.arrows.forEach((arrow) => {
			this.directions = [];
			this.charges.forEach((charge, index) => {
				this.direction.subVectors(arrow.position, charge.position)
				this.normal.copy(this.direction).normalize();
				this.directions.push({
					dir: (charge.userData.charge == -1 ? this.normal.negate() : this.normal).clone(),
					force: 1 / Math.pow(this.forceVector.subVectors(arrow.position, charge.position).length(), 2)
				});
			});
			this.result.set(0, 0, 0);
			this.directions.forEach((dir) => {
				this.result.addScaledVector(dir.dir, dir.force);
			});
			arrow.setDirection(this.result.normalize());
		});
	}

	setCharge(val){
		var chargeGeom = new THREE.SphereGeometry(this.radius, 32, 32);
		var chargeMat = new THREE.MeshBasicMaterial({
		  color: val == 1 ? 0xff0000 : 0x0000ff
		});
		var charge = new THREE.Mesh(chargeGeom, chargeMat);
		charge.position.set(THREE.Math.randFloatSpread(this.cubeDim), THREE.Math.randFloatSpread(this.cubeDim), THREE.Math.randFloatSpread(this.cubeDim));
		charge.userData.charge = val;
		this.charges.push(charge);
		this.scene.add(charge);
		this.arrangeArrows();
	}

	returnMesh = () => {
		return this.mesh;
	}

	setVelocity = (velocity) => {
		this.velocity = velocity;
	}

	getVelocity = () => {
		return this.velocity;
	}
}

class ArrowField{
    constructor(settings){
		this.scene = settings.scene;
		this.arrows = settings.arrows;
		this.cubeDim = settings.cubeDim;

		var cubeGeom = new THREE.BoxGeometry(this.cubeDim, this.cubeDim, this.cubeDim);
		var wireframe = new THREE.EdgesGeometry(cubeGeom);
		var cubeWire = new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({
			depthText: false,
			opacity: 0.7,
			transparent: true,
			color: "yellow"
		}));
		this.scene.add(cubeWire);

		for(let x = 0; x < this.cubeDim + 1; x++){
			for(let y = 0; y < this.cubeDim + 1; y++){
				for(let z = 0; z < this.cubeDim + 1; z++){
					let dir = new THREE.Vector3(THREE.Math.randFloatSpread(2), THREE.Math.randFloatSpread(2), THREE.Math.randFloatSpread(2)).normalize();
					let origin = new THREE.Vector3(x - this.cubeDim/2, y - this.cubeDim/2, z - this.cubeDim/2);
					let arrow = new THREE.ArrowHelper(dir, origin, 0.8, 0x474747, 0.35);
					this.arrows.push(arrow);
					this.scene.add(arrow);
				}
			}
		}
	}

	getArrows(){
		return this.arrows;
	}
}

function SceneSubject(scene){
	var settings = {
		scene : scene,
		arrows : [],
		charges : [],
		cubeDim : 10,
		radius : 0.3
	};

	new ArrowField(settings);
	var charge = new Charge(settings);
	
	chargePositive.addEventListener("click", function(){
		charge.setCharge(1);
	});
	chargeNegative.addEventListener("click", function(){
		charge.setCharge(-1);
	});

	this.update = function(time) {

	}
}