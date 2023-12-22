// Grass.js
import {events} from "../../../Events.js";
import {Oat} from "../../Items/Oat/Oat.js";
import { resources } from "../../../Resource.js";
import { GameObject } from "../../../GameObject.js";
import { Vector2 } from "../../../Vector2.js";
import { Sprite } from "../../../Sprite.js";
import { gridSize } from "../../../helpers/grid.js";
import { Animations } from "../../../Animations.js";
import { FrameIndexPattern } from "../../../FrameIndexPattern.js";
import {
  GRASS_MOVING_1,
  GRASS_STILL,
  GRASS_RESPAWN,
} from "./grassAnimations.js";


export class Grass extends GameObject {
  constructor(x, y, tileData) {
    super({
      position: new Vector2(x, y),
    });
    this.sprite = new Sprite({
      resource: resources.images.terrain,
      frameSize: new Vector2(16, 16),
      hFrames: 16,
      vFrames: 16,
      spacing: 0,
      frame: tileData, 
      animations: new Animations({
        grassStill: new FrameIndexPattern(GRASS_STILL),
        grassMoving1: new FrameIndexPattern(GRASS_MOVING_1),        
        grassRespawn: new FrameIndexPattern(GRASS_RESPAWN),

      }),
    });
    this.shakeGrassRespawn = 0;
    this.shakeGrassTime = 0;
    this.shakeGrassCooldown = 0;
    this.grassMoveTimer = 0;
    this.sprite.animations.play("grassStill");
    this.addChild(this.sprite);
  }
  ready() {
    events.on("PLAYER_POSITION", this, pos => {
      this.checkCollision(this, pos);
    })      
  }

  step(delta, root) {
    if (this.shakeGrassCooldown >= 0) {
      this.shakeGrassCooldownTimer(delta);

    }    
    if (this.shakeGrassRespawn >= 0){
      this.shakeGrassRespawnTimer(delta, root);
      return;
    }
    if (this.shakeGrassTime >= 0) {
      this.shakeGrass(delta, root);
      return;
    }
    if (this.grassMoveTimer >= 0) {
      this.grassMoveTimer -= delta; // Decrease timer based on delta

      if (this.grassMoveTimer <= 0) {
        // Play the grassMoving1 animation and reset timer
        const chanceToShake = Math.random(); // Generate a random value between 0 and 1 (exclusive)
        if (chanceToShake < 0.005) { // 10% chance (0.1 probability)        
          this.shakeGrassTime = 600; // ms         
        }
        const randomInterval = Math.floor(Math.random() * 60) + 1 *1000; // Convert to milliseconds
        // Set a timer for the next animation trigger
        this.grassMoveTimer = randomInterval;        
        return;        
      }
    }
    this.sprite.animations.play("grassStill");
  }
  
  shakeGrassCooldownTimer(delta) {
    this.shakeGrassCooldown -= delta;    
  }
  shakeGrassRespawnTimer(delta, root) {
    this.shakeGrassRespawn -= delta;
    this.sprite.animations.play("grassRespawn");
  }
  shakeGrass(delta, root) {
    this.shakeGrassTime -= delta;
    this.sprite.animations.play("grassMoving1");   
    
    
    if (this.shakeGrassTime <= 0 && this.shakeGrassCooldown >= 0) {
      
      const chanceToDrop = Math.random(); // Generate a random value between 0 and 1 (exclusive)
      if (chanceToDrop < 0.15) { // 10% chance (0.1 probability)
      this.shakeGrassRespawn = 150000;
        const x = this.position.x;
        const y = this.position.y;
        events.emit("DROP_ITEM", {
          posX: x, 
          posY: y,
          name: 'Oat',        
        });
      }
    }
  }
  checkCollision(oat, pos) {
    const roundedPlayerX = Math.round(pos.x);
    const roundedPlayerY = Math.round(pos.y);
    if (roundedPlayerX === oat.position.x && roundedPlayerY === oat.position.y) {
      this.onCollideWithPlayer();
    }
  }
  onCollideWithPlayer() {
    // start animation
    if (this.shakeGrassRespawn <= 0){
      if (this.shakeGrassCooldown <= 0) {
        this.shakeGrassTime = 600; // ms
        this.shakeGrassCooldown = 1800;
      };
    };
  }  
}