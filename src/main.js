import kaboom from "kaboom";

//initialize
kaboom();

//loading 2D graphics/objects
loadSprite("bird", "sprites/bird.png");
loadSprite("bg", "sprites/bg.png");
loadSprite("pipe", "sprites/pipe.png");

//loading sounds
loadSound("jump", "sounds/jump.mp3");
loadSound("bruh", "sounds/bruh.mp3");
loadSound("pass", "sounds/pass.mp3");

let highScore=0; //to keep track of highscore

//There will be 2 scenes
//1. Game scene while playing
scene("game", () => {
	const PIPE_GAP=140; //gap between the pipe above and below
	let score=0; //to keep track of score throughout the game
	setGravity(1600); //bird goes down if we do not jump

	//adding background on entire screen
	add([
		sprite("bg", {width: width(), height: height()})
	]);

	//to display score in top left coorner (12 pixels away from each axis)
	const scoreText=add([text(score), pos(12, 12)]);

	//adding player
	const player=add([
		sprite("bird"),
		scale(1.2), //make the bird little larger
		pos(100, 50), //position of bird
		area(), //to determine collisons
		body(), //so that bird will be affected by gravity
	]);

	//creating pipes
	function createPipes(){
		const offset=rand(-50, 50); //to vary the length of pipes

		//bottom pipe
		add([
			sprite("pipe"),
			pos(width(), height()/2 + offset + PIPE_GAP/2), //pipes will be zig-zag 
			"pipe", //name
			scale(2),
			area(),
			{passed:false} //can be added to either bottom or top pipe
		]);

		//top pipe
		add([
			sprite("pipe", {flipY:true}), //flip on y axis 
			pos(width(), height()/2 + offset - PIPE_GAP/2),
			"pipe",
			anchor("botleft"), //by default it is top left in kaboom
			scale(2),
			area()
		]);
	}

	loop(1.5, () => createPipes()); //pipe will come after every 1.5 second

	onUpdate("pipe", (pipe) => {
		pipe.move(-300, 0); //because pipes are created at end of screen due to full width 

		//if player passes the pipe
		if(pipe.passed === false && pipe.pos.x<player.pos.x){
			pipe.passed=true;
			score+=1; 
			scoreText.text=score;
			play("pass"); 
		}
	});

	//if bird collides with the pipe
	player.onCollide("pipe", () => {
		const ss=screenshot(); //take screenshot
		go("gameover", score, ss);
	});

	//if player exceeds height of screen or hits the ground
	player.onUpdate(() => {
		if(player.pos.y>height()){
			const ss=screenshot();
			go("gameover", score, ss);
		}
	})

	//jump functionality to bird
	//space for desktop
	onKeyPress("space", () => {
		play("jump");
		player.jump(400);
	});

	//touch for phone
	window.addEventListener("touchstart", () => {
		play("jump");
		player.jump(400);
	});
});

//2. Game-Over scene after losing
scene("gameover", (score, screenshot) => {
	if(score>highScore) highScore=score;

	play("bruh");

	loadSprite("gameOverScreen", screenshot); //load gameover screen
	add([sprite("gameOverScreen", {width:width(), height:height()} )]);

	add([
		text("GAME OVER!\n" + "Score:" + score + "\nHigh Score:" + highScore + "\nPress SPACEBAR to play again", {size:35}),
		pos(width()/2, height()/3)
	]);

	onKeyPress("space", () => {
		go("game");
	}); //game starts again
});

//Start the game
go("game");