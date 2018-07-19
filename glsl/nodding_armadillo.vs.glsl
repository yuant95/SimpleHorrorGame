// Shared variable passed to the fragment shader
//varying vec3 color;
varying vec3 light;
varying vec3 n;
varying vec3 v;

// Constant set via your javascript code
uniform vec3 lightPosition;
uniform vec3 nodAngle;


//rotationMatrix Function
mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}


//translationMatrix Function
mat4 translationMatrix(vec3 trans)
{
    return mat4(1,0,0,0,
                0,1,0,0,
                0,0,1,0,
         		vec4(trans,1));

}

//transposeMatrix Function
mat4 transpose(mat4 inMatrix) {
	vec4 i0 = inMatrix[0];
    vec4 i1 = inMatrix[1];
    vec4 i2 = inMatrix[2];
    vec4 i3 = inMatrix[3];

    mat4 outMatrix = mat4(
                 vec4(i0.x, i1.x, i2.x, i3.x),
                 vec4(i0.y, i1.y, i2.y, i3.y),
                 vec4(i0.z, i1.z, i2.z, i3.z),
                 vec4(i0.w, i1.w, i2.w, i3.w)
                 );

    return outMatrix;
}


void main() {
	
	n = normalize(normalMatrix * normal);
    v = vec3(modelViewMatrix * vec4(position, 1.0));

	// Calculate position in world coordinates
	vec4 wpos = modelMatrix * vec4(position, 1.0);

	// Calculates vector from the vertex to the light
	vec3 l = lightPosition - wpos.xyz;

	// Contribution based on cosine
	light = vec3(1.0) * dot(normalize(l), normal);

	vec4 afterPosition =vec4(position, 1.0);
	vec3 walkDis = nodAngle;

	mat4 headDir =  rotationMatrix(vec3(0,1,0), walkDis.y);


	// head direction

	//neckTolight
    vec3 neck2light = normalize(lightPosition - vec3(0,2.45,-0.3));

    float headYangle = acos(dot(neck2light, vec3(0,0,-1)));

    if(lightPosition.x < 0.0)
    	headYangle = -1.0 * headYangle;

	// Identifying the head
	if (position.z < -0.33 && abs(position.x) < 0.46){

		//Rotation
		mat4 rotateXMatrix = rotationMatrix(vec3(1,0,0), walkDis.z);
        //mat4 rotateYMatrix = rotationMatrix(vec3(0,1,0), walkDis.y);

        mat4 rotateYMatrix = rotationMatrix(vec3(0,1,0), headYangle);
	    
	    //Neck Frame
	    mat4 neckMatrix = translationMatrix(vec3(0,2.45,-0.3));
	    mat4 inverseNeckMatrix = translationMatrix(vec3(0,-2.45,0.3));

		// Multiply each vertex by the model-view matrix and the projection matrix to get final vertex position

		// Updated Position
		afterPosition = neckMatrix * rotateXMatrix * rotateYMatrix * inverseNeckMatrix * afterPosition;

		gl_Position = projectionMatrix * modelViewMatrix * afterPosition;
	}

	// Identifying the lower body
	else if ( ( (position.y + 0.8*position.x) < 1.0 || (position.y - 0.8* position.x) < 1.0 ) && (position.y < 1.6)){

		mat4 rotateXMatrixR = rotationMatrix(vec3(1,0,0), walkDis.z);
		mat4 rotateXMatrixL = rotationMatrix(vec3(1,0,0), walkDis.z);

		// Left Part
	    mat4 leftLumbarMatrix = rotationMatrix(vec3(0,1,0), 3.14159/4.0) * translationMatrix(vec3(0.4, 1.3, -0.15));

        mat4 inverseLeftLumbar = translationMatrix(vec3(-0.4, -1.3, 0.15)) * transpose(rotationMatrix(vec3(0,1,0), 3.14159/4.0));

	    // Right Part
	    mat4 rightLumbarMatrix = rotationMatrix(vec3(0,1,0), 3.14159/4.0*3.0) * translationMatrix(vec3(-0.6, 1.3, -0.15));

	    mat4 inverseRightLumbar = translationMatrix(vec3(0.6, -1.3, 0.15)) * transpose(rotationMatrix(vec3(0,1,0), 3.14159/4.0*3.0));


		// Multiply each vertex by the model-view matrix and the projection matrix to get final vertex position
		//left leg
		if (position.x > 0.0){
			afterPosition = leftLumbarMatrix * rotateXMatrixL* inverseLeftLumbar * afterPosition;
		}

		//right leg
		else{
			afterPosition = rightLumbarMatrix * rotateXMatrixR * inverseRightLumbar  * afterPosition;
		}


		gl_Position = projectionMatrix * modelViewMatrix * afterPosition;


		// Identifying shank
		if (position.y < 0.7 ){
			mat4 rotateXMatrix = rotationMatrix(vec3(1,0,0), walkDis.z);

		    mat4 leftKneeMatrix = translationMatrix(vec3(0.4, 0.7, -0.15));

		    mat4 leftInverseKneeMatrix = translationMatrix(vec3(-0.4, -0.7, 0.15));

		    mat4 rightKneeMatrix = rotationMatrix(vec3(0,1,0), 3.14159) * translationMatrix(vec3(-0.4, 0.7, -0.15));

		    mat4 rightInverseKneeMatrix = translationMatrix(vec3(0.4, -0.7, 0.15)) * transpose(rotationMatrix(vec3(0,1,0), 3.14159));

			// Multiply each vertex by the model-view matrix and the projection matrix to get final vertex position

			//left leg
			if (position.x > 0.0){
				afterPosition = leftKneeMatrix * rotateXMatrix* leftInverseKneeMatrix * afterPosition;
			}

			//right leg
			else{
				afterPosition = rightKneeMatrix * rotateXMatrix * rightInverseKneeMatrix  * afterPosition;
			}

			gl_Position = projectionMatrix * modelViewMatrix * afterPosition;
		}
		

	}

	//All other part of the body
	else {

		gl_Position = projectionMatrix * modelViewMatrix * afterPosition;
	}
	afterPosition = afterPosition + rotationMatrix(vec3(0,1,0), headYangle) * vec4(0.0,0.0,walkDis.x,0.0);
	
	gl_Position = projectionMatrix * modelViewMatrix * afterPosition;
}
