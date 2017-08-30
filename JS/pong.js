var renderer;
var scene;
var camera;

var fieldLength = 300;
var fieldWidth = 200;

var ball;
var ballXVelocity = 3;
var ballZVelocity = 0;
var ballRadius = 5;
var ballCanMove = true;

var paddleMaxVelocity = 6;
var paddleWidth = 25;

var leftPaddle;
var leftPaddleVelocity = 0;

var rightPaddle;
var rightPaddleVelocity = 0;

var sideThickness = 10;

function init(){

	initScene();
	initRenderer();
	initCamera();

	document.body.appendChild( renderer.domElement );
	render();

}

function initScene(){

	scene = new THREE.Scene();

	initArena();
	initPaddles();
	initBall();
	initLights();

}

function initArena(){

	var floor = new THREE.Mesh( new THREE.CubeGeometry( fieldLength, 3, fieldWidth ), new THREE.MeshLambertMaterial({color: 0x225522}) );
	floor.castShadow = true;
	scene.add( floor );

	var sideGeometry = new THREE.CubeGeometry( fieldLength, 15, sideThickness );
	var sideMaterial = new THREE.MeshLambertMaterial({color: 0x999911})

	var topSide = new THREE.Mesh( sideGeometry, sideMaterial);
	topSide.position.x = 0;
	topSide.position.y = 10;
	topSide.position.z = -(fieldWidth/2);
	topSide.castShadow = true;
	scene.add( topSide );

	var bottomSide = new THREE.Mesh( sideGeometry, sideMaterial);
	bottomSide.position.x = 0;
	bottomSide.position.y = 10;
	bottomSide.position.z = (fieldWidth/2);
	bottomSide.castShadow = true;
	scene.add( bottomSide );

}

function initPaddles(){

	var paddleGeometry = new THREE.CubeGeometry( 10, 15, paddleWidth );
	var paddleMaterial = new THREE.MeshLambertMaterial({color: 0x222255});

	leftPaddle = new THREE.Mesh( paddleGeometry, paddleMaterial);
	leftPaddle.position.x = -150;
	leftPaddle.position.y = 10;
	leftPaddle.castShadow = true;
	scene.add( leftPaddle );

	rightPaddle = new THREE.Mesh( paddleGeometry, paddleMaterial);
	rightPaddle.position.x = 150;
	rightPaddle.position.y = 10;
	rightPaddle.castShadow = true;
	scene.add( rightPaddle );

}

function initBall(){

	ball = new THREE.Mesh( new THREE.SphereGeometry( ballRadius ), new THREE.MeshLambertMaterial({color: 0x999911}) );
	ball.position.x = 0;
	ball.position.y = 10;
	ball.castShadow = true;
	scene.add( ball );

}

function initLights(){

	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set ( 0, 150, 0 );
	spotLight.shadow.camera.near = 20;
	spotLight.shadow.camera.far = 500;
	spotLight.castShadow = true;
	scene.add( spotLight );

}

function initRenderer(){

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x000000, 1.0 );
	renderer.setSize( window.innerWidth*.9, window.innerHeight*.9 );
	renderer.shadowMap.enabled = true;

}

function initCamera(){

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
	camera.position.x = 0;
	camera.position.y = 250;
	camera.position.z = 200;
	camera.lookAt( scene.position );

}

function render(){

	renderer.render( scene, camera );

	updatePaddles();

	if( ballCanMove )
		updateBall();

	requestAnimationFrame( render );

}

function updateBall(){

	var offsetX = ballRadius;
	var offsetZ = ballRadius + (sideThickness/2);

	if( ball.position.x >= (fieldLength/2) - offsetX ){

		if(  Math.abs(ball.position.z - rightPaddle.position.z) < (paddleWidth/1.5) ){

			ballXVelocity = ballXVelocity * -1;
			ballZVelocity = (rightPaddleVelocity + ballZVelocity)/2;

		}else{

			resetBall();

		}

	}else if( ball.position.x <= offsetX - (fieldLength/2) ){

		if( Math.abs(ball.position.z - leftPaddle.position.z) < (paddleWidth/1.5) ){

			ballXVelocity = ballXVelocity * -1;
			ballZVelocity = (leftPaddleVelocity + ballZVelocity)/2;

		}else{

			resetBall();

		}

	}

	if( ball.position.z >= (fieldWidth/2) - offsetZ || ball.position.z <= -(fieldWidth/2) + offsetZ )
		ballZVelocity = -ballZVelocity;

	ball.position.x += ballXVelocity;
	ball.position.z += ballZVelocity;

}

function resetBall(){

	ballCanMove = false;

	ballZVelocity = 0;
	ball.position.x = 0;
	ball.position.z = 0;

	setTimeout(
		function(){
			ballCanMove = true;
		},
		3000
	);

}

function updatePaddles(){

	updateRightPaddleVelocity();
	updateLeftPaddleVelocity();

	var offset = (paddleWidth/2) + (sideThickness/2);

	if( rightPaddle.position.z < -(fieldWidth/2) + offset ){

		rightPaddle.position.z = -(fieldWidth/2) + offset;
		rightPaddleVelocity = 0;

	}else if( rightPaddle.position.z > (fieldWidth/2) - offset ){

		rightPaddle.position.z = (fieldWidth/2) - offset;
		rightPaddleVelocity = 0;

	}else{

		rightPaddle.position.z += rightPaddleVelocity;

	}

	if( leftPaddle.position.z < -(fieldWidth/2) + offset ){

		leftPaddle.position.z = -(fieldWidth/2) + offset;
		leftPaddleVelocity = 0;

	}else if( leftPaddle.position.z > (fieldWidth/2) - offset ){

		leftPaddle.position.z = (fieldWidth/2) - offset;
		leftPaddleVelocity = 0;

	}else{

		leftPaddle.position.z += leftPaddleVelocity;

	}

}

function updateRightPaddleVelocity(){

	if( Key.isDown(Key.UPARROW) ){

		if( rightPaddleVelocity < 0 )
			rightPaddleVelocity = 0;

		rightPaddleVelocity = rightPaddleVelocity + ( Math.abs(rightPaddleVelocity) - Math.abs(paddleMaxVelocity) )/2;

	}else if( Key.isDown(Key.DOWNARROW) ){

		if( rightPaddleVelocity > 0 )
			rightPaddleVelocity = 0;

		rightPaddleVelocity = rightPaddleVelocity - ( Math.abs(rightPaddleVelocity) - Math.abs(paddleMaxVelocity) )/2;

	}else{

		rightPaddleVelocity = rightPaddleVelocity/2;

	}

}

function updateLeftPaddleVelocity(){

	if( Key.isDown(Key.W) ){

		if( leftPaddleVelocity < 0 )
			leftPaddleVelocity = 0;

		leftPaddleVelocity = leftPaddleVelocity + ( Math.abs(leftPaddleVelocity) - Math.abs(paddleMaxVelocity) )/2;

	}else if( Key.isDown(Key.S) ){

		if( leftPaddleVelocity > 0 )
			leftPaddleVelocity = 0;

		leftPaddleVelocity = leftPaddleVelocity - ( Math.abs(leftPaddleVelocity) - Math.abs(paddleMaxVelocity) )/2;

	}else{

		leftPaddleVelocity = leftPaddleVelocity/2;

	}

}

window.onload = init;