import Phaser from "phaser";
import { createCharacterAnims } from "~/anims/CharacterAnims";
import { createPropsAnims } from "~/anims/PropsAnims";
import { AUDIO_ASSETS } from "~/constants/AudioAssets";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  preload() {
    this.load.image("Interior", "tiles/interior.png");
    this.load.image("modern", "tiles/modern.png");
    this.load.image("tech", "tiles/tech.png");
    this.load.image("dungeon", "tiles/dungeon.png");
    this.load.image("props", "tiles/props.png");
    this.load.image("moreProps", "tiles/MoreProps.png")
    this.load.image("slates", "tiles/slates.png");
    this.load.image("Overworld", "tiles/Overworld.png");
    this.load.image("cave", "tiles/cave.png");

    this.load.tilemapTiledJSON("user_room", "tiles/modern_tilemap.json");
    this.load.tilemapTiledJSON("battle_room", "tiles/battle_tilemap.json");

    //load props
    this.load.atlas("blue-flag", "props/blue-flag/blue-flag.png", "props/blue-flag/blue-flag.json");
    this.load.atlas("red-flag", "props/red-flag/red-flag.png", "props/red-flag/red-flag.json");

    //load character
    this.load.atlas(
      "faune",
      "character/faune/faune.png",
      "character/faune/faune.json",
    );
    this.load.atlas(
      "hero",
      "character/hero/hero.png",
      "character/hero/hero.json",
    );

    //load enemies
    this.load.atlas("lizard", "enemies/lizard.png", "enemies/lizard.json");
    this.load.atlas("dragon", "enemies/dragon.png", "enemies/dragon.json");
    this.load.atlas(
      "grimlock",
      "enemies/grimlock/grimlock.png",
      "enemies/grimlock/grimlock.json",
    );
    this.load.atlas(
      "golem1",
      "enemies/golem1/golem1.png",
      "enemies/golem1/golem1.json",
    );
    this.load.atlas("golem2",
      "enemies/golem2/golem2.png",
      "enemies/golem2/golem2.json",
    );

    this.load.atlas("golem1-die", "enemies/golem1/golem1-die.png", "enemies/golem1/golem1-die.json");

    this.load.image("ui-heart-empty", "ui/ui_heart_empty.png");
    this.load.image("ui-heart-full", "ui/ui_heart_full.png");
    this.load.image('village-background', 'ui/village-background.png');

    // ---------------------------to be deleted--------------------//
    this.load.scenePlugin({
      key: "rexuiplugin",
      url: "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
      sceneKey: "rexUI",
    });
    // Preload assets
    this.load.image('background', 'ui/start-background.png');
    this.load.image('startButton', 'ui/start-button.png');
    this.load.image("arrow", "ui/arrow.png");
    this.load.image("crown", "ui/crown.png");

    this.load.audio('playerMove', ['audio/gravel.ogg']);
    this.load.audio('playerMove2', ['audio/steps-wood.ogg']);
    this.load.image("background", "ui/start-background.png");
    this.load.image("startButton", "ui/start-button.png");
    this.load.image("arrow", "ui/arrow.png");
    this.load.image('big-speech-bubble', 'ui/big-speech-bubble.png');
    this.load.image('robot', 'ui/robot.png');
    this.load.image('dungeon-background', 'ui/dungeon-background.png');


    // this.load.audio('dafunk', [
    //   'audio/Dafunk - Hardcore Power (We Believe In Goa - Remix).ogg',
    //   'audio/Dafunk - Hardcore Power (We Believe In Goa - Remix).mp3',
    //   'audio/Dafunk - Hardcore Power (We Believe In Goa - Remix).m4a'
    // ]);

    AUDIO_ASSETS.forEach(file => {
      this.load.audio(file.key, file.paths);
    });
    this.load.audio("battle", ['audio/battle.mp3']);
    this.load.audio("lobby", ['audio/lobby.mp3']);

    // this.load.audio('dafunk', [
    //   'audio/Dafunk - Hardcore Power (We Believe In Goa - Remix).ogg',
    //   'audio/Dafunk - Hardcore Power (We Believe In Goa - Remix).mp3',
    //   'audio/Dafunk - Hardcore Power (We Believe In Goa - Remix).m4a'
    // ]);

    this.load.audio('monster-scream', ['audio/monster-scream.mp3']);
    // ---------------------------to be deleted--------------------//
  }

  create() {
    //-- to be deleted---//
    createCharacterAnims(this.anims);
    createPropsAnims(this.anims);
    // to be deleted //

    this.scene.start("start");
  }
}