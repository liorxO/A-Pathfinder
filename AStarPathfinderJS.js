
//Written by Lior Ohayon and Ron Yalensky

let rows = 30;
let cols = 30;
let chanceForObstacle = 0.2;
let grid = new Array(cols);
let openSet = [], closedSet = []; //Global sets.
// closedSet stores the nodes that evaluated, do not need to revisit.
// openSet stores the nodes that we need to evaluate.
let start, end, current; //Nodes
let w,h; //width and height of one Node.
let path = [];
let isStuck = false;
let nodesVisited = 0;
let debugMode = false;
var refreshRate = 30;
var refreshButton, submitButton, titleText, inputSize;

function removeFromArr(arr, elem) {
  for (let i = arr.length; i >= 0; i--) {
    if (arr[i] == elem) {
      arr.splice(i,1); //removing one element at index i
    }
  }
}

function heuristic(a,b) {
  return (abs(a.i - b.i) + abs(a.j - b.j));  //Manhattan distance
  //return max(abs(a.i - b.i) , abs(a.j - b.j));  //Diagonal distance
  //return sqrt(2*(a.i - b.i) + 2*(a.j - b.j)); //Euclidean distance
  //return dist(a.i, a.j, b.i, b.j); //Euclidean distance made by p5 library.
}

function Node(i,j) { //Node in the grid
  this.f = 0; // f(n) = h(n) + g(n);
  this.g = 0; // g function (guess)
  this.h = 0; // heuristic function.
  this.i = i; //x value
  this.j = j; //y value
  this.neighbors = []; //neighbors of a node
  this.previous = undefined; //previous node in the path
  this.isObstacle = false;

  console.log("chanceForObstacle in Node: " +  chanceForObstacle);
  if (random(1) < chanceForObstacle) { //Setting random obstacles.
    this.isObstacle = true;
  }

  this.show = function(color) {
    fill(color);
    if (this.isObstacle) {
      fill(43); //Obstacles are dark-grey colored
    }
    noStroke();
    rect(this.i * w, this.j * h, w-1 , h-1);
  }



  this.getNeighbors = function(grid) {
    let i = this.i;
    let j = this.j;

    if (i < cols - 1) {
      this.neighbors.push(grid[i+1][j]);
    }
    if (i > 0) {
      this.neighbors.push(grid[i-1][j]);
    }
    if (j > 0) {
      this.neighbors.push(grid[i][j-1]);
    }
    if (j < rows - 1) {
      this.neighbors.push(grid[i][j+1]);
    }
  }
}

var started = false;
var obstacleSlider;
var obstacleSpan;
var radioSize;
var debugCheckbox;
var refreshRateSlider;
function setup() {

  let cnv = createCanvas(600,600);
  cnv.parent(jsSection);

  createP("Made by Lior Ohayon and Ron Yalensky, 2019<br><br><br><br>").parent(jsSection);


  createP("Obstacles Density").style('font-weight','bold').parent('obstacleDensity');
  obstacleSlider = createSlider(0,10,2);
  obstacleSlider.parent('obstacleDensity');
  obstacleSlider.style('height','20px');
  obstacleSlider.style('outline','none');
  obstacleSlider.style('width', '250px');

  createP("Frame Rate").style('font-weight','bold').parent('frameRate');
  refreshRateSlider = createSlider(5,70,25);
  refreshRateSlider.parent('frameRate');
  refreshRateSlider.style('height','20px');
  refreshRateSlider.style('outline','none');
  refreshRateSlider.style('width', '250px');


  createP("Size of Board").style('font-weight','bold').parent('sizeOfBoard');
  radioSize = createRadio().parent('sizeOfBoard');

  radioSize.option('20x20',20).checked = true;
  radioSize.option('30x30',30);
  radioSize.option('40x40',40);
  radioSize.option('50x50',50);
  //radioSize.style('width','80px');
  radioSize.style('font-family','Helvetica');
  //radioSize.style('margin','auto')

  createP("<br>").parent(userInteraction);
  debugCheckbox = createCheckbox("Debug Mode").parent(userInteraction);
  debugCheckbox.style('font-family','Helvetica');

  createP("<br>").parent(userInteraction);

  submitButton = createButton('Submit');
  submitButton.parent(userInteraction);
  submitButton.mouseClicked(startF);

  refreshButton = createButton('Refresh');
  refreshButton.parent(userInteraction);
  refreshButton.mouseClicked(refresh);




  noLoop();
}

function refresh() {
  window.location.reload();
}

