import { Entity } from "../../Entity.js";
import { Vector2 } from "../../Vector2.js";
import { events } from "../../Events.js";
import { resources } from "../../Resource.js";
import { Sprite } from "../../Sprite.js";
import { Animations } from "../../Animations.js";
import { FrameIndexPattern } from "../../FrameIndexPattern.js";
import { DOWN, LEFT, RIGHT, UP } from "../../Input.js";

import { gridSize } from "../../helpers/grid.js";
import { isSpaceFree } from "../../helpers/grid.js";

import {
  PICK_UP_DOWN,
  STAND_DOWN,
  STAND_LEFT,
  STAND_RIGHT,
  STAND_UP,
  WALK_DOWN,
  WALK_LEFT,
  WALK_RIGHT,
  WALK_UP,
  ATTACK_LEFT,
  ATTACK_UP,
  ATTACK_RIGHT,
  ATTACK_DOWN,
} from "./playerAnimations.js";
import { Katana } from "../Items/Katana/Katana.js";
import { Broom } from "../Items/Broom/Broom.js";

export class Player extends Entity {
  constructor() {
    super({
      position: new Vector2(0, 0)
    });
    this.isAlive = false;   
    this.invisible = true;
    
    this.respawnDelay = 10000;
    this.type = 'player';
    
    this.hasCollision = true;
    this.width = 32;
    this.height = 32;    
    this.radius = 16;
    
    this.mass = 200;
    this.baseSpeed = 2;
    this.speed = this.baseSpeed;    
    this.facingDirection = DOWN;    
    
    this.maxHealth = 100;
    this.currentHealth = 100;
    
    this.attackPower = 10;    

    this.awarenessField = 5;
    this.sensingRadius = this.awarenessField * gridSize;

    this.equippedMainhand = null;
    this.equippedOffhand = null;
    
    this.itemPickUpTime = 0;
    this.itemPickUpShell = null;
    
    this.attackTime = 0;
    this.attackWeapon = null;
    
    this.idleTime = 0;
    this.idleAction = 200;
    
      
    const shadow = new Sprite({
      resource: resources.images.shadow,
      frameSize: new Vector2(32,32),
      position: new Vector2(2, -16),
    })    
    this.addChild(shadow);
    
    this.equipHandB = new Sprite({  
      resource: resources.images.air,
      frameSize: new Vector2(gridSize,gridSize),
      position: new Vector2(0, 0),
      frameSize: new Vector2(gridSize,gridSize),
      hFrames: 1,
      vFrames: 1,
      frame: 0,      
    })          
    this.equipmentSpriteBelow = this.equipHandB;
    this.addChild(this.equipmentSpriteBelow);
    
    this.body = new Sprite({
      resource: resources.images.player,
      frameSize: new Vector2(32,32),
      hFrames: 3,
      vFrames: 8,
      frame: 1,
      scale: 2,
      position: new Vector2(-16, -32), // offset x, y
      animations: new Animations({
        walkDown: new FrameIndexPattern(WALK_DOWN),
        walkUp: new FrameIndexPattern(WALK_UP),
        walkLeft: new FrameIndexPattern(WALK_LEFT),
        walkRight: new FrameIndexPattern(WALK_RIGHT),
        standDown: new FrameIndexPattern(STAND_DOWN),
        standUp: new FrameIndexPattern(STAND_UP),
        standLeft: new FrameIndexPattern(STAND_LEFT),
        standRight: new FrameIndexPattern(STAND_RIGHT),
        pickUpDown: new FrameIndexPattern(PICK_UP_DOWN),
        attackLeft: new FrameIndexPattern(ATTACK_LEFT),
        attackUp: new FrameIndexPattern(ATTACK_UP),
        attackRight: new FrameIndexPattern(ATTACK_RIGHT),
        attackDown: new FrameIndexPattern(ATTACK_DOWN),        

      })
    })    
    this.addChild(this.body);
    
    this.equipHandA = new Sprite({  
      resource: resources.images.air,
      frameSize: new Vector2(gridSize,gridSize),
      position: new Vector2(0, 0),
      frameSize: new Vector2(gridSize,gridSize),
      hFrames: 1,
      vFrames: 1,
      frame: 0,      
    })         
    this.equipmentSpriteAbove = this.equipHandA;
    this.addChild(this.equipmentSpriteAbove);
    
    events.on("TOGGLE_DEBUG", this, () => {
      this.debug = this.debug ? false : true;
    })
    events.on("PLAYER_PICKS_UP_ITEM", this, data => {
      this.onPickUpItem(data);
    })
  }  
  idleBehavior(delta) {
    if (this.idleTime < this.idleAction ) {
      this.idleTime += delta;
    } else {              
        this.idleTime = 0;
      };       
    if (this.facingDirection === LEFT) {this.body.animations.play("standLeft")}
    if (this.facingDirection === RIGHT) {this.body.animations.play("standRight")}
    if (this.facingDirection === UP) {this.body.animations.play("standUp")}
    if (this.facingDirection === DOWN) {this.body.animations.play("standDown")}
  }
  
