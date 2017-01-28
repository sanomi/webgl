var gl, shaderProgram, triangleVertexPositionBuffer, squareVertexPositionBuffer;


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
	debugger;
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

	shaderProgram.pMatrixUniform = gl.getUniformLocation( shaderProgram, "uPMatrix" );
	shaderProgram.mvMatrixUniform = gl.getUniformLocation( shaderProgram, "uMVMatrix" );

}

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function setMatrixUniforms() {
	gl.uniformMatrix4fv( shaderProgram.pMatrixUniform, false, pMatrix );
	gl.uniformMatrix4fv( shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function initBuffers() {
	var triangleVertices = [
		 0.0,  1.0,  0.0,
		-1.0, -1.0,  0.0,
		 1.0, -1.0,  0.0
	];
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, triangleVertexPositionBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( triangleVertices ), gl.STATIC_DRAW );
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems = 3;

	var squareVertices = [
		 1.0,  1.0,  0.0,
		-1.0,  1.0,  0.0,
		 1.0, -1.0,  0.0,
		-1.0, -1.0,  0.0
	];
	squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexPositionBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( squareVertices ), gl.STATIC_DRAW );
	squareVertexPositionBuffer.itemSize = 3;
	squareVertexPositionBuffer.numItems = 4;

}


function drawScene() {
	gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	mat4.perspective( 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix );
	mat4.identity( mvMatrix );

	mat4.translate( mvMatrix, [ -1.5, 0.0, -7.0 ] );

	gl.bindBuffer( gl.ARRAY_BUFFER, triangleVertexPositionBuffer );
	gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0 );
	setMatrixUniforms();
	gl.drawArrays( gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems );

	mat4.translate( mvMatrix, [ 3.0, 0.0, 0.0 ] );

	gl.bindBuffer( gl.ARRAY_BUFFER, squareVertexPositionBuffer );
	gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0 );
	setMatrixUniforms();
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems );
}



function webGLStart() {
	var canvas = document.getElementById( "canvas" );
	initGL( canvas );
	initShaders();
	initBuffers();

	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	gl.enable( gl.DEPTH_TEST );
	drawScene();
}