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
import { Air } from "../Items/Air/Air.js";

export class Player extends Entity {
  constructor() {
    super({
      position: new Vector2(0, 0)
    });
    this.type = 'player';    
    
    this.respawnDelay = 10000;

    
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

    this.awarenessField = 12;
    this.sensingRadius = this.awarenessField * gridSize;

    this.mainhand = Broom;
    this.offhand = Air;
    
    this.itemPickUpTime = 0;
    this.itemPickUpShell = Air;
    
    this.attackTime = 0;
    this.attackWeapon = Air;
    
    this.idleTime = 0;
    this.idleAction = 200;
    
      
    const shadow = new Sprite({
      resource: resources.images.shadow,
      frameSize: new Vector2(32,32),
      position: new Vector2(2, -16),
    })    
    this.addChild(shadow);
    
    this.equipMinusZ = new Air();
    this.addChild(this.equipMinusZ);
    
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
            
    this.equipPlusZ = new Air();
    this.addChild(this.equipPlusZ);
    
    events.on("PLAYER_PICKS_UP_ITEM", this, data => {
      this.onPickUpItem(data);
    })
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
    
    this.attackWeapon = new this.mainhand(this.position.x, this.position.y, this.currentWorld, this.facingDirection)  
    
    if (direction === 'RIGHT' || direction === 'UP') {
      this.equipMinusZ.addChild(this.attackWeapon); 
    } else {
       this.equipPlusZ.addChild(this.attackWeapon);      
    }

    this.attackTime = 350; // TODO set this property from the item being used
    const range = this.radius * 4;    
    const spread = this.radius * 2;
    const reach = this.radius * 2;   
    const facingOffset = this.radius * 0.5;
    
    let hitList = [];
    
    let targetPoint = { x: this.center.x, y: this.center.y };
    
    switch (direction) {
      case 'UP':
        targetPoint.y -= range;
        
        const raycastHitA = this.dynamicRaycastCircle(this.center.x, 
                                                this.center.y - facingOffset, 
                                                targetPoint.x, 
                                                targetPoint.y);
        
        if (raycastHitA.collision) {
          this.visualizeRaycast(this.center.x, 
                                this.center.y - facingOffset, 
                                // targetPoint.x, 
                                // targetPoint.y,
                                raycastHitA.position.x, 
                                raycastHitA.position.y,                                
                                raycastHitA.position, 
                                this);          
          hitList.push(raycastHitA.entity);                                                  
        }                        

        const raycastHitB = this.dynamicRaycastCircle(this.center.x, 
                                                this.center.y - facingOffset, 
                                                targetPoint.x - spread, 
                                                targetPoint.y + reach);
        
        if (raycastHitB.collision) {        
          this.visualizeRaycast(this.center.x, 
                                this.center.y - facingOffset, 
                                // targetPoint.x - spread, 
                                // targetPoint.y + reach,
                                raycastHitB.position.x, 
                                raycastHitB.position.y,                                 
                                raycastHitB.position, 
                                this);
          hitList.push(raycastHitB.entity);
        }
        
        const raycastHitC = this.dynamicRaycastCircle(this.center.x, 
                                                this.center.y - facingOffset, 
                                                targetPoint.x + spread, 
                                                targetPoint.y + reach);
        
        if (raycastHitC.collision) {                                                
          this.visualizeRaycast(this.center.x, 
                                this.center.y - facingOffset, 
                                // targetPoint.x + spread, 
                                // targetPoint.y + reach, 
                                raycastHitC.position.x, 
                                raycastHitC.position.y,                                 
                                raycastHitC.position, 
                                this);
          hitList.push(raycastHitC.entity);                      
        }
        break;
      
      case 'RIGHT':
        targetPoint.x += range;
        
        const raycastHitD = this.dynamicRaycastCircle(this.center.x + facingOffset, 
                                                this.center.y, 
                                                targetPoint.x, 
                                                targetPoint.y);
        
        if (raycastHitD.collision) {          
          this.visualizeRaycast(this.center.x + facingOffset, 
                                this.center.y, 
                                // targetPoint.x, 
                                // targetPoint.y,
                                raycastHitD.position.x, 
                                raycastHitD.position.y,                                 
                                raycastHitD.position, 
                                this);
          hitList.push(raycastHitD.entity);
        }
        
        const raycastHitE = this.dynamicRaycastCircle(this.center.x + facingOffset, 
                                                this.center.y, 
                                                targetPoint.x - reach, 
                                                targetPoint.y - spread);
        
        if (raycastHitE.collision) {          
          this.visualizeRaycast(this.center.x + facingOffset, 
                                this.center.y, 
                                // targetPoint.x - reach, 
                                // targetPoint.y - spread,
                                raycastHitE.position.x, 
                                raycastHitE.position.y,                                 
                                raycastHitE.position, 
                                this);
          hitList.push(raycastHitE.entity);
        }
        
        const raycastHitF = this.dynamicRaycastCircle(this.center.x + facingOffset, 
                                                this.center.y, 
                                                targetPoint.x - reach, 
                                                targetPoint.y + spread);
        
        if (raycastHitF.collision) {          
          this.visualizeRaycast(this.center.x + facingOffset, 
                                this.center.y, 
                                // targetPoint.x  - reach, 
                                // targetPoint.y + spread,
                                raycastHitF.position.x, 
                                raycastHitF.position.y,                                 
                                raycastHitF.position, 
                                this);
        hitList.push(raycastHitF.entity);                        
        }
        break;
      
      case 'DOWN':
        targetPoint.y += range;
        
        const raycastHitG = this.dynamicRaycastCircle(this.center.x, 
                                                this.center.y + facingOffset, 
                                                targetPoint.x, 
                                                targetPoint.y);
        
        if (raycastHitG.collision) {          
          this.visualizeRaycast(this.center.x, 
                                this.center.y + facingOffset, 
                                // targetPoint.x,
                                // targetPoint.y, 
                                raycastHitG.position.x, 
                                raycastHitG.position.y,                                 
                                raycastHitG.position, 
                                this);
          hitList.push(raycastHitG.entity);
        }
        
        const raycastHitH = this.dynamicRaycastCircle(this.center.x, 
                                                this.center.y + facingOffset, 
                                                targetPoint.x - spread, 
                                                targetPoint.y - reach);
        
        if (raycastHitH.collision) {          
          this.visualizeRaycast(this.center.x, 
                                this.center.y + facingOffset, 
                                // targetPoint.x - spread, 
                                // targetPoint.y - reach,
                                raycastHitH.position.x, 
                                raycastHitH.position.y,                                 
                                raycastHitH.position, 
                                this);
          hitList.push(raycastHitH.entity);
        }
        
        const raycastHitI = this.dynamicRaycastCircle(this.center.x, 
                                                this.center.y + facingOffset, 
                                                targetPoint.x + spread, 
                                                targetPoint.y - reach);
        
        if (raycastHitI.collision) {          
          this.visualizeRaycast(this.center.x, 
                                this.center.y + facingOffset, 
                                // targetPoint.x + spread, 
                                // targetPoint.y - reach,
                                raycastHitI.position.x, 
                                raycastHitI.position.y,                                 
                                raycastHitI.position, 
                                this); 
          hitList.push(raycastHitI.entity);
        }          
        break;
      
      case 'LEFT':
        targetPoint.x -= range;
        
        const raycastHitJ = this.dynamicRaycastCircle(this.center.x - facingOffset, 
                                                this.center.y, 
                                                targetPoint.x, 
                                                targetPoint.y);
        
        if (raycastHitJ.collision) {          
          this.visualizeRaycast(this.center.x - facingOffset, 
                                this.center.y, 
                                // targetPoint.x, 
                                // targetPoint.y, 
                                raycastHitJ.position.x, 
                                raycastHitJ.position.y,                                 
                                raycastHitJ.position, 
                                this);
          hitList.push(raycastHitJ.entity);
        }
        
        const raycastHitK = this.dynamicRaycastCircle(this.center.x - facingOffset, 
                                                this.center.y, 
                                                targetPoint.x + reach, 
                                                targetPoint.y - spread);
        
        if (raycastHitK.collision) {          
          this.visualizeRaycast(this.center.x - facingOffset, 
                                this.center.y, 
                                // targetPoint.x + reach, 
                                // targetPoint.y - spread,
                                raycastHitK.position.x, 
                                raycastHitK.position.y,                                 
                                raycastHitK.position, 
                                this);
          hitList.push(raycastHitK.entity);
        }
        
        const raycastHitL = this.dynamicRaycastCircle(this.center.x - facingOffset, 
                                                this.center.y, 
                                                targetPoint.x + reach, 
                                                targetPoint.y + spread);
        
        if (raycastHitL.collision) {          
          this.visualizeRaycast(this.center.x - facingOffset, 
                                this.center.y, 
                                // targetPoint.x + reach, 
                                // targetPoint.y + spread,
                                raycastHitL.position.x, 
                                raycastHitL.position.y,                                 
                                raycastHitL.position, 
                                this);
          hitList.push(raycastHitL.entity);
        }          
        break;
    }   

    for (let i = hitList.length -1; i >= 0; i--) {
      const target = hitList[i];
      
      target.onEnergyShield();
      target.subtractHealth(1);              
      
      this.debugLog(target.entityId, target.currentHealth)

    }
    return hitList;    

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
      if (this.facingDirection === LEFT) {this.body.animations.play("standLeft")}
      if (this.facingDirection === RIGHT) {this.body.animations.play("standRight")}
      if (this.facingDirection === UP) {this.body.animations.play("standUp")}
      if (this.facingDirection === DOWN) {this.body.animations.play("standDown")}
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
    const nearbyEntities = this.findEntitiesWithinRadius(this, this.sensingRadius);
    this.debugLog(nearbyEntities)
    this.pursueNearestEntity(nearbyEntities);    
    
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