  doClickBehavior() {
    if (this.facingDirection === LEFT) {this.doSweepAttack(LEFT)}
    if (this.facingDirection === UP) {this.doSweepAttack(UP)}
    if (this.facingDirection === RIGHT) {this.doSweepAttack(RIGHT)}
    if (this.facingDirection === DOWN) {this.doSweepAttack(DOWN)}    
  }
  
  doSweepAttack(direction) {
    if (this.attackTime > 0) {
      return;
    }

    this.attackWeapon = new Broom(this.position.x, this.position.y, this.currentWorld, this.facingDirection)  

    this.attackTime = 350; // TODO set this property from the item being used
    const range = this.radius * 4;    
    const spread = this.radius * 2;
    const reach = this.radius * 2;   
    const facingOffset = this.radius * 0.5;
    
    let damagedEntities = [];
    let newPosition = { x: this.center.x, y: this.center.y };
    
    switch (direction) {
      case 'UP':
        newPosition.y -= range;
        
        const raycastHitA = this.dynamicRaycast(this.center.x, 
                                                this.center.y - facingOffset, 
                                                newPosition.x, 
                                                newPosition.y);
        
        if (raycastHitA.collision) {
          this.visualizeRaycast(this.center.x, 
                                this.center.y - facingOffset, 
                                // newPosition.x, 
                                // newPosition.y,
                                raycastHitA.position.x, 
                                raycastHitA.position.y,                                
                                raycastHitA.position, 
                                this);          
          damagedEntities.push(raycastHitA.entity);                                                  
        }                        

        const raycastHitB = this.dynamicRaycast(this.center.x, 
                                                this.center.y - facingOffset, 
                                                newPosition.x - spread, 
                                                newPosition.y + reach);
        
        if (raycastHitB.collision) {        
          this.visualizeRaycast(this.center.x, 
                                this.center.y - facingOffset, 
                                // newPosition.x - spread, 
                                // newPosition.y + reach,
                                raycastHitB.position.x, 
                                raycastHitB.position.y,                                 
                                raycastHitB.position, 
                                this);
          damagedEntities.push(raycastHitB.entity);
        }
        
        const raycastHitC = this.dynamicRaycast(this.center.x, 
                                                this.center.y - facingOffset, 
                                                newPosition.x + spread, 
                                                newPosition.y + reach);
        
        if (raycastHitC.collision) {                                                
          this.visualizeRaycast(this.center.x, 
                                this.center.y - facingOffset, 
                                // newPosition.x + spread, 
                                // newPosition.y + reach, 
                                raycastHitC.position.x, 
                                raycastHitC.position.y,                                 
                                raycastHitC.position, 
                                this);
          damagedEntities.push(raycastHitC.entity);                      
        }
        break;
      
      case 'RIGHT':
        newPosition.x += range;
        
        const raycastHitD = this.dynamicRaycast(this.center.x + facingOffset, 
                                                this.center.y, 
                                                newPosition.x, 
                                                newPosition.y);
        
        if (raycastHitD.collision) {          
          this.visualizeRaycast(this.center.x + facingOffset, 
                                this.center.y, 
                                // newPosition.x, 
                                // newPosition.y,
                                raycastHitD.position.x, 
                                raycastHitD.position.y,                                 
                                raycastHitD.position, 
                                this);
          damagedEntities.push(raycastHitD.entity);
        }
        
        const raycastHitE = this.dynamicRaycast(this.center.x + facingOffset, 
                                                this.center.y, 
                                                newPosition.x - reach, 
                                                newPosition.y - spread);
        
        if (raycastHitE.collision) {          
          this.visualizeRaycast(this.center.x + facingOffset, 
                                this.center.y, 
                                // newPosition.x - reach, 
                                // newPosition.y - spread,
                                raycastHitE.position.x, 
                                raycastHitE.position.y,                                 
                                raycastHitE.position, 
                                this);
          damagedEntities.push(raycastHitE.entity);
        }
        
        const raycastHitF = this.dynamicRaycast(this.center.x + facingOffset, 
                                                this.center.y, 
                                                newPosition.x - reach, 
                                                newPosition.y + spread);
        
        if (raycastHitF.collision) {          
          this.visualizeRaycast(this.center.x + facingOffset, 
                                this.center.y, 
                                // newPosition.x  - reach, 
                                // newPosition.y + spread,
                                raycastHitF.position.x, 
                                raycastHitF.position.y,                                 
                                raycastHitF.position, 
                                this);
        damagedEntities.push(raycastHitF.entity);                        
        }
        break;
      
      case 'DOWN':
        newPosition.y += range;
        
        const raycastHitG = this.dynamicRaycast(this.center.x, 
                                                this.center.y + facingOffset, 
                                                newPosition.x, 
                                                newPosition.y);
        
        if (raycastHitG.collision) {          
          this.visualizeRaycast(this.center.x, 
                                this.center.y + facingOffset, 
                                // newPosition.x,
                                // newPosition.y, 
                                raycastHitG.position.x, 
                                raycastHitG.position.y,                                 
                                raycastHitG.position, 
                                this);
          damagedEntities.push(raycastHitG.entity);
        }
        
        const raycastHitH = this.dynamicRaycast(this.center.x, 
                                                this.center.y + facingOffset, 
                                                newPosition.x - spread, 
                                                newPosition.y - reach);
        
        if (raycastHitH.collision) {          
          this.visualizeRaycast(this.center.x, 
                                this.center.y + facingOffset, 
                                // newPosition.x - spread, 
                                // newPosition.y - reach,
                                raycastHitH.position.x, 
                                raycastHitH.position.y,                                 
                                raycastHitH.position, 
                                this);
          damagedEntities.push(raycastHitH.entity);
        }
        
        const raycastHitI = this.dynamicRaycast(this.center.x, 
                                                this.center.y + facingOffset, 
                                                newPosition.x + spread, 
                                                newPosition.y - reach);
        
        if (raycastHitI.collision) {          
          this.visualizeRaycast(this.center.x, 
                                this.center.y + facingOffset, 
                                // newPosition.x + spread, 
                                // newPosition.y - reach,
                                raycastHitI.position.x, 
                                raycastHitI.position.y,                                 
                                raycastHitI.position, 
                                this); 
          damagedEntities.push(raycastHitI.entity);
        }          
        break;
      
      case 'LEFT':
        newPosition.x -= range;
        
        const raycastHitJ = this.dynamicRaycast(this.center.x - facingOffset, 
                                                this.center.y, 
                                                newPosition.x, 
                                                newPosition.y);
        
        if (raycastHitJ.collision) {          
          this.visualizeRaycast(this.center.x - facingOffset, 
                                this.center.y, 
                                // newPosition.x, 
                                // newPosition.y, 
                                raycastHitJ.position.x, 
                                raycastHitJ.position.y,                                 
                                raycastHitJ.position, 
                                this);
          damagedEntities.push(raycastHitJ.entity);
        }
        
        const raycastHitK = this.dynamicRaycast(this.center.x - facingOffset, 
                                                this.center.y, 
                                                newPosition.x + reach, 
                                                newPosition.y - spread);
        
        if (raycastHitK.collision) {          
          this.visualizeRaycast(this.center.x - facingOffset, 
                                this.center.y, 
                                // newPosition.x + reach, 
                                // newPosition.y - spread,
                                raycastHitK.position.x, 
                                raycastHitK.position.y,                                 
                                raycastHitK.position, 
                                this);
          damagedEntities.push(raycastHitK.entity);
        }
        
        const raycastHitL = this.dynamicRaycast(this.center.x - facingOffset, 
                                                this.center.y, 
                                                newPosition.x + reach, 
                                                newPosition.y + spread);
        
        if (raycastHitL.collision) {          
          this.visualizeRaycast(this.center.x - facingOffset, 
                                this.center.y, 
                                // newPosition.x + reach, 
                                // newPosition.y + spread,
                                raycastHitL.position.x, 
                                raycastHitL.position.y,                                 
                                raycastHitL.position, 
                                this);
          damagedEntities.push(raycastHitL.entity);
        }          
        break;
    }   
    
    for (let i = damagedEntities.length -1; i >= 0; i--) {
      const target = damagedEntities[i];
      
      target.onEnergyShield();
      target.subtractHealth(1);              
      
      this.debugLog(target.entityId, target.currentHealth)

    }
    
    if (direction === 'RIGHT' || direction === 'UP') {
      this.equipmentSpriteBelow.addChild(this.attackWeapon); 
    } else {
       this.equipmentSpriteAbove.addChild(this.attackWeapon);      
    }
  } 
  
