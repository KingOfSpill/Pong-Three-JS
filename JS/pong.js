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
var cheer;

var paused = false;
var muted = false;
var rightAIEnabled = false;
var leftAIEnabled = true;
var leftRandomDir = 1;
var rightRandomDir = 1;
var leftWaiting = false;
var rightWaiting = false;

var winning = false;

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
		rightAIEnabled = !rightAIEnabled;
	},

	leftAI:function(){
		leftAIEnabled = !leftAIEnabled;
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
			if(leftAIEnabled){
				leftAIEnabler.name('Disable Left AI');
			}else{
				leftAIEnabler.name('Enable Left AI');
			}
		}
	);
	var rightAIEnabler = gui.add( Controls, 'rightAI' ).name('Enable Right AI').onFinishChange( 
		function(){
			if(rightAIEnabled){
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

	var offsetX = ballRadius + (paddleThickness/2);
	var offsetZ = ballRadius + (sideThickness/2);

	if( ball.position.x >= (fieldLength/2) - offsetX ){

		if(  Math.abs(ball.position.z - rightPaddle.position.z) < (paddleWidth/1.5) ){

			ballXVelocity = ballXVelocity * -1;
			ballZVelocity = (rightPaddleVelocity + ballZVelocity)/2;

			rightWaiting = true;
			setTimeout(
				function(){
					rightWaiting = false;
					reactionTime();
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

		if( Math.abs(ball.position.z - leftPaddle.position.z) < (paddleWidth/1.5) ){

			ballXVelocity = ballXVelocity * -1;
			ballZVelocity = (leftPaddleVelocity + ballZVelocity)/2;

			leftWaiting = true;
			setTimeout(
				function(){
					leftWaiting = false;
					reactionTime();
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

		reactionTime();

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

	leftWaiting = true;
	rightWaiting = true;

	setTimeout(
		function(){
			ballCanMove = true;
			reactionTime();
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

	updateRightPaddleVelocity();
	updateLeftPaddleVelocity();

	var offset = (paddleWidth/2) + (sideThickness/2);

	updateLeftPaddle( offset );
	updateRightPaddle( offset );

}

function updateLeftPaddle( offset ){

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

function updateRightPaddle( offset ){
	if( rightPaddle.position.z < -(fieldWidth/2) + offset ){

		rightPaddle.position.z = -(fieldWidth/2) + offset;
		rightPaddleVelocity = 0;

	}else if( rightPaddle.position.z > (fieldWidth/2) - offset ){

		rightPaddle.position.z = (fieldWidth/2) - offset;
		rightPaddleVelocity = 0;

	}else{

		rightPaddle.position.z += rightPaddleVelocity;

	}
}

function reactionTime(){

	leftWaiting = true;
	setTimeout(
		function(){
			leftWaiting = false;
		},
		Math.random() * Controls.maxReactionTime
	);

	rightWaiting = true;
	setTimeout(
		function(){
			rightWaiting = false;
		},
		Math.random() * Controls.maxReactionTime
	);	

}

function updateRightPaddleVelocity(){

	if( !rightAIEnabled ){	
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
	}else if( !rightWaiting ){

		// The paddle will move to align itself with the ball
		if( ball.position.z + ballZVelocity * 2 < rightPaddle.position.z - (paddleWidth/3) ){

			if( rightPaddleVelocity < 0 )
				rightPaddleVelocity = 0;

			rightPaddleVelocity = rightPaddleVelocity + ( Math.abs(rightPaddleVelocity) - Math.abs(paddleMaxVelocity) )/2;

		}else if( ball.position.z + ballZVelocity * 2 > rightPaddle.position.z + (paddleWidth/3) ){

			if( rightPaddleVelocity > 0 )
				rightPaddleVelocity = 0;

			rightPaddleVelocity = rightPaddleVelocity - ( Math.abs(rightPaddleVelocity) - Math.abs(paddleMaxVelocity) )/2;

		// Once aligned, when the ball gets close, the paddle with move in a randomly chosen direction to make a shot
		}else if( Math.abs(rightPaddle.position.x - ball.position.x) < 20 ){

			rightPaddleVelocity = rightPaddleVelocity + ( Math.abs(rightPaddleVelocity) - Math.abs(paddleMaxVelocity) )/2 * rightRandomDir;

		// If the ball is not in range, then update the random direction and slow down
		}else{

			rightRandomDir =  Math.random() - 0.5;

			rightPaddleVelocity = rightPaddleVelocity/2;

		}
	// If the AI is enabled and is in the reaction time period, slow down.
	}else{
		rightPaddleVelocity = rightPaddleVelocity/2;
	}

}

function updateLeftPaddleVelocity(){

	if( !leftAIEnabled ){

		
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

	}else if( !leftWaiting ){

		// The paddle will move to align itself with the ball
		if( ball.position.z + ballZVelocity * 2 < leftPaddle.position.z - (paddleWidth/3) ){

			if( leftPaddleVelocity < 0 )
				leftPaddleVelocity = 0;

			leftPaddleVelocity = leftPaddleVelocity + ( Math.abs(leftPaddleVelocity) - Math.abs(paddleMaxVelocity) )/2;

		}else if( ball.position.z + ballZVelocity * 2 > leftPaddle.position.z + (paddleWidth/3) ){

			if( leftPaddleVelocity > 0 )
				leftPaddleVelocity = 0;

			leftPaddleVelocity = leftPaddleVelocity - ( Math.abs(leftPaddleVelocity) - Math.abs(paddleMaxVelocity) )/2;

		// Once aligned, when the ball gets close, the paddle with move in a randomly chosen direction to make a shot
		}else if( Math.abs(leftPaddle.position.x - ball.position.x) < 20 ){

			leftPaddleVelocity = leftPaddleVelocity + ( Math.abs(leftPaddleVelocity) - Math.abs(paddleMaxVelocity) )/2 * leftRandomDir;

		// If the ball is not in range, then update the random direction and slow down
		}else{

			leftRandomDir =  Math.random() - 0.5;

			leftPaddleVelocity = leftPaddleVelocity/2;

		}
	// If the AI is enabled and is in the reaction time period, slow down.
	}else{
		leftPaddleVelocity = leftPaddleVelocity/2;
	}

}

window.onload = init;