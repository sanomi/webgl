var gl, 
shaderProgram, 
pyramidVertexPositionBuffer, 
pyramidVertexColorBuffer,
cubeVertexPositionBuffer,
cubeVertexColorBuffer,
cubeVertexIndexBuffer,
rPyramid = 0,
rCube = 0,
mvMatrixStack = [],
mvMatrix = mat4.create(),
pMatrix = mat4.create(),
lastTime = 0;

function webGLStart() {
	var canvas = document.getElementById( "canvas" );
	initGL( canvas );
	initShaders();
	initBuffers();

	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	gl.enable( gl.DEPTH_TEST );
	tick();
}

function tick() {
	requestAnimFrame( tick );
	drawScene();
	animate();
}

function	animate() {
	var timeNow = new Date().getTime();
	if ( lastTime != 0 ) {
		var elapsed = timeNow - lastTime;

		rPyramid += ( 90 * elapsed / 1000.0 );
		rCube += ( 75 * elapsed ) / 1000.0;
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

	shaderProgram.vertexColorAttribute = gl.getAttribLocation( shaderProgram, "aVertexColor" );
	gl.enableVertexAttribArray( shaderProgram. vertexColorAttribute );

	shaderProgram.pMatrixUniform = gl.getUniformLocation( shaderProgram, "uPMatrix" );
	shaderProgram.mvMatrixUniform = gl.getUniformLocation( shaderProgram, "uMVMatrix" );

}

function setMatrixUniforms() {
	gl.uniformMatrix4fv( shaderProgram.pMatrixUniform, false, pMatrix );
	gl.uniformMatrix4fv( shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function initBuffers() {
	var pyramidVertices = [
		//Front face
		0.0,  1.0,  0.0,
		-1.0, -1.0,  1.0,
		1.0, -1.0,  1.0,
		// Right face
		0.0,  1.0,  0.0,
		1.0, -1.0,  1.0,
		1.0, -1.0, -1.0,
		// Back face
		0.0,  1.0,  0.0,
		1.0, -1.0, -1.0,
		-1.0, -1.0, -1.0,
		// Left face
		0.0,  1.0,  0.0,
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0
	];
	pyramidVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, pyramidVertexPositionBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( pyramidVertices ), gl.STATIC_DRAW );
	pyramidVertexPositionBuffer.itemSize = 3;
	pyramidVertexPositionBuffer.numItems = 12;

	var pyramidColors = [
		// Front face
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		// Right face
		1.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		// Back face
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		// Left face
		1.0, 0.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 1.0, 0.0, 1.0
	];
	pyramidVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, pyramidVertexColorBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( pyramidColors), gl.STATIC_DRAW );
	pyramidVertexColorBuffer.itemSize = 4;
	pyramidVertexColorBuffer.numItems = 12;



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

	cubeVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexColorBuffer );
	var cubeColors = [
		[1.0, 0.0, 0.0, 1.0], // Front face
		[1.0, 1.0, 0.0, 1.0], // Back face
		[0.0, 1.0, 0.0, 1.0], // Top face
		[1.0, 0.0, 1.0, 1.0], // Bottom face
		[1.0, 0.5, 0.5, 1.0], // Right face
		[0.0, 0.0, 1.0, 1.0], // Left face

	];
	var unpackedCubeColors = [];
	for( var i in cubeColors ) {
		var color = cubeColors[ i ];
		for ( var idx = 0; idx < 4; idx++ ) {
			unpackedCubeColors = unpackedCubeColors.concat( color );
		}
	}

	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( unpackedCubeColors ), gl.STATIC_DRAW );
	cubeVertexColorBuffer.itemSize = 4;
	cubeVertexColorBuffer.numItems = 24;

	cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer );
	var cubeVertexIndices = [
		0, 1, 2,			0, 2, 3,    // Front face
		4, 5, 6,			4, 6, 7,    // Back face
		8, 9, 10,     8, 10, 11,  // Top face
		12, 13, 14,   12, 14, 15, // Bottom face
		16, 17, 18,   16, 18, 19, // Right face
		20, 21, 22,   20, 22, 23  // Left face
	];

	gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( cubeVertexIndices ), gl.STATIC_DRAW );
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numItems = 36;

}


function drawScene() {
	gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	mat4.perspective( 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix );
	mat4.identity( mvMatrix );

	mat4.translate( mvMatrix, [ -1.35, 0.0, -7.0 ] );

	mvPushMatrix();
	mat4.rotate( mvMatrix, degToRad( rPyramid ), [ 0, 1, 0 ] );

	gl.bindBuffer( gl.ARRAY_BUFFER, pyramidVertexPositionBuffer );
	gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer( gl.ARRAY_BUFFER, pyramidVertexColorBuffer );
	gl.vertexAttribPointer( shaderProgram.vertexColorAttribute, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0 );

	setMatrixUniforms();
	gl.drawArrays( gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems );

	mvPopMatrix();

	mat4.translate( mvMatrix, [ 2.6, 0.0, 0.0 ] );

	mvPushMatrix();
	mat4.rotate( mvMatrix, degToRad( rCube ), [ 1, 0, 0 ] );

	gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexPositionBuffer );
	gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexColorBuffer );
	gl.vertexAttribPointer( shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer );
	setMatrixUniforms();
	gl.drawElements( gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0 );

	gl.drawArrays( gl.TRIANGLE_STRIP, 0, cubeVertexPositionBuffer.numItems );

	mvPopMatrix();
}