  isAttacking(delta) {
    this.attackTime -= delta;
    
    if (this.facingDirection === LEFT) {this.body.animations.play( 'attackLeft' )}
    if (this.facingDirection === RIGHT) {this.body.animations.play( 'attackRight' )}
    if (this.facingDirection === UP) {this.body.animations.play( 'attackUp' ) }
    if (this.facingDirection === DOWN) {this.body.animations.play( 'attackDown' )}    
    
    if (this.attackTime <= 0) {
      this.attackWeapon.destroy();
    } 
  }      
  
  onPickUpItem({ image, position }) {
    // place character on item position
    this.destinationPosition = position.duplicate();
    // start animation
    this.itemPickUpTime = 400; // ms
    this.itemPickUpShell = new GameObject({});
    this.itemPickUpShell.addChild(new Sprite({
      resource: image,
      position: new Vector2(1, -20)
    }))
    this.addChild(this.itemPickUpShell)
  }
  
  workOnItemPickUp(delta) {
    this.itemPickUpTime -= delta;
    this.body.animations.play("pickUpDown")
    if (this.itemPickUpTime <= 0) {
      this.itemPickUpShell.destroy();
    }
  }   
  
  tryEmitPosition() {
    if (this.lastX == this.position.x && this.lastY == this.position.y) {
      return;
    }
    this.lastX = this.position.x;
    this.lastY = this.position.y;
    
    events.emit("PLAYER_POSITION", { 
      x: this.position.x, 
      y: this.position.y, 
      world: this.currentWorld,
      center: this.center,
      radius: this.radius,    
    })
  }  
  
