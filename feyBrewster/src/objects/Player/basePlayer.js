const basePlayer = {
  name: "Ross",
  type: Player,
 
  credits: 0,  

  maxHealth: 100,
  health: 100,
  maxEnergy: 20,
  energy: 20,
  
  attack: 10,
  defense: 5,
  
  magic: 2,
  resist: 1,
  
  isAlive: true,
  respawnDelay: 10000,
  
  hasCollision: true,
  width: 32,
  height: 32,
  radius: 16,
  
  mass: 200,
  speed: 2,
  spin: DOWN,
  acceleration: 0,
  
  awarenessField: 5,

  mainhand: Air,
  offhand: Air,
  
  body: player,
  
  originPosition: {x: 0, y: 0},
  originWorld: "brewhouse",
  
  position: {x: 0, y: 0},
  currentWorld: "brewhouse",
  
  
}