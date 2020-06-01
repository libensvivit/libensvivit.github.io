window.onerror = function (msg, url, lineno) {
	'use strict';
	console.error(url + '(' + lineno + ')' + msg);
};

function createShader(str, type, gl) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw gl.getShaderInfoLog(shader);
	}
	return shader;
}
function createProgram(vstr, fstr, gl) {
	var program = gl.createProgram(),
		vshader = createShader(vstr, gl.VERTEX_SHADER, gl),
		fshader = createShader(fstr, gl.FRAGMENT_SHADER, gl);
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw gl.getProgramInfoLog(program);
	}
	return program;
}