  tryMove(delta, root) {
    const {input} = root; 
    
    if (!input.direction && !input.isClicking) {    
      this.idleBehavior(delta);
      return;
    }
    
    if (input.isClicking && !input.isTextFocused) {      
      this.doClickBehavior();
      return;
    }

    let snapToGridX = this.destinationPosition.x % gridSize < gridSize / 2
      ? Math.floor(this.destinationPosition.x / gridSize)
      : Math.ceil(this.destinationPosition.x / gridSize);

    let snapToGridY = this.destinationPosition.y % gridSize < gridSize / 2
      ? Math.floor(this.destinationPosition.y / gridSize)
      : Math.ceil(this.destinationPosition.y / gridSize);
    
    let nextX = snapToGridX * gridSize;
    let nextY = snapToGridY * gridSize;
    
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
    
    if (isSpaceFree(nextX, nextY, this).collisionDetected === false) {
      this.destinationPosition.x = nextX;
      this.destinationPosition.y = nextY;    
    }
    this.facingDirection = input.direction ?? this.facingDirection;
  };   
  
  step(delta, root) {
    
    if (this.attackTime > 0) {
      this.isAttacking(delta);
      return;
    }  
    if (this.itemPickUpTime > 0) {
      this.workOnItemPickUp(delta);
      return;
    }

    const distance = this.moveTowards(this, this.destinationPosition, this.speed);    
           
    const collidees = this.returnOverlappingEntities();
    
    if (collidees.length > 0) {     
      for (let i = collidees.length - 1; i >= 0; i--) {
        const collidee = collidees[i];
        this.onCollision(this.calculateRepulsionForce(collidee));

        collidee.reflexAction(this);       
        
      }
    }
        
    const hasArrived = distance < 1;
    
    if (hasArrived) {
      this.tryMove(delta, root)
    }
    
    this.tryEmitPosition()
  }
     
  ready() {

  }
   
}