var gl, 
shaderProgram, 
pyramidVertexPositionBuffer, 
pyramidVertexColorBuffer,
cubeVertexPositionBuffer,
cubeVertexColorBuffer,
cubeVertexIndexBuffer,
crateTextures = [],
mvMatrixStack = [],
currentlyPressedKeys = {},
mvMatrix = mat4.create(),
pMatrix = mat4.create(),
xRot = 4,
xSpeed = 4,
yRot = 4,
ySpeed = 4,
z = -5.0,
filter = 0,
lastTime = 0;

function webGLStart() {
	var canvas = document.getElementById( "canvas" );
	initGL( canvas );
	initShaders();
	initBuffers();
	initTexture();

	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	gl.enable( gl.DEPTH_TEST );

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

	tick();
}

function resize(canvas) {
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;
 
  if (canvas.width  != displayWidth ||
      canvas.height != displayHeight) {
 
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}

function initTexture() {
	var crateImage = new Image();

	for ( var i = 0; i < 3; i++ ) {
		var texture = gl.createTexture();
		texture.image = crateImage;
		texture.image.crossOrigin = "anonymous";
		crateTextures.push( texture );
	}
	crateImage.onload = function() {
		handleLoadedTexture( crateTextures );
	}

	crateImage.src = "patt.jpg";
}

function handleKeyDown( e ) {
	currentlyPressedKeys[ e.keyCode ] = true;

	if ( String.fromCharCode( e.keyCode ) == "F" ) {
		filter += 1;
		if ( filter === 3 ) {
			filter = 0;
		}
	}
}

function handleKeyUp( e ) {
	currentlyPressedKeys[ e.keyCode ] = false;
}

function handleLoadedTexture( texture ) {
	gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

	gl.bindTexture( gl.TEXTURE_2D, crateTextures[ 0 ] );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, crateTextures[ 0 ].image );
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	
	gl.bindTexture( gl.TEXTURE_2D, crateTextures[ 1 ] );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, crateTextures[ 1 ].image );
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	
		gl.bindTexture( gl.TEXTURE_2D, crateTextures[ 2 ] );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, crateTextures[ 2 ].image );
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap( gl.TEXTURE_2D );
	

	gl.bindTexture( gl.TEXTURE_2D, null );
}

function tick() {
	requestAnimFrame( tick );
	handleKeys();
	drawScene();
	animate();
}

function handleKeys() {
	if ( currentlyPressedKeys[ 38 ] ) {
		//up arrow
		z -=  0.05;
	}
	if ( currentlyPressedKeys[ 40 ] ) {
		//down arrow
		z += 0.05;
	}
	if ( currentlyPressedKeys[ 37 ] ) {
		//left arrow
		xSpeed -= 1;
		ySpeed -= 1;
	}
	if ( currentlyPressedKeys[ 39 ] ) {
		//right arrow
		xSpeed += 1;
		ySpeed += 1;
	}
}

function animate() {
	var timeNow = new Date().getTime();
	if ( lastTime != 0 ) {
		var elapsed = timeNow - lastTime;

		xRot += ( xSpeed * elapsed ) / 1000.0;
		yRot += ( ySpeed * elapsed ) / 1000.0;
	}

	lastTime = timeNow;
}

function mvPushMatrix() {
	var copy = mat4.create();
	mat4.set( mvMatrix, copy );
	mvMatrixStack.push( copy );
}

function mvPopMatrix() {
	if ( mvMatrixStack.length == 0 ) {
		throw "Invalid popMatrix";
	}
	mvMatrix = mvMatrixStack.pop();
}

function initGL( canvas ) {
	try {
		gl = canvas.getContext( "webgl" ) || canvas.getContext( "experimental-webgl" );
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		} catch ( e ) {
		console.log( e );
	}
	if ( !gl ) {
		alert( "Please use a browser which supports WebGL" );
	}
}

function degToRad( degrees ) {
	return degrees * Math.PI / 180;
}

