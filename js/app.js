// ___________________________________________________
// VARIABLES

/* mob is checked every time the window loads or is resized and is used
to inform other functions when the viewport is below a certain pixel width.
Control is used to allow or disallow movement of the player character. */
let mob = false;
let control = false;

/* If the player object reaches the 'door' area in the game window:
level is incemented by 1 and the value of speed is increased. This enforces 
an increase in difficulty. The higher the level, the faster the traps. */
let level = 1;
let speed = 50;

/* sx stands for 'Source X' and is used to move laterally across 
sprite sheets to give the impression of animation. */
let sx = 0;

/* The traps array will be populated by three trap objects,
the trapTypes array contains a list of different images that will
be picked from at random whenever a new trap object is made.
trapsOn pauses or unpauses trap movement. */
let traps = [];
const trapTypes = [
    'images/trap-fire.png',
    'images/trap-poison.png',
    'images/trap-lightning.png',
    'images/trap-ice.png',
    'images/trap-spear.png',
    'images/trap-saw.png',
];
let trapsOn = true;

const container = document.querySelector('.container');
const levelCount = document.querySelector('.lvl-count');

const titleOverlay = document.querySelector('.title-overlay');
const titleCont = document.querySelector('.title-container');
const start = document.querySelector('.start');

const overlay = document.querySelector('.overlay');
const overlayImg = document.querySelector('.overlay-image');
const overlayMsg = document.querySelector('.msg');
const playAgain = document.querySelector('.play-again');

const controlPad = document.querySelector('.control-pad');
const up = document.querySelector('.up');
const down = document.querySelector('.down');
const left = document.querySelector('.left');
const right = document.querySelector('.right');

// ___________________________________________________
// SPRITE OBJECT:
// The parent prototype of all player & trap objects

/*
The Sprite constructor is used to assign an image, an X and a Y coordinate
to new objects as they are created. This function is called by the Trap
and Player constructor functions. */ 
const Sprite = function(x, y) {  
    this.sprite = null;
    this.x = x;
    this.y = y;
};

/* The render method draws the player and trap objects on the canvas.
Note that, when drawing to the canvas, the first coordinate is set to sx, 
changing the value of sx allows us to move across all sprite sheets. */
Sprite.prototype.render = function() {
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(Resources.get(this.sprite), sx, 0, 100, 170, this.x, this.y, this.width, this.height);
};

/* This method returns true whenever two or more sprites come into contact. */
Sprite.prototype.collisionDetection = function(sprite) {
    let sx = sprite.x - this.x;
    let sy = sprite.y - this.y;
    let prox = Math.sqrt(sx * sx + sy * sy);
    if (mob) {
        if (prox < 25) {
            return true;
        } else {
            return false;
        }
    } else {
        if (prox < 60) {
            return true;
        } else {
            return false;
        }
    }
};

// ___________________________________________________
// TRAP OBJECT:
// Generates moving enemies for the game

/* The Trap constructor calls Sprite, picks a random display image
from the trapTypes array and sets a random speed value */
const Trap = function(x,y) {
    Sprite.call(this, x,y);
    this.sprite = trapTypes[Math.floor((Math.random() * trapTypes.length))];
    this.speed = Math.floor((Math.random() * 400) + speed);
};

Trap.prototype = Object.create(Sprite.prototype);
Trap.constructor = Trap;

/* This update method is called on every game tick and updates all trap
objects with new coordinates, simulating movement. This method is also used 
to reset a trap's X value after it exceeds the width of the game window and to 
resize all trap objects depending on whether or not the mob variable evaluates 
to true. Notice that the speed attribute of each trap object is set to a random 
number + the value of the speed variable. Changing the value of the speed variable
allows us to increase the game's difficulty. Speed is lowered if mob is true.*/
Trap.prototype.update = function(dt) {
    t = this;
    if (trapsOn) {
        t.x += (t.speed * dt);
        if (mob) {
            if (t.x > container.offsetWidth) {
                t.x = -100;
                t.speed = Math.floor((Math.random() * 300) + speed/2);
            }
            t.width = 50;
            t.height = 85;
            traps[0].y = 45;
            traps[1].y = 90;
            traps[2].y = 135;
        } else {
            t.width = 100;
            t.height = 170;
            traps[0].y = 70;
            traps[1].y = 150;
            traps[2].y = 240;
            if (t.x > container.offsetWidth) {
                t.x = -100;
                t.speed = Math.floor((Math.random() * 400) + speed);
            }      
        }
    }
};

