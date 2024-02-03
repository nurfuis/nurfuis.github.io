import { events } from "./Events.js";
import { Vector2 } from "./Vector2.js";
import { Commands } from "./Commands.js";
import { Sprite } from "./Sprite.js";
import { resources } from "./Resource.js";
import { GameObject } from "./GameObject.js";

import { generateChunkData } from "./helpers/generateChunkData.js";
import { checkFileExists } from "./helpers/checkFileExists.js";
import { loadWorldMap } from "./helpers/loadWorldMap.js";

import { Chunk } from "./objects/Chunk/Chunk.js";

import { Terrain } from "./objects/Terrain/Terrain.js";
import { Scenery } from "./objects/Terrain/Scenery.js";
import { Entities } from "./objects/Entities/Entities.js";
import { Foreground } from "./objects/Foreground.js";
import { Overlay } from "./objects/Terrain/Overlay.js";
import { Collision } from "./objects/Collision/Collision.js";
import { Scripts } from "./objects/Scripts.js";


const CHUNK_SIZE = 512;
const VIEW_DISTANCE_X = 2;
const VIEW_DISTANCE_Y = 1;

export class SceneManager {
  constructor(mainScene, setList, playerList) {
    this.mainScene = mainScene;
    this.setList = setList;
    this.playerList = playerList;

    this.worldMaps = {};
    this.missingChunkBehavior = 'default';

    this.chunks = {};
    this.loadedChunks = {};
    this.recentlyLoadedChunks = {};

    this.currentChunkX = null;
    this.currentChunkY = null;
    this.currentWorld = 'brewhouse';

    this.terrain = new Terrain({ position: new Vector2(0, 0) });
    this.mainScene.addChild(this.terrain);
    
    this.scenery = new Scenery({ position: new Vector2(0, 0) });
    this.mainScene.addChild(this.scenery);    

    this.entities = new Entities({ position: new Vector2(0, 0) });
    this.mainScene.addChild(this.entities);
    
    this.foreground = new Foreground({ position: new Vector2(0, 0) });
    this.mainScene.addChild(this.foreground);
    
    this.overlay = new Overlay({ position: new Vector2(0, 0) });
    this.mainScene.addChild(this.overlay);    
    this.entities.overlay = this.overlay;
    
    this.collision = new Collision({ position: new Vector2(0, 0) });
    this.mainScene.addChild(this.collision);   
    
    this.scripts = new Scripts({ position: new Vector2(0, 0) });
    this.mainScene.addChild(this.scripts);   
   
    this.curtain = new GameObject({ position: new Vector2(0, 0) });
    this.mainScene.addChild(this.curtain);

    events.on("RESOURCES_LOADED", this, () => {
      const loadsetList = loadWorldMap(setList);
      console.log('resources loaded');
      });
      
    events.on("WORLD_LOADED", this, (world) => {
      const worldName = world.name;
      const worldMap = world.map;
      this.worldMaps[worldName] = worldMap;
      console.log(worldName, 'is loaded');
      if (this.currentWorld === worldName) {
        console.log('loading chunks for',worldName);
        this.closeCurtain();
        this.updateVisibleArea(0, 0, worldName, "teleport");
      }
    });
    
    events.on("CHUNK_NOT_FOUND", this, (chunk) => {
      if (this.missingChunkBehavior){
        // generateChunkData(chunk.x, chunk.y, this.currentWorld, this.missingChunkBehavior);
      }
    });
    
    events.on("CHUNK_FOUND", this, (chunk) => {
      this.addChunk(chunk.x, chunk.y, chunk.world, chunk.data);
    });
    
    events.on("REMOVE_CHUNK", this, (chunk) => {
      this.removeChunk(chunk.x, chunk.y, chunk.world);
    });
    
    events.on("SPAWN_ZONE_READY", this, (position) => {
      for (let i = 0; i < this.playerList.length; i++) {
        const player = this.playerList[i];
        this.foreground.addChild(player);
        player.joinWorld(position.x, position.y, position.world);
        player.spawn();
      }
      console.log('mainScene',this.mainScene);
    });
    
    events.on("PLAYER_POSITION", this, (position) => {
      this.updateVisibleArea(position.x, position.y, position.world);
    });
  }
  