function getShader( gl, id ) {
	var shaderScript = document.getElementById( id );
	if( !shaderScript ) {
		return null;
	}

	var str = "";
	var currentChild = shaderScript.firstChild;
	while ( currentChild ) {
		if ( currentChild.nodeType == 3 ) {
			str += currentChild.textContent;
			currentChild = currentChild.nextSibling;
		}
	}

	var shader;

	if( shaderScript.type == "x-shader/x-fragment" ) {
		shader = gl.createShader( gl.FRAGMENT_SHADER );
	} else if ( shaderScript.type == "x-shader/x-vertex" ) {
		shader = gl.createShader( gl.VERTEX_SHADER );
	} else {
		return null;
	}

	gl.shaderSource( shader, str )
	gl.compileShader( shader );

	if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
		console.log( gl.getShaderInfoLog( shader ) );
		return null;
	}

	return shader;
}


function initShaders() {
	var fragmentShader = getShader( gl, "shader-fs" );
	var vertexShader = getShader( gl, "shader-vs" );

	shaderProgram = gl.createProgram();
	gl.attachShader( shaderProgram, vertexShader );
	gl.attachShader( shaderProgram, fragmentShader );
	gl.linkProgram( shaderProgram );

	if( !gl.getProgramParameter( shaderProgram, gl.LINK_STATUS ) ) {
		alert( "Could not initialize shaders" );
	}

	gl.useProgram( shaderProgram );

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation( shaderProgram, "aVertexPosition" );
	gl.enableVertexAttribArray( shaderProgram.vertexPositionAttribute );


	shaderProgram.vertexNormalAttribute = gl.getAttribLocation( shaderProgram, "aVertexNormal" );
	gl.enableVertexAttribArray( shaderProgram.vertexNormalAttribute );

	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord" );
	gl.enableVertexAttribArray( shaderProgram.textureCoordAttribute );


	shaderProgram.pMatrixUniform = gl.getUniformLocation( shaderProgram, "uPMatrix" );
	shaderProgram.mvMatrixUniform = gl.getUniformLocation( shaderProgram, "uMVMatrix" );
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
	shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
	shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
	shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");
	shaderProgram.alphaUniform = gl.getUniformLocation( shaderProgram, "uAlpha" );
}

function setMatrixUniforms() {
	gl.uniformMatrix4fv( shaderProgram.pMatrixUniform, false, pMatrix );
	gl.uniformMatrix4fv( shaderProgram.mvMatrixUniform, false, mvMatrix);

	var normalMatrix = mat3.create();
	mat4.toInverseMat3( mvMatrix, normalMatrix );
	mat3.transpose( normalMatrix );
	gl.uniformMatrix3fv( shaderProgram.nMatrixUniform, false, normalMatrix );
}

