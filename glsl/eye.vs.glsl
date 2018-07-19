// Shared variable passed to the fragment shader
varying vec3 color;
uniform vec3 lightPosition;
uniform vec3 eyeCenter;

#define MAX_EYE_DEPTH 0.15

void main() {
  // simple way to color the pupil where there is a concavity in the sphere
  // position is in local space, assuming radius 1
  float d = min(1.0 - length(position), MAX_EYE_DEPTH);
  color = mix(vec3(1.0), vec3(0.0), d * 1.0 / MAX_EYE_DEPTH);

  // Multiply each vertex by the model-view matrix and the projection matrix to get final vertex position

  vec3 z = normalize(eyeCenter - lightPosition);
  vec3 y = vec3(0.0, 1.0, 0.0);
  vec3 x = normalize(cross(y,z));

  mat4 rotateXMatrix = mat4(1,0,0,0,
                            0,0,-1,0,
                            0,1,0,0,
                     vec4(0.0,0.0,0.0,1.0));

  mat4 rotateYMatrix = mat4(0,0,1,0,
                            0,1,0,0,
                            -1,0,0,0,
                     vec4(0.0,0.0,0.0,1.0));

  mat4 lookAtMatrix = mat4(vec4(x,0.0),vec4(y,0.0),vec4(z,0.0),
                      vec4(0.0,0.0,0.0,1.0));

  gl_Position = projectionMatrix * modelViewMatrix * lookAtMatrix * rotateXMatrix * rotateYMatrix *  vec4(position, 1.0);
}