  closeCurtain() {
    const curtainEffect = new GameObject({});

    const sprite = new Sprite({
      resource: resources.images.shroud,
      position: new Vector2(-1000, -560),
      frameSize: new Vector2(2000, 1125),
    });
    curtainEffect.addChild(sprite);

    this.curtain.addChild(curtainEffect);

    setTimeout(() => {
      this.curtain.removeChild(curtainEffect);
    }, 500);
  }
  
  purgeRecentChunks() {
    for (const chunkId in this.recentlyLoadedChunks) {
      delete this.recentlyLoadedChunks[chunkId];
    }
    for (const chunkId in this.loadedChunks) {
      const chunk = this.loadedChunks[chunkId];
      const chunkX = chunk.x;
      const chunkY = chunk.y;
      const world = chunk.world;
      events.emit("REMOVE_CHUNK", {
        x: chunkX,
        y: chunkY,
        world: world,
      });
    }
  }

  updateVisibleArea(x, y, world) {
    const {chunkX, chunkY } = this.worldToChunkCoords(x, y);

    if (this.currentWorld != world) {
      this.purgeRecentChunks();
    }

    if (this.currentChunkX != chunkX || this.currentChunkY != chunkY || this.world != world) {
      this.currentChunkX = chunkX;
      this.currentChunkY = chunkY;
      this.currentWorld = world;

      this.calculateSurroundingChunks();
    }
  }
  
  calculateSurroundingChunks() {
    const chunkCount = (VIEW_DISTANCE_X * 2 + 1) * (VIEW_DISTANCE_Y * 2 + 1);

    const currentChunkX = this.currentChunkX;
    const currentChunkY = this.currentChunkY;

    const surroundingChunks = Array(chunkCount)
      .fill(0)
      .map((_, index) => {
        const xOffset = index % (VIEW_DISTANCE_X * 2 + 1) - VIEW_DISTANCE_X;
        const yOffset = Math.floor(index / (VIEW_DISTANCE_X * 2 + 1)) - VIEW_DISTANCE_Y;
        const surroundingChunkX = currentChunkX + xOffset;
        const surroundingChunkY = currentChunkY + yOffset;
        return {
          x: surroundingChunkX,
          y: surroundingChunkY,
          world: this.currentWorld,
        };
      });

    this.processSurroundingChunks(surroundingChunks);
  }
  
  processSurroundingChunks(surroundingChunks) {
    for (const chunk of surroundingChunks) {
      const chunkX = chunk.x;
      const chunkY = chunk.y;
      const world = chunk.world;
      const chunkId = this.getChunkId(chunkX, chunkY, world);

      if (!this.chunks[chunkId]) {
        this.chunks[chunkId] = 'REQUESTED';

        setTimeout(() => {
          this.fetchChunk(chunkX, chunkY, world);
        }, 350);
      }
    }
    for (const chunkId in this.recentlyLoadedChunks) {
      this.recentlyLoadedChunks[chunkId]--;
      if (this.recentlyLoadedChunks[chunkId] <= 0) {
        delete this.recentlyLoadedChunks[chunkId];
      }
    }
    for (const chunkId in this.loadedChunks) {
      if (!this.recentlyLoadedChunks[chunkId]) {
        setTimeout(() => {
          this.pruneChunks(chunkId);
        }, 1000);
      }
    }
  }

  pruneChunks(chunkId) {
    const chunk = this.loadedChunks[chunkId];
    const chunkX = chunk.x;
    const chunkY = chunk.y;
    const world = chunk.world;
    const owner = chunkId;

    if (
      chunkX < this.currentChunkX - VIEW_DISTANCE_X ||
      chunkX > this.currentChunkX + VIEW_DISTANCE_X ||
      chunkY < this.currentChunkY - VIEW_DISTANCE_Y ||
      chunkY > this.currentChunkY + VIEW_DISTANCE_Y
      ) {
      events.emit("REMOVE_CHUNK", {
        x: chunkX,
        y: chunkY,
        world: world,
        owner: owner
      });
    }
  }
  
