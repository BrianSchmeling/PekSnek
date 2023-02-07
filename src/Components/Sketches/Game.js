import vLines from "../../data/vLines.json"; // importing vertical walls
import hLines from "../../data/hLines.json";

let score = 0;
let maxLength = 30;

const sketch = (p) => {
  // the snake is divided into small segments, which are drawn and edited on each 'draw' call
  let numSegments = 10;
  let direction = "right";

  const shuffledVLines = p.shuffle(vLines); // randomizes the order of wall generation
  const shuffledHLines = p.shuffle(hLines);

  const xStart = 20; //starting x coordinate for snake
  const yStart = 20;
  const diff = 10;

  let verticalLines = []; // array to hold the walls as they appear on the map
  let horizontalLines = [];

  let fruitLocations = [{ startY: 50, startX: 50 }];

  const white = p.color(0, 0, 0);
  const black = p.color(255, 255, 255);
  const red = p.color(255, 0, 0);
  const green = p.color(0, 128, 0);
  const gray = p.color(20);
  const colors = [white, black, red, green, gray];

  const magenta = p.color(255, 0, 255);
  const blue = p.color(0, 0, 255);
  const yellow = p.color(255, 255, 0);
  const lime = p.color(0, 255, 0);
  const boostColors = [blue, magenta, yellow, lime];
  let randomBoostColor;

  let xCor = []; // holds the array the controls where the snake appears on the map
  let yCor = [];

  let xBoost = 0; // location boost items will appear on the map
  let yBoost = 0;

  let vCounter = 0; // keeps track of how man walls have been built
  let hCounter = 0;
  let alternate = true; // alternates betweens vertical and horizontal walls being build

  let xFruit = null; // location fruit will appear on the map
  let yFruit = null;
  let loseMessage;
  let speed = 10;

  let scoreElem; // will hold a created <div> showing the score

  p.setup = () => {
    p.createCanvas(1000, 500);
    p.frameRate(speed);
    // updateFruitCoordinates();
    randomBoostColor = Math.floor(Math.random() * boostColors.length); // random fruit location
    updateBoostCoordinates(); // random boost location
    for (let i = 0; i < numSegments; i++) {
      xCor.push(xStart + i * diff);
      yCor.push(yStart);
    }
  };

  p.draw = () => {
    drawScore();

    p.background(colors[0]);

    // draws out an outline of where walls will eventually appear
    vLines.map((line) => {
      p.stroke(colors[4]);
      p.strokeWeight(10);
      p.rect(line.startX, line.startY, 0, line.size);
    });
    hLines.map((line) => {
      p.stroke(colors[4]);
      p.strokeWeight(10);
      p.rect(line.startX, line.startY, line.size, 0);
    });

    // draws the snake
    for (let i = 0; i < numSegments - 1; i++) {
      p.stroke(colors[1]);
      p.strokeWeight(10);
      p.line(xCor[i], yCor[i], xCor[i + 1], yCor[i + 1]);
    }

    if (xFruit === null) {
      updateFruitCoordinates();
    }

    updateSnakeCoordinates();
    // checkGameStatus();
    checkForFruit();
    checkForBoost();
    keyPressed();

    // controls the speed at which walls appear on the map, this is slightly longer than 1 second
    if (p.frameCount % 15 === 0) {
      drawWall();
    }

    if (p.frameCount % 15 === 0 && xBoost === null) {
      console.log("chance");
      if (Math.floor(Math.random() * 60) === 0) {
        console.log("taken");
        randomBoostColor = Math.floor(Math.random() * boostColors.length);
        updateBoostCoordinates();
      }
    }

    //draws out the walls as they are pushed into the array that contains them
    if (verticalLines.length > 0) {
      verticalLines.map((line) => {
        p.stroke(colors[2]);
        p.strokeWeight(10);
        p.rect(line.startX, line.startY, 0, line.size);
      });
    }
    if (horizontalLines.length > 0) {
      horizontalLines.map((line) => {
        p.stroke(colors[2]);
        p.strokeWeight(10);
        p.rect(line.startX, line.startY, line.size, 0);
      });
    }
  };

  // every time your score increases, the div containing the score is removed, and a new one is drawn with the new score
  const drawScore = () => {
    p.removeElements();
    scoreElem = p.createDiv(`Score = ${score}`);
    scoreElem.position(20, 20);
    scoreElem.id = "score";
    scoreElem.style("color", "black");
    scoreElem.style("font-size", "50px");
    scoreElem.style("width", "50%");
    scoreElem.style("text-align", "center");
    scoreElem.style("margin-left", "25%");
  };

  /*
 The segments are updated based on the direction of the snake.
 All segments from 0 to n-1 are just copied over to 1 till n, i.e. segment 0
 gets the value of segment 1, segment 1 gets the value of segment 2, and so on,
 and this results in the movement of the snake.

 The last segment is added based on the direction in which the snake is going,
 if it's going left or right, the last segment's x coordinate is increased by a
 predefined value 'diff' than its second to last segment. And if it's going up
 or down, the segment's y coordinate is affected.
*/
  const updateSnakeCoordinates = () => {
    for (let i = 0; i < numSegments - 1; i++) {
      xCor[i] = xCor[i + 1];
      yCor[i] = yCor[i + 1];
    }
    switch (direction) {
      case "right":
        xCor[numSegments - 1] = xCor[numSegments - 2] + diff;
        yCor[numSegments - 1] = yCor[numSegments - 2];
        break;
      case "up":
        xCor[numSegments - 1] = xCor[numSegments - 2];
        yCor[numSegments - 1] = yCor[numSegments - 2] - diff;
        break;
      case "left":
        xCor[numSegments - 1] = xCor[numSegments - 2] - diff;
        yCor[numSegments - 1] = yCor[numSegments - 2];
        break;
      case "down":
        xCor[numSegments - 1] = xCor[numSegments - 2];
        yCor[numSegments - 1] = yCor[numSegments - 2] + diff;
        break;
    }
  };

  /*
 I always check the snake's head position xCor[xCor.length - 1] and
 yCor[yCor.length - 1] to see if it touches the game's boundaries
 or if the snake hits itself.
*/
  const checkGameStatus = () => {
    if (
      xCor[xCor.length - 1] > p.width ||
      xCor[xCor.length - 1] < 0 ||
      yCor[yCor.length - 1] > p.height ||
      yCor[yCor.length - 1] < 0 ||
      checkSnakeCollision() ||
      checkWallCollision()
    ) {
      p.noLoop();
      // On game over, create a <div> that covers the gameboard
      loseMessage = p.createDiv(`Game Over! Your score was: ${score}`);
      loseMessage.position(20, 20);
      loseMessage.id = "score";
      loseMessage.style("background-color", "white");
      loseMessage.style("color", "black");
      loseMessage.style("font-size", "50px");
      loseMessage.style("padding-top", "15%");
      loseMessage.style("width", "100%");
      loseMessage.style("height", "100%");
      loseMessage.style("text-align", "center");
    }
  };

  /*
 If the snake hits itself, that means the snake head's (x,y) coordinate
 has to be the same as one of its own segment's (x,y) coordinate.
*/
  const checkSnakeCollision = () => {
    const snakeHeadX = xCor[xCor.length - 1];
    const snakeHeadY = yCor[yCor.length - 1];
    for (let i = 0; i < xCor.length - 1; i++) {
      if (xCor[i] === snakeHeadX && yCor[i] === snakeHeadY) {
        return true;
      }
    }
  };

  //Checks if the head of the snake collides with any walls that have been drawn on the map
  const checkWallCollision = () => {
    const snakeHeadX = xCor[xCor.length - 1];
    const snakeHeadY = yCor[yCor.length - 1];
    for (let i = 0; i < verticalLines.length; i++) {
      if (
        verticalLines[i].startX == snakeHeadX &&
        verticalLines[i].startY < snakeHeadY &&
        verticalLines[i].startY > snakeHeadY - verticalLines[i].size
      ) {
        return true;
      }
    }
    for (let i = 0; i < horizontalLines.length; i++) {
      if (
        horizontalLines[i].startY == snakeHeadY &&
        horizontalLines[i].startX < snakeHeadX &&
        horizontalLines[i].startX > snakeHeadX - horizontalLines[i].size
      ) {
        return true;
      }
    }
  };

  /*
 Whenever the snake consumes a fruit, I increment the number of segments,
 and just insert the tail segment again at the start of the array (basically
 I add the last segment again at the tail, thereby extending the tail)
*/
  const checkForFruit = () => {
    p.stroke(colors[3]);
    p.point(xFruit, yFruit);
    if (xCor[xCor.length - 1] === xFruit && yCor[yCor.length - 1] === yFruit) {
      score = score + 1;
      xCor.unshift(xCor[0]);
      yCor.unshift(yCor[0]);
      numSegments++;
      xFruit = null;
      yFruit = null;
    }
  };

  const checkForBoost = () => {
    p.strokeWeight(10);
    p.stroke(boostColors[randomBoostColor]);
    p.point(xBoost, yBoost);
    p.strokeWeight(1);
    p.noFill();
    p.ellipse(xBoost, yBoost, 20);
    if (xCor[xCor.length - 1] === xBoost && yCor[yCor.length - 1] === yBoost) {
      xCor.unshift(xCor[0]);
      yCor.unshift(yCor[0]);
      numSegments++;
      xBoost = null;
      yBoost = null;
      if (randomBoostColor == 0) {
        // blue
        score = score * 2;
      } else if (randomBoostColor == 1) {
        // magenta
        score = score + 100;
      } else if (randomBoostColor == 1) {
        // yellow
        speed = speed - 1;
      } else if (randomBoostColor == 1) {
        // lime
        speed = speed + 1;
      }
    }
  };

  const updateFruitCoordinates = () => {
    /*
    The complex math logic is because I wanted the point to lie
    in between 100 and width-100, and be rounded off to the nearest
    number divisible by 10, since I move the snake in multiples of 10.
  */

    let xPix = p.floor(p.random(10, (p.width - 100) / 10)) * 10;
    let yPix = p.floor(p.random(10, (p.height - 100) / 10)) * 10;

    let pixelColor = p.get(xPix, yPix);

    if (
      p.red(pixelColor) === 0 &&
      p.blue(pixelColor) === 0 &&
      p.green(pixelColor) === 0
    ) {
      xFruit = xPix;
      yFruit = yPix;
    } else {
      console.log(pixelColor);
    }
    // console.log(xFruit);
    // let widthColor = p.get(xFruit);
    // // let heightColor = p.get(p.floor(p.random(10, (p.height - 100) / 10)) * 10);

    // console.log(pixelColor);
    // console.log(xFruit, yFruit);
  };

  const updateBoostCoordinates = () => {
    xBoost = p.floor(p.random(10, (p.width - 100) / 10)) * 10;
    yBoost = p.floor(p.random(10, (p.height - 100) / 10)) * 10;
  };

  const keyPressed = () => {
    switch (p.keyCode) {
      case 74:
        if (direction !== "right") {
          direction = "left";
        }
        break;
      case 37:
        if (direction !== "right") {
          direction = "left";
        }
        break;
      case 76:
        if (direction !== "left") {
          direction = "right";
        }
        break;
      case 39:
        if (direction !== "left") {
          direction = "right";
        }
        break;
      case 73:
        if (direction !== "down") {
          direction = "up";
        }
        break;
      case 38:
        if (direction !== "down") {
          direction = "up";
        }
        break;
      case 75:
        if (direction !== "up") {
          direction = "down";
        }
        break;
      case 40:
        if (direction !== "up") {
          direction = "down";
        }
        break;
    }
  };

  const drawWall = () => {
    if (alternate && verticalLines.length < maxLength) {
      // console.log(vLines[vCounter]);
      verticalLines.push(shuffledVLines[vCounter]);
      vCounter = vCounter + 1;
      alternate = !alternate;
    } else if (!alternate && horizontalLines.length < maxLength) {
      horizontalLines.push(shuffledHLines[hCounter]);
      hCounter = hCounter + 1;
      alternate = !alternate;
    }
  };
};

export default sketch;
