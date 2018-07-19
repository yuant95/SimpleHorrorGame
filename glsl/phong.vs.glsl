varying vec3 n;
varying vec3 v;

void main() {

	// TODO: PART 1A
    n = normalize(normalMatrix * normal);
    v = vec3(modelViewMatrix * vec4(position, 1.0));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}