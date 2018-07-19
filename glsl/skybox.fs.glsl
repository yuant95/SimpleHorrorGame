// UNIFORMS
uniform samplerCube skybox;
uniform vec3 cameraPositionUniform;

//VARINGS
varying vec3 Normal_V;
varying vec4 Position_V;
varying vec2 Texcoord_V;

void main() {
	vec3 V = vec3(Position_V)-cameraPositionUniform;
	V = normalize(V);
	gl_FragColor = textureCube(skybox, V);

}