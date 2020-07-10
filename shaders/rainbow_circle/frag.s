#define PI 3.14159265
uniform float time;
uniform vec2 resolution;

vec3 circle(vec2 uv, float rad, float i){
	float d  = length(uv);
	float a  = atan(uv.y, uv.x);
	float t = time*.018;
	vec3 c = vec3(1.);
	vec3 colmult;

	if(i == 0.) colmult = vec3(1., 0., 0.);
	if(i == 1.) colmult = vec3(0., 1., 0.);
	if(i == 2.) colmult = vec3(0., 0., 1.);

	rad += 0.05*cos(5.*a - i*PI/2. + 3.*t)*pow(.5+.5*cos(t - a), 6.);
	c -= 1.-smoothstep(rad, rad+0.01, d) + smoothstep(rad*.93, rad*.93+0.01, d);

	return c * colmult;
}

void main()	{
	vec2 uv = (gl_FragCoord.xy-.5*resolution.xy)/resolution.y;

	vec3 col = vec3(1.);
	float rad = 0.35;
		
	col += circle(uv, rad, 0.);
	col += circle(uv, rad, 1.);
	col += circle(uv, rad, 2.);

	gl_FragColor = vec4(col, 1.);
}