function initBuffers() {

	var cubeVertices = [
		// Front face
		-1.0, -1.0,  1.0,
		1.0, -1.0,  1.0,
		1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		1.0,  1.0, -1.0,
		1.0, -1.0, -1.0,

		// Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		1.0,  1.0,  1.0,
		1.0,  1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,

		// Right face
		1.0, -1.0, -1.0,
		1.0,  1.0, -1.0,
		1.0,  1.0,  1.0,
		1.0, -1.0,  1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0,
	];
	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexPositionBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( cubeVertices ), gl.STATIC_DRAW );
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = 24;


	var vertexNormals = [
		// Front face
		0.0,  0.0,  1.0,
		0.0,  0.0,  1.0,
		0.0,  0.0,  1.0,
		0.0,  0.0,  1.0,

    	// Back face
		0.0,  0.0, -1.0,
		0.0,  0.0, -1.0,
		0.0,  0.0, -1.0,
		0.0,  0.0, -1.0,

    	// Top face
		0.0,  1.0,  0.0,
		0.0,  1.0,  0.0,
		0.0,  1.0,  0.0,
		0.0,  1.0,  0.0,

    	// Bottom face
		0.0, -1.0,  0.0,
		0.0, -1.0,  0.0,
		0.0, -1.0,  0.0,
		0.0, -1.0,  0.0,

    	// Right face
		1.0,  0.0,  0.0,
		1.0,  0.0,  0.0,
		1.0,  0.0,  0.0,
		1.0,  0.0,  0.0,

		// Left face
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0,
    ];

	cubeVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexNormalBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertexNormals ), gl.STATIC_DRAW );
	cubeVertexNormalBuffer.itemSize = 3;
	cubeVertexNormalBuffer.numItems = 24;


	var textureCoords = [
		// Front face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,

		// Back face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,

		// Top face
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,

		// Bottom face
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,

		// Right face
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		0.0, 0.0,

		// Left face
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
	];

	cubeVertexTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( textureCoords ), gl.STATIC_DRAW );
	cubeVertexTextureCoordBuffer.itemSize = 2;
	cubeVertexTextureCoordBuffer.numItems = 24;

	cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	var cubeVertexIndices = [
		0, 1, 2,      0, 2, 3,    // Front face
		4, 5, 6,      4, 6, 7,    // Back face
		8, 9, 10,     8, 10, 11,  // Top face
		12, 13, 14,   12, 14, 15, // Bottom face
		16, 17, 18,   16, 18, 19, // Right face
		20, 21, 22,   20, 22, 23  // Left face
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numItems = 36;

}


function drawScene() {
	gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	var aspect = canvas.clientWidth / canvas.clientHeight;
	//perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
	mat4.perspective( 45, aspect, 0.1, 100.0, pMatrix );
	mat4.identity( mvMatrix );

	mat4.translate( mvMatrix, [ 0.0, 0.0, z ] );

	mat4.rotate( mvMatrix, degToRad( xRot ), [ 1, 0, 0 ] );
	mat4.rotate( mvMatrix, degToRad( yRot ), [ 0, 1, 0 ] );

	gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexPositionBuffer );
	gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexNormalBuffer );
	gl.vertexAttribPointer( shaderProgram.vertexNormalAttribute, cubeVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer );
	gl.vertexAttribPointer( shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0 );

	gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_2D, crateTextures[ filter ] );
	gl.uniform1i( shaderProgram.samplerUniform, 0 );


	var lighting = document.getElementById("lighting").checked;
	gl.uniform1i( shaderProgram.useLightingUniform, lighting );
	if ( lighting ) {
		gl.uniform3f(
		shaderProgram.ambientColorUniform,
		parseFloat( document.getElementById( "ambientR" ).value ),
		parseFloat( document.getElementById( "ambientG" ).value ),
		parseFloat( document.getElementById( "ambientB" ).value )
		);

		var lightingDirection = [
			parseFloat( document.getElementById( "lightDirectionX" ).value ),
			parseFloat( document.getElementById( "lightDirectionY" ).value ),
			parseFloat( document.getElementById( "lightDirectionZ" ).value )
		];

		var adjustedLD = vec3.create();
		vec3.normalize( lightingDirection, adjustedLD );
		vec3.scale( adjustedLD, -1 );
		gl.uniform3fv( shaderProgram.lightingDirectionUniform, adjustedLD );

		gl.uniform3f(
		shaderProgram.directionalColorUniform,
		parseFloat( document.getElementById( "directionalR" ).value ),
		parseFloat( document.getElementById( "directionalG" ).value ),
		parseFloat( document.getElementById( "directionalB" ).value )
		);

    }

    var blending = document.getElementById( "blending" ).checked;
    if ( blending ) {
    	gl.blendFunc( gl.SRC_ALPHA, gl.ONE );
    	gl.enable( gl.BLEND );
    	gl.disable( gl.DEPTH_TEST );
    	gl.uniform1f( shaderProgram.alphaUniform, parseFloat( document.getElementById( "alpha" ).value ) );
    } else {
    	gl.disable( gl.BLEND );
    	gl.enable( gl.DEPTH_TEST );
    }

	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer );
	setMatrixUniforms();
	gl.drawElements( gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0 );

}