function startF() {
  clear();
  started = true;
  chanceForObstacle = obstacleSlider.value() * 0.1;
  createP("<br>Chance for obstacles: " + chanceForObstacle.toFixed(1)).parent(userInteraction);
  rows = radioSize.value();
  cols = radioSize.value();
  frameRate(refreshRateSlider.value());

  resetGrid();
  console.log("Chance = ", chanceForObstacle);
  console.log("Starting...");
  submitButton.attribute('disabled','true');
  obstacleSlider.attribute('disabled','true');
  //radioSize.attribute("10",'disabled','true');
  loop();
}






function resetGrid() {
  console.log('re');
  console.log('A* PathFinder');
  console.log('Grid size is ' + cols + 'x' + rows);
  console.log('Obstacle percentage < ' + chanceForObstacle);
  //Setting up the grid
  w = width / cols;
  h = height / rows;
  for (let i = 0; i < cols ; i++) {
    grid[i] = new Array(rows);
  }

  for (let i = 0; i < cols ; i++) {
    for (let j = 0; j < rows ; j++) {
      grid[i][j] = new Node(i,j);
    }
  }
  //End

  //Getting neighbors for each Node in the grid structure.
  for (let i = 0; i < cols ; i++) {
    for (let j = 0; j < rows ; j++) {
      grid[i][j].getNeighbors(grid);
    }
  }


  //Setting start and end points
  start = grid[0][0];
  end = grid[cols-1][rows-1];

  //start and end nodes cannot be obstacles
  start.isObstacle = false;
  end.isObstacle = false;


// openSet starts with one node. (Starting node)
// closedSet starts empty.

  openSet.push(start);  //When starting, openSet has the start node

}

function draw() { //animation loop

if (started) {
  let minIndex = 0; //The lowest f value
  if (openSet.length > 0) {
    //Keep going...
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[minIndex].f) {
        minIndex = i;
      }
    }

    current = openSet[minIndex];

    if (openSet[minIndex] === end) { //end point reached?
      noLoop();
      createP("<br>Finished!").style('color','mediumseagreen').parent(userInteraction);
      createP("Visited " + nodesVisited + " nodes.").parent(userInteraction);
      console.log("Finished!");
      console.log("Node visited: " + nodesVisited);
    }

    removeFromArr(openSet, current);
    //openSet.remove(current);

    closedSet.push(current);


    //Checking neighbors:
    let neighbors = current.neighbors;
    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];

      if (!closedSet.includes(neighbor) && !neighbor.isObstacle) // if not visited
      {
        nodesVisited += 1;
        let tempG = current.g + 1;

        if (openSet.includes(neighbor)) { //need to check.
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
          }
        } else { // if not on openSet
            neighbor.g = tempG;
            openSet.push(neighbor);
          }
        neighbor.h = heuristic(neighbor,end); //updating h, the heuristic rule
        neighbor.f = neighbor.g + neighbor.h; //updating f, f(n) = g(n) + h(n)
        neighbor.prev = current; //where did I came from?
        }
      }

  } else {
    //No solution...
    isStuck = true;

    console.log('No possible solution')
    //alert("No possible solution!");
    noLoop();
    createP("<br>No possible solution this time.").style('color','firebrick').parent(userInteraction);
    createP("Visited " + nodesVisited + " nodes").parent(userInteraction);
  }

  background(230);

  start.show(color(180,223,185));


  for (let i = 0; i < cols  ; i++) {
    for (let j = 0; j < rows ; j++) {
      if ((!(i === 0 && j === 0))) //if (i === 0 && j === 0), it's the start point.
       grid[i][j].show(color(252));
    }
  }
  end.show(color(223,100,101));


  // For debugging:
  if (debugCheckbox.checked()) {
   for (let i = 0; i < closedSet.length; i++){
     closedSet[i].show(color(220,0,0));
   }

   for (let j = 0; j < openSet.length; j++){
     openSet[j].show(color(100,255,100));
   }
}

  if (!isStuck) { //if not stuck, find the path with previous nodes
    path = [];
    let temp = current;
    path.push(temp);
    while (temp.prev){
      path.push(temp.prev)
      temp = temp.prev;
    }
  }

  // for (let i = 0; i < path.length; i++){
  //   path[i].show(color(150,150,255));
  // }

  noFill();
  strokeWeight(8);
  stroke(color(244, 164, 96));
  beginShape();
  for (let i = 0; i < path.length; i++){
    vertex(path[i].i * w + w/2, path[i].j * h + h/2);
  }
  endShape();
}
}