/* This function adds three trap objects to the traps array. It provides a
static Y coordinate and a random X coordinate. */
Trap.generateTraps = function() {
    traps[0] = new Trap(((Math.random() * container.offsetWidth)), 70);
    traps[1] = new Trap(((Math.random() * container.offsetWidth)), 150);
    traps[2] = new Trap(((Math.random() * container.offsetWidth)), 240);
    return traps;
};

// ___________________________________________________
// PLAYER OBJECT:
// Generates the player character

/* The Player constructor calls Sprite and provides an image for the player character. */
const Player = function(x, y) {
    Sprite.call(this, x, y);
    this.sprite = "images/char-knight.png";
};

Player.prototype = Object.create(Sprite.prototype);
Player.prototype.constructor = Player;

/* The Player object's update method runs on every game tick. It checks for collisions
and resizes the player character if mob equals true. */
Player.prototype.update = function() {
    p = this;
    p.checkCollision();

    if (mob) {
       p.width = 50;
       p.height = 85;
    } else {
       p.width = 100;
       p.height = 170;       
    }
};

/* This method listens out for key presses (arrow keys) and alters the player object's
X and Y coordinates accordingly. The increase or decrease in X and Y values change
depending on whenther mob is true. Each keypress (other than down) runs the nextLevel();
function that resets the player and trap objects and increments the level count.
If control evaluates as false, no input will be accepted.  */
Player.prototype.handleInput = function(key) {  
    if (mob && control) {   
        switch (key) {
            case "left":
                if (this.x > 0) {
                    this.x -= 15;
                    nextLevel();
                }
                break;
            case "up":
                if (this.y > 0) {
                    this.y -= 15;
                    nextLevel();
                }
                break;
            case "right":
                if (this.x < 270) {
                    this.x += 15;
                    nextLevel();
                }
                break;
            case "down":
                if (this.y < 240) {
                    this.y += 15;
                }
                break;
        }
    } else if (control) {
        switch (key) {
            case "left":
                if (this.x > 0) {
                    this.x -= 25;
                    nextLevel();
                }
                break;
            case "up":
                if (this.y > 0) {
                    this.y -= 25;
                    nextLevel();
                }
                break;
            case "right":
                if (this.x < 500) {
                    this.x += 25;
                    nextLevel();
                }
                break;
            case "down":
                if (this.y < 450) {
                    this.y += 25;
                }
                break;
        }
    }
};

/* This function is called in the player object's update method. It loops through all traps
and if the collisionDetection method (on the sprite prototype) evaluates as true, it calls 
the gameOver(); funtion and passes in the specific trap object that has been collided with. */
Player.prototype.checkCollision = function() {
    for (let i = 0; i < allEnemies.length; i++) {
        if (this.collisionDetection(allEnemies[i])) {
            gameOver(allEnemies[i].sprite);
            return true;
        }
    }
    return false;
};

/* This function is used to reset the player character's X and Y 
coordinates depending on whether or not mob evaluates to true. */
function reposition() {
    if (mob) {
        player.x = 135;
        player.y = 240;
    } else {
        player.x = 250;
        player.y = 450;
    }
}

// ___________________________________________________
// ADVANCING THROUGH THE GAME:
// These functions handle level increase, difficulty, game over and endgame states.

