varying vec3 n;
varying vec3 v;
varying vec2 vUv;

uniform vec3 lightDirection;
uniform vec3 lightColor;
uniform float kDiffuse;
uniform sampler2D groundtexture;

//float getShadowMapDepth(vec2 texcoord)
//{
//	vec4 v = texture2D(shadowMap,vUv);
//	cost vec4 bitShift = vec4(1.0,1.0/256.0,)

//}

void main() {

	//TODO: PART 1C
	vec3 ground_color = vec3(51.0/256.0,25.0/256.0,0);

	vec3 l =normalize(lightDirection);
	vec3 e = normalize(-v);
	vec3 h = normalize(l+e);

	//fog
	vec3 fog_color = vec3(0.5,0.5,0.5);
	float distance = length(v);
	distance = distance - 20.0;
	if(distance < 0.0 )
		distance = 0.0;
	float f = exp(-distance/20.0);
	f = f*3.0;

	//DIFFUSE
	vec3 light_DFF = kDiffuse *  vec3(texture2D(groundtexture,vUv)) * max(dot(l,n), 0.0);

	//TOTAL
	vec3 TOTAL =  light_DFF;
	TOTAL = (1.0-f ) * fog_color + f * TOTAL;
	gl_FragColor = vec4(TOTAL, 0.0);
	//gl_FragColor = texture2D(groundtexture,vUv);


}