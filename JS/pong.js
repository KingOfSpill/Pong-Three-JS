var renderer;
var scene;
var camera;

var fieldLength = 300;
var fieldWidth = 200;

var ball;
var ballXVelocity = 3;
var ballZVelocity = 0;
var ballRadius = 5;

var paddleMaxVelocity = 6;
var paddleWidth = 25;

var leftPaddle;
var leftPaddleVelocity = 0;

var rightPaddle;
var rightPaddleVelocity = 0;

var ballCanMove = true;

function init(){

	initScene();
	initRenderer();
	initCamera();

	document.body.appendChild( renderer.domElement );
	render();

}

function initScene(){

	scene = new THREE.Scene();

	var floor = new THREE.Mesh( new THREE.CubeGeometry( fieldLength, 3, fieldWidth ), new THREE.MeshLambertMaterial({color: 0x225522}) );
	floor.castShadow = true;
	scene.add( floor );

	leftPaddle = new THREE.Mesh( new THREE.CubeGeometry( 10, 15, paddleWidth ), new THREE.MeshLambertMaterial({color: 0x222255}) );
	leftPaddle.position.x = -150;
	leftPaddle.position.y = 10;
	leftPaddle.castShadow = true;
	scene.add( leftPaddle );

	rightPaddle = new THREE.Mesh( new THREE.CubeGeometry( 10, 15, paddleWidth ), new THREE.MeshLambertMaterial({color: 0x222255}) );
	rightPaddle.position.x = 150;
	rightPaddle.position.y = 10;
	rightPaddle.castShadow = true;
	scene.add( rightPaddle );

	ball = new THREE.Mesh( new THREE.SphereGeometry( ballRadius ), new THREE.MeshLambertMaterial({color: 0x999911}) );
	ball.position.x = 0;
	ball.position.y = 10;
	ball.castShadow = true;
	scene.add( ball );

	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set ( 0, 150, 0 );
	spotLight.shadowCameraNear = 20;
	spotLight.shadowCameraFar = 500;
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

	handleInput();

	if( ballCanMove )
		updateBall();

	renderer.render( scene, camera );
	requestAnimationFrame( render );

}

function updateBall(){

	if( ball.position.x >= (fieldLength/2) - ballRadius ){

		if(  Math.abs(ball.position.z - rightPaddle.position.z) < (paddleWidth/1.5) ){

			ballXVelocity = ballXVelocity * -1;
			ballZVelocity = (rightPaddleVelocity + ballZVelocity)/2;

		}else{

			resetBall();

		}

	}else if( ball.position.x <= ballRadius - (fieldLength/2) ){

		if( Math.abs(ball.position.z - leftPaddle.position.z) < (paddleWidth/1.5) ){

			ballXVelocity = ballXVelocity * -1;
			ballZVelocity = (leftPaddleVelocity + ballZVelocity)/2;

		}else{

			resetBall();

		}

	}

	if( ball.position.z >= (fieldWidth/2) - ballRadius || ball.position.z <= -(fieldWidth/2) + ballRadius )
		ballZVelocity = -ballZVelocity;

	ball.position.x += ballXVelocity;
	ball.position.z += ballZVelocity;

}

function resetBall(){

	ballCanMove = false;

	ballZVelocity = 0;
	ball.position.x = 0;
	ball.position.z = 0;

	setTimeout(function(){ballCanMove = true;}, 3000);

}

function handleInput(){

	updateRightPaddleVelocity();
	updateLeftPaddleVelocity();

	if( rightPaddle.position.z < -(fieldWidth/2) ){

		rightPaddle.position.z = -(fieldWidth/2);
		rightPaddleVelocity = 0;

	}else if( rightPaddle.position.z > (fieldWidth/2) ){

		rightPaddle.position.z = (fieldWidth/2);
		rightPaddleVelocity = 0;

	}else{

		rightPaddle.position.z += rightPaddleVelocity;

	}

	if( leftPaddle.position.z < -(fieldWidth/2) ){

		leftPaddle.position.z = -(fieldWidth/2);
		leftPaddleVelocity = 0;

	}else if( leftPaddle.position.z > (fieldWidth/2) ){

		leftPaddle.position.z = (fieldWidth/2);
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