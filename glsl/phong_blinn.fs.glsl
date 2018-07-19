varying vec3 n;
varying vec3 v;


uniform vec3 lightDirection;
uniform vec3 lightColor;
uniform vec3 ambientColor;
uniform float kAmbient;
uniform float kDiffuse;
uniform float kSpecular;
uniform float shininess;

void main() {

	//TODO: PART 1B

	vec3 l =normalize(lightDirection);
	vec3 e = normalize(-v);
	vec3 bl = -l + 2.0 * dot(l,n) * n;
	vec3 h = normalize(l+e);

	//AMBIENT
	vec3 light_AMB = kAmbient * ambientColor;

	//DIFFUSE
	vec3 light_DFF = kDiffuse * lightColor * max(dot(l,n), 0.0);

	//SPECULAR
	vec3 light_SPC = kSpecular * lightColor * pow(max(dot(h,n),0.0),shininess) ;

	//TOTAL
	vec3 TOTAL = light_AMB + light_DFF + light_SPC;
	gl_FragColor = vec4(TOTAL, 0.0);


}