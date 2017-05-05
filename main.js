var startScreen = (function(input) {

    // the red component of rgb
    var hue = 0; 
    // are we moving toward red or black?
    var direction = 1; 
    var transitioning = false;

    // record the input state from last frame
    // because we need to compare it in the
    // current frame
    var wasButtonDown = false;

    // a helper function
    // used internally to draw the text in
    // in the center of the canvas (with respect
    // to the x coordinate)
    function centerText(ctx, text, y) {
        var measurement = ctx.measureText(text);
        var x = (ctx.canvas.width - measurement.width) / 2;
        ctx.fillText(text, x, y);
    }
    
    // draw the main menu to the canvas
    function draw(ctx, elapsed) {
        
        // let's draw the text in the middle of the canvas
        // note that it's ineffecient to calculate this 
        // in every frame since it never changes 
        // however, I leave it here for simplicity
        var y = ctx.canvas.height / 2;
        
        // create a css color from the `hue`
        var color = 'rgb(' + hue + ',0,0)';
        
        // clear the entire canvas
        // (this is not strictly necessary since we are always
        // updating the same pixels for this screen, however it
        // is generally what you need to do.)
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // draw the title of the game
        // this is static and doesn't change
        ctx.fillStyle = 'white';
        ctx.font = '48px monospace';
        centerText(ctx, 'My Awesome Game', y);

        // draw instructions to the player
        // this animates the color based on the value of `hue`
        ctx.fillStyle = color;
        ctx.font = '24px monospace';
        centerText(ctx, 'click to begin', y + 30);
    }

    // update the color we're drawing and
    // check for input from the user
    function update() {
        // we want `hue` to oscillate between 0 and 255
        hue += 1 * direction;
        if (hue > 255) direction = -1;
        if (hue < 0) direction = 1;
        
        // note that this logic is dependent on the frame rate,
        // that means if the frame rate is slow then the animation
        // is slow. 
        // we could make it indepedent on the frame rate, but we'll 
        // come to that later.

        // here we magically capture the state of the mouse
        // notice that we are not dealing with events inside the game
        // loop.
        // we'll come back to this too.
        var isButtonDown = input.isButtonDown();

        // we want to know if the input (mouse click) _just_ happened
        // that means we only want to transition away from the menu to the
        // game if there _was_ input on the last frame _but none_ on the 
        // current one.
        var mouseJustClicked = !isButtonDown && wasButtonDown;

        // we also check the value of `transitioning` so that we don't 
        // initiate the transition logic more the once (like if the player
        // clicked the mouse repeatedly before we finished transitioning)
        if (mouseJustClicked && !transitioning) {
            transitioning = true;
            // do something here to transition to the actual game
        }

        // record the state of input for use in the next frame
        wasButtonDown = isButtonDown;
    }

    // this is the object that will be `startScreen`
    return {
        draw: draw,
        update: update
    };

}());


//Creat our 'main' state that will contain the game
var mainState = {
	preload: function() {
		//This function will be executed at the beginning
		//That's where we load the images and sound
		
		//Load the bird sprite
		game.load.image('bird', 'assets/bird.png');
		game.load.image('pipe', 'assets/pipe.png');
	},
	
	create: function() {
		//This function is called after the preload function
		//Here we setup the game, display sprites, etc.
		
		//Change the background colour of the game to blue - for now!
		game.stage.backgroundColor = '#71c5cf';
		
		//Set the physics for the game
		game.physics.startSystem(Phaser.Physics.ARCADE);
		
		//Display the bird at the position of x=100 and y=245
		this.bird = game.add.sprite(100, 245, 'bird');
		
		//Add the physics to the bird
		//Needed for: movement, gravity, collisions, etc.
		game.physics.arcade.enable(this.bird);
		
		//Add gravity to the bird to make it fall
		this.bird.body.gravity.y = 1000;
		
		//Call 'jump' function when the spacebar is pressed
		var spaceBar = game.input.keyboard.addKey(
						Phaser.Keyboard.SPACEBAR);
		spaceBar.onDown.add(this.jump, this);
		
		//Create an empty group
		this.pipes = game.add.group();
		
		//Timer for pipes
		this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);
        
        //Score

        this.score = 0;

        this.labelScore = game.add.text(20, 20, "0",

        { font: "30px Arial", fill: "#000" });   
	},
	
	update: function() {
		//This function is called 60 times per second
		//It contains the games logic
		
		//Call the 'restartGame' function
		if (this.bird.y <0 || this.bird.y > 490)
			this.restartGame();
	},
	
	jump: function() {
		//Add a vertical velocity to the bird
		this.bird.body.velocity.y = -350;
        
        // Slowly rotate the bird downward, up to a certain point

    if (this.bird.angle < 20)

    this.bird.angle += 1;
        
        // Create an animation on the bird

        var animation = game.add.tween(this.bird);

        // Change the angle of the bird to -20° in 100 milliseconds

        animation.to({angle: -20}, 125);
        animation.to({angle: +0}, 175);
        // And start the animation

        animation.start();
	},
	
	//Restart the game
	restartGame: function() {
		//Start the 'main' state, which restarts the game
	game.state.start('main');
	},
	
	//Add a pipe
	addOnePipe: function(x, y) {
		//Create a pipe at the position x and y
		var pipe = game.add.sprite(x, y, 'pipe');
		
		//Add pipe to group
		this.pipes.add(pipe);
		
		//Enable the physics on the pipe
		game.physics.arcade.enable(pipe);
		
		//Add velocity to the pipe to make it move left
		pipe.body.velocity.x = -200;
		
		//Automatically kill pipe when it is not longer visible
		pipe.checkWorldBounds = true;
		pipe.outOfBoundsKill = true;
        
        //calls the restartGame function each time the bird dies

        game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame,

        null, this);
	},
	
	//Many pipes
	addRowOfPipes: function() {
		//Randomly pick a number between 1 and 5
		//This will be the hole position in the pipe
		var hole = Math.floor(Math.random() * 5) + 1;
		
		//Add 6 pipes
		for (var i = 0; i < 8; i++)
			if (i != hole && i != hole +1)
				this.addOnePipe(400, i * 60 + 10);
        
        //Increases score as new pipes are created

        this.score += 1;

        this.labelScore.text = this.score;
	},
};

//Initialise Phaser, and create a 400px x 490px game
var game = new Phaser.Game(400, 490);

//Add the 'mainState' and call it 'main'
game.state.add('main', mainState);

//Start the state to actually start the game
game.state.start('main');