/* The gameOver function is called whenever a collision has been detected. It takes in
a single trap object as an argument, checks the sprite attribute of said trap object
and populates the overlay-image element with a corresponding png file. It also sends 
the player character far offscreen and disables control.*/
function gameOver(sprite) {
    if (sprite === trapTypes[0]) {
        overlayImg.src = 'images/roasted.png'
    } else if (sprite === trapTypes[1]) {
        overlayImg.src = 'images/poisoned.png'
    } else if (sprite === trapTypes[2]) {
        overlayImg.src = 'images/zapped.png'
    } else if (sprite === trapTypes[3]) {
        overlayImg.src = 'images/iced.png'
    } else if (sprite === trapTypes[4]) {
        overlayImg.src = 'images/skewered.png'
    } else if (sprite === trapTypes[5]) {
        overlayImg.src = 'images/cleaved.png'
    }

    setTimeout(function() {
        overlayImg.style.cssText = 'opacity: 1'
    }, 300)

    player.y = -1000;
    overlay.style.cssText = 'visibility: visible; opacity: 1'
    control = false;
}

/* The nextLevel function checks the player character's current X and Y coordinates
and performs either the fade(); or end(); functions respectively providing that the
player charcter has moved over the 'door area' on screen. */
function nextLevel() {
    if (mob) {    
        if (player.y === 0 && player.x === 135 && level >= 10) {
            end();
        } else if (player.y === 0 && player.x === 135) {
            fade();
        }
    } else {
        if (player.y === 0 && player.x === 250 && level >= 10) {
            end();
        } else if (player.y === 0 && player.x === 250) {
            fade();
        }
    }

    /* The fade(); function briefly lowers the game window's opacity for the purpose of
    displaying a transition effect between levels. Whilst the game window's opacity is at 0 
    this function resets the position of the player character, generates a new set of traps,
    increments the level count and increases the value of the speed variable.
    */
    function fade() {
        container.style.cssText = 'opacity: 0'
        setTimeout(function() {
            allEnemies = Trap.generateTraps();
            reposition();
            level++;
            levelCount.innerHTML = `Level: ${level}`
            speed += 25;
        }, 300);

        setTimeout(function() {
            container.style.cssText = 'opacity: 1'
        }, 500)
    }

    /* The end(); function is only called if the player character moves over the 'door area' 
    on screen AND the level count is at least 10. It populates the popup element's contents
    with a celebratory image and an endgame message. It also reveals a hidden 'treasure room'
    image (.end) for a brief moment before presenting the endgame overlay.
    */
    function end() {
        if (level >= 10) {
            overlayImg.style.cssText = 'opacity: 1'
            overlayImg.src = 'images/win.png'
            container.style.cssText = 'opacity: 0'
            controlPad.style.cssText = 'opacity: 0'
            overlayMsg.style.cssText = 'margin-bottom: 0.8em;'
            overlayMsg.innerHTML = 'Congratulations! Good luck getting it all out of here...'

            setTimeout(function() {
                e = document.querySelector('.end');
                control = false;
                trapsOn = false;
                traps[0].x = -100;
                traps[1].x = -100;
                traps[2].x = -100;
                reposition();
                levelCount.innerHTML = ''
                e.style.cssText = 'opacity: 1'
            }, 300);

            setTimeout(function() {
                container.style.cssText = 'opacity: 1'
            }, 500)

            setTimeout(function() {
                overlay.style.cssText = 'visibility: visible; opacity: 1'
            }, 2200);
        } 
    }
}

// ___________________________________________________
// CREATING THE PLAYER AND TRAP OBJECTS:
// These two variables initiate the game by instantiating the player and trap objects.

let allEnemies = Trap.generateTraps();

const player = new Player(250, 450);

// ___________________________________________________
// EVENT LISTENERS - CONTROLING THE CHARACTER:
// The following event listeners handle player input.

/* Listens for key presses and passes them into the handleInput(); 
method on the player object's prototype. */
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});

/* The following four event listeners are linked to the four arrow images that 
exist within the 'control-pad' element. They handle movement of the player character
in the same way as the the handleInput(); method on the player object's prototype.*/
up.addEventListener('click', function() {
    if (mob && control) {
        if (player.y > 0) {
            player.y -= 15;
            nextLevel();
        }
    } else if (control) {
        if (player.y > 0) {
            player.y -= 25;
            nextLevel();
        }
    }
});

down.addEventListener('click', function() {
    if (mob && control) {
        if (player.y < 240) {
            player.y += 15;
        }
    } else if (control) {
        if (player.y < 450) {
            player.y += 25;
        }
    }
});

