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

var leftPaddle = new Paddle(-150, true);
var rightPaddle = new Paddle(150, false);

var sideThickness = 10;

var leftScore = 0;
var rightScore = 0;
var leftScoreText;
var rightScoreText;

var aspectRatio = 1.75;

var bounce;
var cheer;

var paused = false;
var muted = false;

var winning = false;

function Paddle( xPosition, AIEnabled ){

	this.maxVelocity = 6;
	this.width = 25;
	this.thickness = 10;

	var paddleGeometry = new THREE.BoxGeometry( this.thickness, 15, this.width );
	var paddleMaterial = new THREE.MeshLambertMaterial({color: 0x222255});

	this.object = new THREE.Mesh( paddleGeometry, paddleMaterial);
	this.object.position.x = xPosition;
	this.object.position.y = 10;
	this.object.castShadow = true;

	this.velocity = 0;

	this.AIEnabled = AIEnabled;
	this.AIWaiting = false;

	this.randomDirection = 1;

}

var Controls = { 

	title:function(){
	},
	leftControls:"WASD",
	rightControls:"Arrow Keys",

	pause:function(){
		paused = !paused;
	},

	mute:function(){
		muted = !muted;
	},

	rightAI:function(){
		rightPaddle.AIEnabled = !rightPaddle.AIEnabled;
	},

	leftAI:function(){
		leftPaddle.AIEnabled = !leftPaddle.AIEnabled;
	},

	maxReactionTime: 500,

	winScore: 5

 }

function init(){

	initGUI();
	initAudio();
	initScene();
	initRenderer();
	initCamera();

	resetBall();

	updateScore( );

	document.body.appendChild( renderer.domElement );
	render();

}

