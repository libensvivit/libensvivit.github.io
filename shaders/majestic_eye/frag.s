#define PI 3.14159265
uniform float time;
uniform vec2 resolution;

float hash( float n ){
	return fract(sin(n)*43758.5453);
}

float noise( in vec2 x ){
	vec2 p = floor(x);
	vec2 f = fract(x);

	f = f*f*(3.0-2.0*f);

	float n = p.x + p.y*57.0;

	return mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
			   mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y);
}

mat2 m = mat2(.8, .6, -.6, .8);

//fractional brownian motion
float fbm(vec2 p){
  float f = 0.;
  f += .5*noise(p); 	 p*= m*2.02;
  f += .25*noise(p); 	 p*= m*2.03;
  f += .125*noise(p);  p*= m*2.01;
  f += .0625*noise(p); p*= m*2.04;
  f /= .9375;
  return f;
}

void main()	{
	vec2 q = gl_FragCoord.xy/resolution.xy;
	vec2 p = -1. + 2.*q;
	p.x *= resolution.x/resolution.y;
	float iTime = time*.02;

	float background = 1.;

	float r = length(p);
	float a = atan(p.y, p.x);
	float f = fbm(8.*p);
	float ss = .5+.5*sin(1.*iTime);
	float anim = 1. + .15*ss*clamp(1.-r, 0., 1.);

	vec3 col = vec3(1.);
	 vec2 refpos = vec2(-.08+.02*cos(iTime-r*5.), -.07+.015*sin(iTime-r*5.));

	r *= anim;

	//refpos = vec2(-.08+.02*cos(-iTime));

	r += .03*pow(.5+.5*cos(iTime - a), 2.);

	if(r<.8){
		col = vec3(.05*sin(iTime), .8+.05*cos(iTime), .95+.05*sin(iTime));
		
		// iris color
		col = mix(col, vec3(.4, .2, .4), f);
		
		// around middle (pinkish)
		f = 1. - smoothstep(.2, .65+.05*cos(iTime+a), r);
		col = mix(col, vec3(1., .25+0.1*(0.5+.5*cos(iTime)), .5), f*(1.2+.15*sin(iTime)));
		
		a += .1*fbm(p+.6*iTime);
		
		// emerging white noise
		f = smoothstep(.4, 1., fbm(vec2(6.*r, 8.*a)));
		col = mix(col, vec3(1., .9, .9), f);
		
		// black from the edges
		f = smoothstep(.5, .7, r);
		col *= 1. - .2*f;
		
		// pupil
		f = smoothstep(.22, .26, r);
		col *= f;
		
		// pupil reflection
		f = 1. - smoothstep(0.02, .1, length(p + refpos));
		col += mix(vec3(1., .5, 1.), vec3(1.), .8)*f*1.;
		
		// light (purple)
		f = 1. - smoothstep(0., .4, length(p - vec2(.5+.08*cos(iTime), .35*sin(iTime))));
		col += vec3(1., .25, 1.)*f*.4;
		
		// light (yellow)
		f = 1. - smoothstep(0., .4, length(p - vec2(.2*cos(iTime*.8)-.4, .3+.4*cos(iTime*.6)*sin(iTime*.6))));
		col += vec3(1., .8, .5)*f*.3;
		
		// soft edges
		f = smoothstep(.73, .8, r);
		col = mix(col, vec3(1.), f);
		
	}

	gl_FragColor = vec4(col*background,1.0);
}