left.addEventListener('click', function() {
    if (mob && control) {
        if (player.x > 0) {
            player.x -= 15;
            nextLevel();
        }
    } else if (control) {
        if (player.x > 0) {
            player.x -= 25;
            nextLevel();
        }
    }
});

right.addEventListener('click', function() {
    if (mob && control) {
        if (player.x < 270) {
            player.x += 15;
            nextLevel();
        }
    } else if (control) {
        if (player.x < 500) {
            player.x += 25;
            nextLevel();
        }
    }
});

// ___________________________________________________
// EVENT LISTENERS - STARTING & RESTARTING:
// These event listeners handle loading and reseting the game.

/* This event listener is bound to the 'start' element on the 
title screen. Clicking on 'Start' will remove the 'title-overlay' 
element from view and begin the game. */
start.addEventListener('click', function() {

    titleOverlay.style.cssText = 'visibility: hidden; opacity: 0'
    titleCont.style.cssText = 'visibility: hidden; opacity: 0'

    setTimeout(function() {
        container.style.cssText = 'opacity: 1'
        control = true;
    }, 400) 
});

/* The playAgain event listener activates when the 'play-again' element is clicked.
It resets the position of the player, resets the speed, generates a new set of 
traps and sets the level count back to one. It uses a similar technique to the 
fade(); function, manipulating opacity to display a transition effect. */
playAgain.addEventListener('click', function reset() {
    container.style.cssText = 'opacity: 0'

    setTimeout(function(){
        e = document.querySelector('.end');
        e.style.cssText = 'opacity: 0'
        overlay.style.cssText = 'visibility: hidden; opacity: 0'
        controlPad.style.cssText = 'opacity: 1'
        allEnemies = Trap.generateTraps();
        trapsOn = true;
        reposition();
        level = 1;
        levelCount.innerHTML = `Level: ${level}`
        speed = 50;
        control = true;
    }, 300);

    setTimeout(function() {
        overlayImg.src = '#'
        overlayImg.style.cssText = 'opacity: 0'
        container.style.cssText = 'opacity: 1'
        overlayMsg.style.cssText = 'margin-bottom: 0;'
        overlayMsg.innerHTML = ''
    }, 500)
});

/* These next two event listeners handle sizing of the game window. The canvas
upon which the game is drawn is created by the game engine and is appended to the 
'container' HTML element. On every game tick, the canvas is instructed to match the 
dimentions of the container element, which changes size depending on media query 
breakpoints in the corresponding css style sheet. This means that the canvas will 
always match the width and height of the container. The first event listener here
checks, on page load, whether the container's pixel width is less than 480 pixels
- if this is true, then the mob variable is set to true and informs many of the
games functions in regard to object positioning and size. It also uses the 
reposition(); function to ensure the player is in correct position.*/
window.addEventListener('load', function() {

    if (container.offsetWidth < 480) {
        mob = true;
    } else {
        mob = false;
    }

    reposition();
});

/* This event listener checks the container's width every time the window 
is resized and will set mob to equal true, if the resize results in an 
overall viewport width of less than 480 pixels. It then uses the reposition(); 
function to ensure the player is in correct position at all times.*/ 
window.addEventListener('resize', function() {

    if (container.offsetWidth < 480) {
        mob = true;
    } else {
        mob = false;
    }

    reposition();
});

// ___________________________________________________
// ANIMATING THE SPRITESHEETS:
// This very simple function handles the game's animation.

/* Seeing as each time an object is drawn to the canvas, it's source X 
attribute is set to reflect the value of the sx variable: all that need be done 
to scroll across ALL sprite sheets, is to invoke an interval function which 
increases the value of sx by an amount equal to the width of a single frame 
(which in this case is 100 pixels). This interval function does just that 
- it advances the X coordinate on every sprite sheet by 1 frame's worth 
every 200 milliseconds and resets the value to 0 once it exceeds 
the total width of a sprite sheet, looping endlessly. */
setInterval(function animation(){
    sx += 100;

    if (sx >= 400) {
        sx = 0;
    }
}, 200);