function initGUI(){

	var gui = new dat.GUI();

	gui.add( Controls, 'title' ).name('PONG').domElement.style.pointerEvents = "none"
	gui.add( Controls, 'leftControls' ).name('Left Controls').domElement.style.pointerEvents = "none"
	gui.add( Controls, 'rightControls' ).name('Right Controls').domElement.style.pointerEvents = "none"

	var pauser = gui.add( Controls, 'pause' ).name('Pause').onFinishChange( 
		function(){
			if(paused){
				pauser.name('Unpause');
			}else{
				pauser.name('Pause');
			}
		}
	);
	var muter = gui.add( Controls, 'mute' ).name('Mute').onFinishChange( 
		function(){
			if(muted){
				muter.name('Unmute');
			}else{
				muter.name('Mute');
			}
		}
	);

	gui.add( Controls, 'maxReactionTime').name('AI Reaction Time (ms)');

	var leftAIEnabler = gui.add( Controls, 'leftAI' ).name('Disable Left AI').onFinishChange( 
		function(){
			if(leftPaddle.AIEnabled){
				leftAIEnabler.name('Disable Left AI');
			}else{
				leftAIEnabler.name('Enable Left AI');
			}
		}
	);
	var rightAIEnabler = gui.add( Controls, 'rightAI' ).name('Enable Right AI').onFinishChange( 
		function(){
			if(rightPaddle.AIEnabled){
				rightAIEnabler.name('Disable Right AI');
			}else{
				rightAIEnabler.name('Enable Right AI');
			}
		}
	);

	gui.add( Controls, 'winScore').name('Win Score').min(1);

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

function newCenterText( textContent ){

	var textGeometry = new THREE.TextGeometry( textContent, {
		size: 20,
		height: 20,
		curveSegments: 2
	});

	textGeometry.computeBoundingBox();

	var offset = -0.5 * ( textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x );

	var text = new THREE.Mesh( textGeometry, new THREE.MeshLambertMaterial({color: 0x222255}) );
	text.position.x = offset;
	text.position.y = 30;
	text.position.z = 30;
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

	scene.add( leftPaddle.object );
	scene.add( rightPaddle.object );

}

function initBall(){

	ball = new THREE.Mesh( new THREE.SphereGeometry( ballRadius ), new THREE.MeshLambertMaterial({color: 0x999911}) );
	ball.position.y = 10;
	ball.castShadow = true;
	scene.add( ball );

}

function initLights(){

	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set ( 0, 700, 0 );
	spotLight.intensity = 2;
	spotLight.shadowCameraNear = 1;
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

	if( !paused ){
		updatePaddles();

		if( ballCanMove )
			updateBall();
	}

	requestAnimationFrame( render );

}

function updateScore(){

	if( !winning ){

		if( leftScore >= Controls.winScore)
			win("LEFT");
		else if(rightScore >= Controls.winScore )
			win("RIGHT");

		scene.remove(leftScoreText);
		leftScoreText = newText( "Score: " + leftScore.toString(), -(fieldLength/2) );
		leftScoreText.rotation.y = 0.1;

		scene.remove(rightScoreText);
		rightScoreText = newText( "Score: " + rightScore.toString(), (fieldLength/2) );
		rightScoreText.rotation.y = -0.1;
	}

}

function win( winner ){

	winning = true;
	var mutewas = muted;
	muted = true;

	var numText = newCenterText( winner + " WINS!");
	setTimeout(
		function(){
			muted = mutewas;
			winning = false;
			scene.remove(numText);
			leftScore = 0;
			rightScore = 0;
			updateScore();
			resetBall();
		},
		3000
	);

}

function updateBall(){

	var offsetX = ballRadius + (leftPaddle.thickness/2);
	var offsetZ = ballRadius + (sideThickness/2);

	if( ball.position.x >= (fieldLength/2) - offsetX ){

		if(  Math.abs(ball.position.z - rightPaddle.object.position.z) < (rightPaddle.width/1.5) ){

			ballXVelocity = ballXVelocity * -1;
			ballZVelocity = (rightPaddle.velocity + ballZVelocity)/2;

			rightPaddle.waiting = true;
			setTimeout(
				function(){
					rightPaddle.waiting = false;
					reactionTime(leftPaddle);
					reactionTime(rightPaddle);
				},
				Controls.maxReactionTime * 10
			);

			if( !muted )
				bounce.play();

		}else{

			if( !muted )
				cheer.play();

			leftScore++;
			updateScore();
			if(!winning)
				resetBall();

		}

	}else if( ball.position.x <= offsetX - (fieldLength/2) ){

		if( Math.abs(ball.position.z - leftPaddle.object.position.z) < (leftPaddle.width/1.5) ){

			ballXVelocity = ballXVelocity * -1;
			ballZVelocity = (leftPaddle.velocity + ballZVelocity)/2;

			leftPaddle.waiting = true;
			setTimeout(
				function(){
					leftPaddle.waiting = false;
					reactionTime(leftPaddle);
					reactionTime(rightPaddle);
				},
				Controls.maxReactionTime * 10
			);

			if( !muted )
				bounce.play();

		}else{

			if( !muted )
				cheer.play();

			rightScore++;
			updateScore();
			if(!winning)
				resetBall();

		}

	}

	if( ball.position.z >= (fieldWidth/2) - offsetZ || ball.position.z <= -(fieldWidth/2) + offsetZ ){

		reactionTime(leftPaddle);
		reactionTime(rightPaddle);

		ballZVelocity = -ballZVelocity;

		if( !muted )
			bounce.play();
	}

	ball.position.x += ballXVelocity;
	ball.position.z += ballZVelocity;

}

function resetBall(){

	ballCanMove = false;

	ballZVelocity = 0;
	ball.position.x = 0;
	ball.position.z = (Math.random() - 0.5) * (fieldWidth/2);

	leftPaddle.waiting = true;
	rightPaddle.waiting = true;

	setTimeout(
		function(){
			ballCanMove = true;
			reactionTime(leftPaddle);
			reactionTime(rightPaddle);
		},
		3000
	);

	countdown(3, 1000);

}

function countdown( num, time ){

	if( num > 0 ){

		var numText = newCenterText(num.toString());
		setTimeout(
			function(){
				scene.remove(numText);
				countdown(num-1, time);
			},
			time
		);

	}else{

		var numText = newCenterText("GO!");
		setTimeout(
			function(){
				scene.remove(numText);
			},
			time
		);

	}

}

function updatePaddles(){

	updatePaddleVelocity( rightPaddle, Key.UPARROW, Key.DOWNARROW );
	updatePaddleVelocity( leftPaddle, Key.W, Key.S );

	var offset = (rightPaddle.width/2) + (sideThickness/2);

	updatePaddle( leftPaddle, offset );
	updatePaddle( rightPaddle, offset );

}

function updatePaddle( paddle, offset ){

	if( paddle.object.position.z < -(fieldWidth/2) + offset ){

		paddle.object.position.z = -(fieldWidth/2) + offset;
		paddle.velocity = 0;

	}else if( paddle.object.position.z > (fieldWidth/2) - offset ){

		paddle.object.position.z = (fieldWidth/2) - offset;
		paddle.velocity = 0;

	}else{

		paddle.object.position.z += paddle.velocity;

	}

}

function reactionTime( paddle ){

	paddle.waiting = true;
	setTimeout(
		function(){
			paddle.waiting = false;
		},
		Math.random() * Controls.maxReactionTime
	);

}

function updatePaddleVelocity(paddle, upKey, downKey){

	if( !paddle.AIEnabled )
		paddleHumanControl(paddle, upKey, downKey);
	else
		paddleAIControl(paddle, upKey, downKey);

}

function paddleHumanControl(paddle, upKey, downKey){

	if( Key.isDown(upKey) ){

		if( paddle.velocity < 0 )
			paddle.velocity = 0;

		paddle.velocity = paddle.velocity + ( Math.abs(paddle.velocity) - Math.abs(paddle.maxVelocity) )/2;

	}else if( Key.isDown(downKey) ){

		if( paddle.velocity > 0 )
			paddle.velocity = 0;

		paddle.velocity = paddle.velocity - ( Math.abs(paddle.velocity) - Math.abs(paddle.maxVelocity) )/2;

	}else{

		paddle.velocity = paddle.velocity/2;

	}

}

function paddleAIControl(paddle, upKey, downKey){

	if( !paddle.waiting ){

		// The paddle will move to align itself with the ball
		if( ball.position.z + ballZVelocity * 2 < paddle.object.position.z - (paddle.width/3) ){

			if( paddle.velocity < 0 )
				paddle.velocity = 0;

			paddle.velocity = paddle.velocity + ( Math.abs(paddle.velocity) - Math.abs(paddle.maxVelocity) )/2;

		}else if( ball.position.z + ballZVelocity * 2 > paddle.object.position.z + (paddle.width/3) ){

			if( paddle.velocity > 0 )
				paddle.velocity = 0;

			paddle.velocity = paddle.velocity - ( Math.abs(paddle.velocity) - Math.abs(paddle.maxVelocity) )/2;

		// Once aligned, when the ball gets close, the paddle with move in a randomly chosen direction to make a shot
		}else if( Math.abs(paddle.object.position.x - ball.position.x) < 20 ){

			paddle.velocity = paddle.velocity + ( Math.abs(paddle.velocity) - Math.abs(paddle.maxVelocity) )/2 * paddle.randomDirection;

		// If the ball is not in range, then update the random direction and slow down
		}else{

			paddle.randomDirection =  Math.random() - 0.5;

			paddle.velocity = paddle.velocity/2;

		}

	// If the AI is enabled and is in the reaction time period, slow down.
	}else{
		paddle.velocity = paddle.velocity/2;
	}

}

window.onload = init;