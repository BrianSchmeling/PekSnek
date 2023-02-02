const sketch = (p) => {
  // let rotation = 0;

  // p.setup = () => {
  //   p.createCanvas(1000, 500);
  // };

  // p.draw = () => {
  //   if (p.mouseIsPressed) {
  //     p.fill(0);
  //   } else {
  //     p.fill(255);
  //   }
  //   p.ellipse(p.mouseX, p.mouseY, 80, 80);
  // };

  // the snake is divided into small segments, which are drawn and edited on each 'draw' call
  let numSegments = 10;
  let direction = "right";

  const xStart = 0; //starting x coordinate for snake
  const yStart = 250; //starting y coordinate for snake
  const diff = 10;

  let lines = [{ startHeight: 100, startWidth: 500 }];

  let xCor = [];
  let yCor = [];

  let xFruit = 0;
  let yFruit = 0;
  let scoreElem;

  p.setup = () => {
    scoreElem = p.createDiv("Score = 0");
    scoreElem.position(20, 20);
    scoreElem.id = "score";
    scoreElem.style("color", "white");

    p.createCanvas(1000, 500);
    p.frameRate(15);
    p.stroke(255);
    p.strokeWeight(10);
    updateFruitCoordinates();

    for (let i = 0; i < numSegments; i++) {
      xCor.push(xStart + i * diff);
      yCor.push(yStart);
    }
  };

  p.draw = () => {
    p.background(0);
    for (let i = 0; i < numSegments - 1; i++) {
      p.line(xCor[i], yCor[i], xCor[i + 1], yCor[i + 1]);
    }
    updateSnakeCoordinates();
    checkGameStatus();
    checkForFruit();
    keyPressed();
    // drawWall();
    if (lines.length > 0) {
      lines.map((line) => {
        p.fill(p.random(360), 100, 100);
        p.rect(line.startWidth, line.startHeight, 0, 50);
      });
    }
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
      const scoreVal = parseInt(scoreElem.html().substring(8));
      scoreElem.html("Game ended! Your score was : " + scoreVal);
      console.log("snakeHeadeX: " + xCor[xCor.length - 1]);
      console.log("snakeHeadeY: " + yCor[yCor.length - 1]);
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

  const checkWallCollision = () => {
    const snakeHeadX = xCor[xCor.length - 1];
    const snakeHeadY = yCor[yCor.length - 1];
    for (let i = 0; i < lines.length; i++) {
      if (
        lines[i].startWidth == snakeHeadX &&
        lines[i].startHeight < snakeHeadY &&
        lines[i].startHeight > snakeHeadY - 50
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
    p.point(xFruit, yFruit);
    if (xCor[xCor.length - 1] === xFruit && yCor[yCor.length - 1] === yFruit) {
      const prevScore = parseInt(scoreElem.html().substring(8));
      scoreElem.html("Score = " + (prevScore + 1));
      xCor.unshift(xCor[0]);
      yCor.unshift(yCor[0]);
      numSegments++;
      updateFruitCoordinates();
    }
  };

  const updateFruitCoordinates = () => {
    /*
    The complex math logic is because I wanted the point to lie
    in between 100 and width-100, and be rounded off to the nearest
    number divisible by 10, since I move the snake in multiples of 10.
  */

    xFruit = p.floor(p.random(10, (p.width - 100) / 10)) * 10;
    yFruit = p.floor(p.random(10, (p.height - 100) / 10)) * 10;
  };

  const keyPressed = () => {
    switch (p.keyCode) {
      case 74:
        if (direction !== "right") {
          direction = "left";
        }
        break;
      case 76:
        if (direction !== "left") {
          direction = "right";
        }
        break;
      case 73:
        if (direction !== "down") {
          direction = "up";
        }
        break;
      case 75:
        if (direction !== "up") {
          direction = "down";
        }
        break;
    }
  };

  //   const drawWall = () => {
  //     if (Math.floor(Math.random() * 100) == 0) {
  //       let lineWidth = Math.floor(Math.random() * p.width);
  //       let lineHeight = Math.floor(Math.random() * p.height);
  //       lines.push({
  //         startHeight: lineHeight,
  //         startWidth: lineWidth,
  //       });
  //     }
  //   };
  console.log(lines);
};

export default sketch;
