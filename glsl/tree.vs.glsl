varying vec3 n;
varying vec3 v;
varying vec2 vUv;

void main() {
	vUv = uv;

	// TODO: PART 1C
	n = normalize(normalMatrix * normal);
    v = vec3(modelViewMatrix * vec4(position, 1.0));
   
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}