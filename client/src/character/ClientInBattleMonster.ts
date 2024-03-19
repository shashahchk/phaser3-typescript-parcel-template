import { HealthBar } from "~/components/HealthBar";
import * as Colyseus from "colyseus.js";
import Battle from "~/scenes/Battle";

export default class ClientInBattleMonster extends Phaser.Physics.Arcade
  .Sprite {
  //cannot make other classes extend directly from this, must extend from sprite to use physics(?)
  private id: number;
  private healthBar: HealthBar;
  private monsterName: Phaser.GameObjects.Text;
  public battleScene: Battle;

  private questions: string[] = [];
  private options: string[][] = [];
  private playersTackling: string[] = [];
  private numberOfPlayers: number = 0;

  private sfx: any; //sound effects
  private defeatedFlag: Phaser.Physics.Arcade.Sprite;

  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    this.battleScene = scene;
    this.healthBar = new HealthBar(scene, x, y);
    this.sfx = {};
    this.sfx.scream = this.battleScene.sound.add("monster-scream");

    this.battleScene.add.existing(this);
    this.battleScene.physics.add.existing(this);

    this.body.setSize(this.width * 0.5, this.height * 0.8);
    this.setInteractive();
  }

  setUpUpdateListeners(room: Colyseus.Room) {
    room.onMessage("monsterUpdate" + this.id.toString(), (message) => {
      this.healthBar.updateHealth(message.health);
      let usernamesTackling = [];
      message.playersTackling.forEach((playerID) => {
        usernamesTackling.push(room.state.players.get(playerID).username);
      });
      this.playersTackling = usernamesTackling;
      this.numberOfPlayers = this.playersTackling.length;
      console.log("number of players tackling", this.numberOfPlayers);
    });

    room
      .onMessage("monsterKilled" + this.id.toString(), (message) => {
        console.log("emitting monster killed event", this.id);
        this.battleScene.events.emit("destroy" + this.id, {});
        this.off("pointerdown");
      })
      .bind(this);
  }

  // I am assuming that id is unique for each monster, this is to allow
  // players to uniquely identify the monsters when communicating with each other
  setPosition(x, y) {
    this.x = x;
    this.y = y;

    if (this.healthBar) {
      this.healthBar.setPositionRelativeToCharacter(x, y);
    }
  }

  // need to adjust this to be relative to the monster size
  setMonsterNamePositionRelativeToMonster(x, y) {
    this.monsterName.x = x - 25;
    this.monsterName.y = y + 40;
  }

  update(cursors) {}

  die() {
    this.healthBar.destroy();
    this.sfx.scream.play();
    setTimeout(() => {
      this.defeatedFlag = this.battleScene.physics.add.sprite(
        this.x + 20,
        this.y + 5,
        "red-flag",
      );
    }, 1500);
    this.anims.play("golem1-die", true);
  }

  destroy() {
    super.destroy();
    if (this.monsterName) {
      this.monsterName.destroy();
    }
    if (this.healthBar) {
      this.healthBar.destroy();
    }
  }

  getQuestions(): string[] {
    return this.questions;
  }

  getOptions(): string[][] {
    return this.options;
  }

  addQuestion(question: string) {
    this.questions.push(question);
  }

  addOptions(options: string[]) {
    this.options.push(options);
  }

  setID(id: number) {
    this.id = id;
    // need a better way to set the monster name, included here cos ID is not initialized at the start
    this.monsterName = this.battleScene.add.text(0, 0, "Monster " + id, {
      fontSize: "12px",
    });
    this.setMonsterNamePositionRelativeToMonster(this.x, this.y);
  }

  getId() {
    return this.id;
  }

  getNumberOfPlayers() {
    return this.numberOfPlayers;
  }
}
