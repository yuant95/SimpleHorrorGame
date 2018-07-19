varying vec3 Normal_V;
varying vec4 Position_V;
varying vec2 Texcoord_V;


void main() {
	Normal_V = normalMatrix * normal;
	Position_V = modelMatrix * vec4(position, 1.0);

	gl_Position = projectionMatrix * viewMatrix * Position_V;

}