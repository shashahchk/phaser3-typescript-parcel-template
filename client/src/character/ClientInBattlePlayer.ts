import { HealthBar } from "~/components/HealthBar";
import Colyseus from "colyseus.js";

export default class ClientInBattlePlayer extends Phaser.Physics.Arcade.Sprite {
  //cannot make other classes extend directly from this, must extend from sprite to use physics(?)
  private healthBar: HealthBar;
  public scene: Phaser.Scene;
  private username: Phaser.GameObjects.Text;
  private sfx: any; //sound effects
  private Y_OFFSET_FROM_HEAD = 35;
  private charName: string;

  constructor(
    scene,
    x: number,
    y: number,
    username: string,
    texture,
    frame,
    charName,
    playerEXP,
  ) {
    super(scene, x, y, texture, frame);
    scene.playerEntities[scene.room.sessionId] = this;

    this.charName = charName;
    this.scene = scene;
    this.healthBar = new HealthBar(scene, x, y);
    this.setUsername(username);
    this.sfx = {};
    this.sfx.walk = scene.sound.add("playerMove2");
    this.sfx.die = scene.sound.add("dead");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(this.width * 0.5, this.height * 0.8);
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;

    if (this.healthBar) {
      this.healthBar.setPositionRelativeToCharacter(x, y);
    }
  }

  die() {
    this.sfx.die.play();
    this.setAlpha(0.5);
  }

  setUsername(username: string) {
    if (username == undefined) {
      this.username = this.scene.add.text(this.x, this.y, "undefined", {
        fontSize: "12px",
      });
    } else {
      this.username = this.scene.add.text(this.x, this.y, username, {
        fontSize: "12px",
      });
    }
  }

  setUsernamePosition(username: Phaser.GameObjects.Text) {
    username.x = this.x - username.width / 2;
    username.y = this.y - this.Y_OFFSET_FROM_HEAD;
  }

  updateAnimsAndSyncWithServer(
    room: Colyseus.Room,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
  ) {
    if (!cursors) return;

    const speed = 100;

    if (cursors.left?.isDown) {
      this.anims?.play(`${this.charName}-walk-side`, true);
      this.setVelocity(-speed, 0);
      this.flipX = true;
    } else if (cursors.right?.isDown) {
      this.anims?.play(`${this.charName}-walk-side`, true);
      this.setVelocity(speed, 0);
      this.flipX = false;
    } else if (cursors.up?.isDown) {
      this.anims?.play(`${this.charName}-walk-up`, true);
      this.setVelocity(0, -speed);
    } else if (cursors.down?.isDown) {
      this.anims?.play(`${this.charName}-walk-down`, true);
      this.setVelocity(0, speed);
    } else {
      if (this.anims && this.anims.currentAnim != null) {
        const parts = this.anims.currentAnim.key.split("-");
        parts[1] = "idle"; //keep the direction
        //if all the parts are not undefined
        if (parts.every((part) => part !== undefined)) {
          this.anims.play(parts.join("-"), true);
        }
        this.setVelocity(0, 0);
      }
    }

    this.setUsernamePosition(this.username);
    this.healthBar.setPositionRelativeToCharacter(this.x, this.y);

    if (
      cursors.left?.isDown ||
      cursors.right?.isDown ||
      cursors.up?.isDown ||
      cursors.down?.isDown
    ) {
      if (!this.sfx.walk.isPlaying) {
        this.sfx.walk.play();
      }
      room.send("move", {
        x: this.x,
        y: this.y,
        direction: this.flipX ? "left" : "right",
      });
    }
  }

  updateAnimsWithServerInfo(player) {
    if (!this || !player) return;

    if (player.x == undefined || player.y == undefined) return;
    this.x = player.x;
    this.y = player.y;

    var animsDir;
    var animsState;

    if (player.direction == undefined) return;

    switch (player.direction) {
      case "left":
        animsDir = "side";
        this.flipX = true; // Assuming the side animation faces right by default
        break;
      case "right":
        animsDir = "side";
        this.flipX = false;
        break;
      case "up":
        animsDir = "up";
        break;
      case "down":
        animsDir = "down";
        break;
    }

    if (player.isMoving != undefined && player.isMoving) {
      animsState = "walk";
    } else {
      animsState = "idle";
    }

    if (
      animsState != undefined &&
      animsDir != undefined &&
      this.charName != undefined
    ) {
      this.anims?.play(`${this.charName}-` + animsState + "-" + animsDir, true);
    }

    this.setUsernamePosition(this.username);
    this.healthBar?.setPositionRelativeToCharacter(this.x, this.y);
  }

  update() {}

  destroy() {
    this.healthBar.destroy();
    this.username.destroy();
    super.destroy();
  }

  updateHealthWithServerInfo(player) {
    if (!player) {
      return;
    }
    console.log("health changed");
    this.healthBar.updateHealth(player.health);
    if (player.health == 0) {
      this.die();
    } else {
      this.setAlpha(1);
    }
  }

  updateHealth(newHealth: number) {
    this.healthBar.updateHealth(newHealth);
  }
}
