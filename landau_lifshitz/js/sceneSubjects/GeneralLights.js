function GeneralLights(scene) {
	const pointLight = new THREE.PointLight(0xff1122, 1, 100);
	const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);

	pointLight.position.set(0, 10, 10);
	pointLight.intensity = 2;
	scene.add(pointLight);

	scene.add(pointLightHelper);

	this.update = function(time) {

		//pointLight.intensity = (Math.sin(time)+1.5);
		//pointLight.color.setHSL( Math.sin(time), 0.5, 0.5 );
	}
}