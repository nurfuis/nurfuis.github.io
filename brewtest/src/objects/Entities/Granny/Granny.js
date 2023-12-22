// Granny.js
import {GameObject} from "../../../GameObject.js";
import {Vector2} from "../../../Vector2.js";
import {DOWN, LEFT, RIGHT, UP} from "../../../Input.js";
import {gridSize} from "../../../helpers/grid.js";
import {Sprite} from "../../../Sprite.js";
import {resources} from "../../../Resource.js";
import {Animations} from "../../../Animations.js";
import {FrameIndexPattern} from "../../../FrameIndexPattern.js";
import {
  PICK_UP_DOWN,
  STAND_DOWN,
  STAND_LEFT,
  STAND_RIGHT,
  STAND_UP,
  WALK_DOWN,
  WALK_LEFT,
  WALK_RIGHT,
  WALK_UP
} from "../../Player/playerAnimations.js";
import {moveTowards} from "../../../helpers/moveTowards.js";
import {events} from "../../../Events.js";
import {isSpaceFree} from "../../../helpers/grid.js";
import { colliders } from "../../../../main.js";

export class Granny extends GameObject {
  constructor(x, y) {
    super({
      position: new Vector2(x, y)
    });    
    // Sprites
    // add player shadow  
    const shadow = new Sprite({
      resource: resources.images.shadow,
      frameSize: new Vector2(32,32),
      position: new Vector2(-8, -22),
    })
    this.addChild(shadow);  
    // add new sprite 
    this.body = new Sprite({
      resource: resources.images.granny,
      frameSize: new Vector2(32,32),
      hFrames: 3,
      vFrames: 8,
      frame: 1,	
      position: new Vector2(-8, -22), // offset x, y
      animations: new Animations({
        walkDown: new FrameIndexPattern(WALK_DOWN),
        walkUp: new FrameIndexPattern(WALK_UP),
        walkLeft: new FrameIndexPattern(WALK_LEFT),
        walkRight: new FrameIndexPattern(WALK_RIGHT),
        standDown: new FrameIndexPattern(STAND_DOWN),
        standUp: new FrameIndexPattern(STAND_UP),
        standLeft: new FrameIndexPattern(STAND_LEFT),
        standRight: new FrameIndexPattern(STAND_RIGHT),
      })
    })    
    this.addChild(this.body);  
    // Default Facing
    this.facingDirection = DOWN;
    this.body.animations.play("standDown") 
   
    // Movement 
    this.destinationPosition = this.position.duplicate();

     // Collision tile
    this.entityId = "granny";
    this.isMoving = true;    
    this.lastSquare = null;
    this.nextSquare = null;
    
    events.on("ENTITY_SPAWN", this, playerData => {    
      colliders.addCollider(Math.floor(this.position.x), Math.floor(this.position.y), this.entityId );        
    });
  }
  ready() {
    events.emit("ENTITY_SPAWN", {location: this.location, ownerId: this.entityId});
  } 
  // Step
  step(delta, root) {
    // Try move 
    const distance = moveTowards(this, this.destinationPosition, .25)
    const hasArrived = distance < .22;
    if (hasArrived) {
      // Collision tile
      if (this.isMoving) {
        this.isMoving = false;
        if (this.lastSquare) {
          colliders.removeCollider( this.lastSquare.x, this.lastSquare.y, this.entityId );        
        }  
      }      
      this.tryMove(delta)
    }
  }
  // Try Move
  tryMove(delta) {
   
    // Create a movement sequence array
    const sequence = [
      { direction: UP, steps: 2 },
      { direction: UP, steps: 2 },
      { direction: UP, steps: 2 },
      { direction: DOWN, steps: 2 },
      { direction: DOWN, steps: 2 },
      { direction: DOWN, steps: 2 },
      { direction: RIGHT, steps: 2 },
      { direction: RIGHT, steps: 2 },
      { direction: RIGHT, steps: 2 },
      { direction: LEFT, steps: 2 },
      { direction: LEFT, steps: 2 },      
      { direction: LEFT, steps: 2 },
    ];

    // Check if the sequence has finished
    if (this.currentStep === undefined || this.currentStep >= sequence.length) {
      this.currentStep = 0; // Reset sequence on completion
    }

    // Get the current movement data from the sequence
    const currentStepData = sequence[this.currentStep];
    // Handle movement based on the data
    if (currentStepData.direction) {  
      const input = currentStepData;      
      
      let nextX = this.destinationPosition.x;
      let nextY = this.destinationPosition.y;    
      
      if (input.direction == DOWN) {
        nextY += gridSize;
        this.body.animations.play("walkDown") 
      }
      if (input.direction == UP) {
        nextY -= gridSize;
        this.body.animations.play("walkUp")
      }  
      if (input.direction == LEFT) {
        nextX -= gridSize;
        this.body.animations.play("walkLeft")  
      }
      if (input.direction == RIGHT) {
        nextX += gridSize;
        this.body.animations.play("walkRight")    
      }
      
      this.currentStep++;     
      
      if (isSpaceFree(colliders.colliders, nextX, nextY, this.entityId).collisionDetected === false) {
        this.destinationPosition.x = nextX;
        this.destinationPosition.y = nextY;
        
        // Collision tile
        this.isMoving = true;
        this.lastSquare = new Vector2(Math.floor(this.position.x), Math.floor(this.position.y));
        this.nextSquare = new Vector2(Math.floor(nextX), Math.floor(nextY));   
        colliders.addCollider( this.nextSquare.x, this.nextSquare.y, this.entityId );        
        
      }
    }
    // Update facing direction   
    this.facingDirection = currentStepData.direction ?? this.facingDirection; 
  }   
}