  async fetchChunk(chunkX, chunkY, world) {
    const chunkId = this.getChunkId(chunkX, chunkY, world);
    this.chunks[chunkId] = 'FETCHING';

    let numberOfChunkMaps = this.worldMaps[world].maps.length;
    // console.log(this.worldMaps[world]);
    for (let i = 0; i < numberOfChunkMaps; i++) {
      const worldMaps = this.worldMaps[world].maps;

      const fileName = worldMaps[i].fileName;
      const height = worldMaps[i].height;
      const width = worldMaps[i].height;
      const posX = worldMaps[i].x;
      const posY = worldMaps[i].y;
      
      const x = posX / width;
      const y = posY / height;

      if (x === chunkX && y === chunkY) {
        console.log('chunk x', chunkX,
                    'chunkY', chunkY,
                    'world', world, 
                    'fileName', fileName,
                    'height', height, 
                    'width', width,
                    'x', x,
                    'y', y);        
        
        await this.loadChunkData(chunkX, chunkY, world, fileName);

        return;
      }
    }

    this.chunks[chunkId] = 'EMPTY';
    events.emit("CHUNK_NOT_FOUND", {
      x: chunkX,
      y: chunkY,
    });
  }  
  
  async loadChunkData(chunkX, chunkY, world, file) {
    const chunkId = this.getChunkId(chunkX, chunkY, world);
    
    let fileName = file; 
    
    if (fileName.endsWith(".tmx")) { // hack for tiled
    	fileName = fileName.replace(".tmx", ".tmj");
    }
    
    const chunkPath = `./src/levels/${world}/${fileName}`;

    try {
      const exists = await checkFileExists(chunkPath);
      
      if (exists) {
        const response = await fetch(chunkPath);
        const chunkData = await response.json();
        
        this.chunks[chunkId] = 'LOADED';
        events.emit("CHUNK_FOUND", {
          x: chunkX,
          y: chunkY,
          world: world,
          data: chunkData,
        });
        return true;
      
      } else {
        console.warn(`Chunk not found: ${chunkPath}`);
        return false; // Indicate failure
      }
    
    } catch (error) {
      console.error('Error loading chunk:', error);
      return false; // Indicate failure
    }
  }
  
  addChunk(chunkX, chunkY, world, chunkData) {
    const chunkId = this.getChunkId(chunkX, chunkY, world);
    this.chunks[chunkId] = 'BUILDING';
    const chunk = new Chunk(chunkX, chunkY, world, chunkData, chunkId);
    
    chunk.addTerrain(this.terrain);
    chunk.addScenery(this.scenery);
    chunk.addEntities(this.entities, this.overlay);
    chunk.addForeground(this.foreground);    
    chunk.addOverlay(this.overlay);
    chunk.addCollision(this.collision);    
    chunk.addScripts(this.scripts);

    this.chunks[chunkId] = 'COMPLETE';
    this.recentlyLoadedChunks[chunkId] = 6;
    this.loadedChunks[chunkId] = chunk;
  }
  
  removeChunk(chunkX, chunkY, world) {
    const chunkId = this.getChunkId(chunkX, chunkY, world);
    const chunk = this.loadedChunks[chunkId];
    
    chunk.removeTerrain(this.terrain);
    chunk.removeScenery(this.scenery);
    chunk.removeEntities(this.entities);
    chunk.removeForeground(this.foreground);    
    chunk.removeOverlay(this.overlay);  
    chunk.removeCollision(this.collision);
    chunk.removeScripts(this.scripts);
    
    delete this.loadedChunks[chunkId];
    delete this.chunks[chunkId];
  }
  
  getChunkId (chunkX, chunkY, world) {
    const chunkId = `${chunkX},${chunkY},${world}`;
    return chunkId;
  }
  
  worldToChunkCoords(x, y) {
    const posX = Math.floor(x);
    const posY = Math.floor(y);

    const chunkX = Math.floor(posX / CHUNK_SIZE);
    const chunkY = Math.floor(posY / CHUNK_SIZE);
    return { chunkX, chunkY };
  }
}
