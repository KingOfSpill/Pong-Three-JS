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
var paddleThickness = 10; 

var leftScore = 0;
var rightScore = 0;
var leftScoreText;
var rightScoreText;

var aspectRatio = 1.75;

var bounce;
var mute = false;

function init(){

	initAudio();
	initScene();
	initRenderer();
	initCamera();

	updateScore( );

	document.body.appendChild( renderer.domElement );
	render();

}

function initAudio(){

	// Found here: https://freesound.org/s/325433/
	// Has been modified for this use
	bounce = new Audio('Sounds/pingpongbounce.wav');

	cheer = new Audio('Sounds/crowdcheer.wav');

}

function initScene(){

	scene = new THREE.Scene();

	initArena();
	initPaddles();
	initBall();
	initLights();

}

function newText( textContent, xPosition ){

	var textGeometry = new THREE.TextGeometry( textContent, {
					size: 20,
					height: 20,
					curveSegments: 2
	});

	textGeometry.computeBoundingBox();

	var offset = -0.5 * ( textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x );

	var text = new THREE.Mesh( textGeometry, new THREE.MeshLambertMaterial({color: 0x222255}) );
	text.position.x = offset + xPosition;
	text.position.y = 20;
	text.position.z = -100;
	text.rotation.x = camera.rotation.x;
	text.castShadow = true;
	scene.add( text );

	return text;

}

function initArena(){

	var floor = new THREE.Mesh( new THREE.BoxGeometry( fieldLength, 3, fieldWidth ), new THREE.MeshLambertMaterial({color: 0x225522}) );
	floor.castShadow = true;
	scene.add( floor );

	var sideGeometry = new THREE.BoxGeometry( fieldLength, 15, sideThickness );
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

	var paddleGeometry = new THREE.BoxGeometry( paddleThickness, 15, paddleWidth );
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
	ball.position.y = 10;
	ball.castShadow = true;
	scene.add( ball );

	resetBall();

}

function initLights(){

	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set ( 0, 700, 0 );
	spotLight.shadowCameraNear = 1;
	spotLight.shadowCameraFar = 1000;
	spotLight.castShadow = true;
	scene.add( spotLight );

	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set ( -(fieldLength/2), 150, -(fieldWidth/2) );
	spotLight.shadowCameraFar = 1000;
	spotLight.castShadow = true;
	scene.add( spotLight );

	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set ( (fieldLength/2), 150, -(fieldWidth/2) );
	spotLight.shadowCameraFar = 1000;
	spotLight.castShadow = true;
	scene.add( spotLight );

}

function initRenderer(){

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x000000, 1.0 );

	if( window.innerWidth > window.innerHeight )
		renderer.setSize( window.innerHeight*aspectRatio*.9, window.innerHeight*.9 );
	else
		renderer.setSize( window.innerWidth*.9, window.innerWidth*(1/aspectRatio)*.9 );

	
	renderer.shadowMapEnabled = true;

}

function initCamera(){

	camera = new THREE.PerspectiveCamera( 45, aspectRatio, 0.1, 1000 );
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

function updateScore(){

	scene.remove(leftScoreText);
	leftScoreText = newText( "Score: " + leftScore.toString(), -(fieldLength/2) );
	leftScoreText.rotation.y = 0.1;

	scene.remove(rightScoreText);
	rightScoreText = newText( "Score: " + rightScore.toString(), (fieldLength/2) );
	rightScoreText.rotation.y = -0.1;

}

function updateBall(){

	var offsetX = ballRadius + (paddleThickness/2);
	var offsetZ = ballRadius + (sideThickness/2);

	if( ball.position.x >= (fieldLength/2) - offsetX ){

		if(  Math.abs(ball.position.z - rightPaddle.position.z) < (paddleWidth/1.5) ){

			ballXVelocity = ballXVelocity * -1;
			ballZVelocity = (rightPaddleVelocity + ballZVelocity)/2;
			if( !mute )
				bounce.play();

		}else{

			cheer.play();
			leftScore++;
			updateScore();
			resetBall();

		}

	}else if( ball.position.x <= offsetX - (fieldLength/2) ){

		if( Math.abs(ball.position.z - leftPaddle.position.z) < (paddleWidth/1.5) ){

			ballXVelocity = ballXVelocity * -1;
			ballZVelocity = (leftPaddleVelocity + ballZVelocity)/2;
			if( !mute )
				bounce.play();

		}else{

			cheer.play();
			rightScore++;
			updateScore();
			resetBall();

		}

	}

	if( ball.position.z >= (fieldWidth/2) - offsetZ || ball.position.z <= -(fieldWidth/2) + offsetZ ){
		ballZVelocity = -ballZVelocity;
		bounce.play();
	}

	ball.position.x += ballXVelocity;
	ball.position.z += ballZVelocity;

}

function resetBall(){

	ballCanMove = false;

	ballZVelocity = 0;
	ball.position.x = 0;
	ball.position.z = (Math.random() - 0.5) * (fieldWidth - (ballRadius - (sideThickness/2)));

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