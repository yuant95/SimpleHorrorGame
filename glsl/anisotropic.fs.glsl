varying vec3 n;
varying vec3 v;


uniform vec3 lightDirection;
uniform vec3 lightColor;
uniform vec3 ambientColor;
uniform float kAmbient;
uniform float kDiffuse;
uniform float kSpecular;
uniform float shininess;
uniform float alphaX;
uniform float alphaY;

void main() {

	//TODO: PART 1
	vec3 l =normalize(lightDirection);
	vec3 e = normalize(-v);
	vec3 h = normalize(l+e);


	vec3 t = normalize(cross(n, vec3(0.0,1.0,0.0)));
	vec3 b = normalize(cross(n,t));

	//AMBIENT
	vec3 light_AMB = kAmbient * ambientColor;

	//DIFFUSE
	vec3 light_DFF = kDiffuse * lightColor * max(dot(l,n), 0.0);

	//SPECULAR
	float temp = pow(dot(h,t)/alphaX,2.0) + pow(dot(h,b)/alphaY,2.0);
	temp = temp / (1.0+dot(h,n));
	vec3 light_SPC = kSpecular * lightColor * sqrt(max(dot(l,n)/dot(e,n), 0.0)) * exp(-2.0*temp);

	//TOTAL
	vec3 TOTAL = light_AMB + light_DFF + light_SPC;
	gl_FragColor = vec4(TOTAL, 0.0);

}