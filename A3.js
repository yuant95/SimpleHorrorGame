var camera, scene, renderer, controls;
			var objects = [];
			var raycaster;
			var blocker = document.getElementById( 'blocker' );
			var instructions = document.getElementById( 'instructions' );
			var monsterMaterial;
			// http://www.html5rocks.com/en/tutorials/pointerlock/intro/
			var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
			if ( havePointerLock ) {
				var element = document.body;
				var pointerlockchange = function ( event ) {
					if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
						controlsEnabled = true;
						controls.enabled = true;
						blocker.style.display = 'none';
					} else {
						controls.enabled = false;
						blocker.style.display = 'block';
						instructions.style.display = '';
					}
				};
				var pointerlockerror = function ( event ) {
					instructions.style.display = '';
				};
				// Hook pointer lock state change events
				document.addEventListener( 'pointerlockchange', pointerlockchange, false );
				document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
				document.addEventListener( 'pointerlockerror', pointerlockerror, false );
				document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
				document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
				instructions.addEventListener( 'click', function ( event ) {
					instructions.style.display = 'none';
					// Ask the browser to lock the pointer
					element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
					element.requestPointerLock();
				}, false );
			} else {
				instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
			}
			init();
			animate();
			var controlsEnabled = false;
			var moveForward = false;
			var moveBackward = false;
			var moveLeft = false;
			var moveRight = false;
			var canJump = false;
			var prevTime = performance.now();
			var monsTime = performance.now();
			var velocity = new THREE.Vector3();
			var direction = new THREE.Vector3();
			function init() {
				camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x808080 );
				scene.fog = new THREE.Fog( 0x808080, 0.0025, 60 );
				var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
				light.position.set( 0.5, 1, 0.75 );
				scene.add( light );
				controls = new THREE.PointerLockControls( camera );
				scene.add( controls.getObject() );
				var onKeyDown = function ( event ) {
					switch ( event.keyCode ) {
						case 38: // up
						case 87: // w
							moveForward = true;
							break;
						case 37: // left
						case 65: // a
							moveLeft = true; break;
						case 40: // down
						case 83: // s
							moveBackward = true;
							break;
						case 39: // right
						case 68: // d
							moveRight = true;
							break;
						case 32: // space
							if ( canJump === true ) velocity.y += 350;
							canJump = false;
							break;
					}
				};
				var onKeyUp = function ( event ) {
					switch( event.keyCode ) {
						case 38: // up
						case 87: // w
							moveForward = false;
							break;
						case 37: // left
						case 65: // a
							moveLeft = false;
							break;
						case 40: // down
						case 83: // s
							moveBackward = false;
							break;
						case 39: // right
						case 68: // d
							moveRight = false;
							break;
					}
				};
				document.addEventListener( 'keydown', onKeyDown, false );
				document.addEventListener( 'keyup', onKeyUp, false );
				raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

			  // Parameters defining the light
			var lightColor = new THREE.Color(1,1,1); 
			var ambientColor = new THREE.Color(0.4,0.4,0.4);
			var lightDirection = new THREE.Vector3(0.49,0.79,0.49);

			// Material properties
			var kAmbient = 0.4;
			var kDiffuse = 0.8;
			var kSpecular = 0.8;
			var shininess = 10.0;
			var alphaX = 0.7;
			var alphaY = 0.1;

			// Uniforms
			var cameraPositionUniform = {type: "v3", value: camera.position }
			var lightColorUniform = {type: "c", value: lightColor};
			var ambientColorUniform = {type: "c", value: ambientColor};
			var lightDirectionUniform = {type: "v3", value: lightDirection};
			var kAmbientUniform = {type: "f", value: kAmbient};
			var kDiffuseUniform = {type: "f", value: kDiffuse};
			var kSpecularUniform = {type: "f", value: kSpecular};
			var shininessUniform = {type: "f", value: shininess};
			var alphaXUniform = {type: "f", value: alphaX};
			var alphaYUniform = {type: "f", value: alphaY};
			var nodAngle = {
			type: 'v3',
			value: new THREE.Vector3(0, 0, 0)
			}

			var isAdding = true;

			var fogMaterial = new THREE.ShaderMaterial({
			uniforms: {
			  lightDirection: lightDirectionUniform,
			  lightColor: lightColorUniform,
			  ambientColor: ambientColorUniform,
			  kAmbient:kAmbientUniform,
			  kDiffuse:kDiffuseUniform,
			  kSpecular:kSpecularUniform,
			  shininess: shininessUniform,
			  alphaX: alphaXUniform,
			  alphaY: alphaYUniform,

			  },
			});  

			var kDiffuseGround = {type: "f", value: 1.0};
			var groundTexture =  new THREE.ImageUtils.loadTexture('images/ground.bmp');
			groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
			groundTexture.repeat.set(100, 100);

			var groundMaterial = new THREE.ShaderMaterial({
			uniforms: {
			  lightDirection: lightDirectionUniform,
			  lightColor: lightColorUniform,
			  kDiffuse:kDiffuseGround,
			  groundtexture: {type:"t", value:groundTexture},
			  },
			});

			var treeTexture =  new THREE.ImageUtils.loadTexture('images/trunk_color.bmp');
			treeTexture.wrapS = treeTexture.wrapT = THREE.RepeatWrapping;
			treeTexture.repeat.set(1, 1);
			var treeMaterial = new THREE.ShaderMaterial({
			uniforms: {
			  lightDirection: lightDirectionUniform,
			  lightColor: lightColorUniform,
			  kDiffuse:kDiffuseGround,
			  treetexture: {type:"t", value:treeTexture},
			  },
			});


			var skyboxCubemap = new THREE.CubeTextureLoader()
			  .setPath( 'images/cubemap/' )
			  .load( [
			  'cube1.png', 'cube2.png',
			  'cube3.png', 'cube4.png',
			  'cube5.png', 'cube6.png'
			  ] );

			var skyboxMaterial = new THREE.ShaderMaterial({
				uniforms: {
					skybox: { type: "t", value: skyboxCubemap },
			    cameraPositionUniform:cameraPositionUniform,
				},
			    side: THREE.DoubleSide
			})


			// Load shaders
			var shaderFiles = [
			'glsl/fog.fs.glsl',
			'glsl/fog.vs.glsl',
			'glsl/ground.fs.glsl',
			'glsl/ground.vs.glsl',
			'glsl/tree.fs.glsl',
			'glsl/tree.vs.glsl',
			'glsl/skybox.vs.glsl',
			'glsl/skybox.fs.glsl'
			];

			new THREE.SourceLoader().load(shaderFiles, function(shaders) {
			fogMaterial.fragmentShader = shaders['glsl/fog.fs.glsl'];
			fogMaterial.vertexShader = shaders['glsl/fog.vs.glsl'];
			groundMaterial.fragmentShader = shaders['glsl/ground.fs.glsl'];
			groundMaterial.vertexShader = shaders['glsl/ground.vs.glsl'];
			treeMaterial.fragmentShader = shaders['glsl/tree.fs.glsl'];
			treeMaterial.vertexShader = shaders['glsl/tree.vs.glsl'];
			skyboxMaterial.vertexShader = shaders['glsl/skybox.vs.glsl']
			skyboxMaterial.fragmentShader = shaders['glsl/skybox.fs.glsl']

			treeMaterial.needsUpdate = true;
			groundMaterial.needsUpdate = true;
			fogMaterial.needsUpdate = true;

			})

			//Let's try adding sky box
			function loadSkyBox() {
			   
			      // Load the skybox images and create list of materials
			      var materials = [
			          createMaterial( 'images/skyX55+x.png' ), // right
			          createMaterial( 'images/skyX55-x.png' ), // left
			          createMaterial( 'images/skyX55+y.png' ), // top
			          createMaterial( 'images/skyX55-y.png' ), // bottom
			          createMaterial( 'images/skyX55+z.png' ), // back
			          createMaterial( 'images/skyX55-z.png' )  // front
			      ];
			       
			      // Create a large cube
			      var mesh = new THREE.Mesh( new THREE.BoxGeometry( 1000, 1000, 1000, 1, 1, 1 ), new THREE.MeshFaceMaterial( materials ) );
			       
			      // Set the x scale to be -1, this will turn the cube inside out
			      mesh.scale.set(-1,1,1);
			      scene.add( mesh );  
			}

			function createMaterial( path ) {
			  var texture = new THREE.ImageUtils.loadTexture(path);
			  var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

			  return material; 
			}


			anisotropic = {};
			loadSkyBox();
			// load trees randomly
			for (let j = 0; j < 50; ++j) {
				x = Math.floor( Math.random() * 20 - 10 ) * 20;
				z =Math.floor( Math.random() * 20 - 10 ) * 20;
				s = Math.random() * 10.0;
				loadOBJ('obj/tree1_trunk.obj',treeMaterial, s,x,0,z,0,-Math.PI/2,0);

			}


			function loadOBJ(file, material, scale, xOff, yOff, zOff, xRot, yRot, zRot) 
				{
					var onProgress = function(query) {
					if (query.lengthComputable) {
						var percentComplete = query.loaded / query.total * 100;
						console.log(file+'is loading...');
						console.log(Math.round(percentComplete, 2) + '% downloaded');
						}
					};

					var onError = function() {
					console.log('Failed to load ' + file);
					};

					var loader = new THREE.OBJLoader();
					loader.load(file, function(object) {
						object.traverse(function(child) {
							if (child instanceof THREE.Mesh) {
							child.material = material;
							}
					});

					object.position.set(xOff, yOff, zOff);
					object.rotation.x = xRot;
					object.rotation.y = yRot;
					object.rotation.z = zRot;
					object.scale.set(scale, scale, scale);
					scene.add(object);
					}, onProgress, onError);
			  }

			anisotropic.floor = new THREE.PlaneBufferGeometry(1000,1000);
			anisotropic.floor_aniso = new THREE.Mesh(anisotropic.floor, groundMaterial);
			anisotropic.floor_aniso.position.set(0, 0, 0);
			anisotropic.floor_aniso.rotation.x = -Math.PI / 2;
			scene.add(anisotropic.floor_aniso);

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );
				window.addEventListener( 'resize', onWindowResize, false );
			}
			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}
			function monsterTime(){

				console.log(direction)
				console.log(controls.getObject().position)
				for (let j = 0; j < 1; ++j) {
					x =  controls.getObject().position.x + camera.getWorldDirection().x * ((Math.random()+0.1) * 10.0);
					z = controls.getObject().position.z + camera.getWorldDirection().z * ((Math.random()+0.1) * 10.0) ;
					s = Math.random() * 0.1+ 0.05;
					y = xrot = zrot = 0.0;
					yrot = Math.random() * Math.PI * 2;
					loadMonster(s,x,y,z,xrot,yrot,zrot);
				}
			}

			function loadMonster(scale, xOff, yOff, zOff, xRot, yRot, zRot) 
			{
				var onProgress = function(query) 
				{
					if (query.lengthComputable) 
					{
						var percentComplete = query.loaded / query.total * 100;
						console.log("obj/haunted-freddy.obj"+'is loading...');
						console.log(Math.round(percentComplete, 2) + '% downloaded');
			    	}
			    };

				var onError = function() 
				{
					console.log('Failed to load ' + "obj/haunted-freddy.obj");
			    };
				

				var mtlLoader = new THREE.MTLLoader();
				mtlLoader.setBaseUrl( "images/haunted-freddy-obj/" );
				mtlLoader.setPath( "images/haunted-freddy-obj/" );
				mtlLoader.load( 'haunted-freddy.mtl', function( materials ) 
				{
					materials.preload();
					var objLoader = new THREE.OBJLoader();
					objLoader.setMaterials(materials);
					objLoader.load( 'obj/haunted-freddy.obj', function ( object ) 
					{
						console.log('load monster with mtl texture!!!!');
						object.position.set(xOff, yOff, zOff);
						object.rotation.x = xRot;
						object.rotation.y = yRot;
						object.rotation.z = zRot;
						object.scale.set(scale, scale, scale);
						scene.add(object);

					} );
				}, onProgress, onError);
			  }


			function animate() {
				requestAnimationFrame( animate );
				if ( controlsEnabled === true ) {
					raycaster.ray.origin.copy( controls.getObject().position );
					raycaster.ray.origin.y -= 10;
					var intersections = raycaster.intersectObjects( objects );
					var onObject = intersections.length > 0;
					var time = performance.now();
					var delta = ( time - prevTime ) / 1000;
					velocity.x -= velocity.x * 10.0 * delta;
					velocity.z -= velocity.z * 10.0 * delta;
					velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
					direction.z = Number( moveForward ) - Number( moveBackward );
					direction.x = Number( moveLeft ) - Number( moveRight );
					direction.normalize(); // this ensures consistent movements in all directions
					if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
					if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
					if ( onObject === true ) {
						velocity.y = Math.max( 0, velocity.y );
						canJump = true;
					}
					controls.getObject().translateX( velocity.x * delta );
					controls.getObject().translateY( velocity.y * delta );
					controls.getObject().translateZ( velocity.z * delta );
					if ( controls.getObject().position.y < 10 ) {
						velocity.y = 0;
						controls.getObject().position.y = 10;
						canJump = true;
					}
					prevTime = time;

					if( (time-monsTime)/1000 > 8.0 ){
						monsterTime();
						monsTime = time;
					}
				}
				renderer.render( scene, camera );
			}