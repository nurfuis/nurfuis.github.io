class Main {
  constructor() {
    this.player = new Player();
    this.opponent = new Opponent();
    loadStartGameButton();  		
  }

}

class Player {
  constructor() {
    this.health = 100;
    this.attack = 10;
  }

  attack(opponent) {
    opponent.health -= this.attack;
  }

  isDead() {
    return this.health <= 0;
  }
}

class Opponent {
  constructor() {
    this.health = 100;
    this.attack = 10;
  }

  attack(player) {
    player.health -= this.attack;
  }

  isDead() {
    return this.health <= 0;
  }
}

const main = new Main();
