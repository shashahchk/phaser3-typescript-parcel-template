import Phaser from "phaser";
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import BBCodeText from "phaser3-rex-plugins/plugins/bbcodetext.js";
import * as Colyseus from "colyseus.js";

export default class GameUi extends Phaser.Scene {
  rexUI: UIPlugin;
  private room: Colyseus.Room | undefined; //room is a property of the class
  private messageBox: any; // Assuming rexUI types are not strongly typed in your setup
  private userListBox: any;
  private inputPanel: any;
  private mainPanel: any;
  private upperPanel: any;
  private client: Colyseus.Client | undefined;
  private spaceKey: Phaser.Input.Keyboard.Key;
  private isFocused = false;
  private inputBox: any;
  private enterKey: Phaser.Input.Keyboard.Key;
  private userNameBox: any;
  private userName: string;
  private channelList = ["all", "team"];
  private currentChannel = "all";
  private currentChannelType = "all";
  private currentScene: string;

  // make an enum for different channels

  constructor() {
    super({ key: "game-ui" }); //can handle both object and string
  }

  preload() {
    this.load.scenePlugin({
      key: "rexuiplugin",
      url: "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js",
      sceneKey: "rexUI",
    });
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
    this.enterKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER,
    );
  }

  create(data) {
    const hearts = this.add.group({
      classType: Phaser.GameObjects.Image,
    });

    this.currentScene = data.currentScene;

    var userID = "Hello",
      username = this.room.sessionId;
    console.log("UI data are", data.username);
    this.username = data.username;

    this.createMainPanel({
      x: 700,
      y: 80,
      width: 200,
      height: 140,
      color: {
        background: 0x0e376f,
        track: 0x3a6ba5,
        thumb: 0xbfcdbb,
        inputBackground: 0x685784,
        inputBox: 0x182456,
      },
      username: username,
    });

    this.mainPanel.layout();
    this.createToggleChatButton();

    hearts.createMultiple({
      key: "ui-heart-full",
      setXY: {
        x: 10,
        y: 10,
        stepX: 16,
      },
      quantity: 3,
    });

    this.room.onMessage("newPlayer", ([users]) => {
      users = users.filter((user) => user !== "");
      console.log(users);
      console.log("new player joined");
      // if any of the user is "", remove it

      this.setUserListTextBox(users);
    });

    this.room.onMessage("player_left", ([users]) => {
      this.setUserListTextBox(users);
    });

    this.input.on("pointerdown", (pointer) => {
      // Check if the click is outside the mainPanel
      const isOutside = !this.mainPanel
        .getBounds()
        .contains(pointer.x, pointer.y);

      if (isOutside) {
        // Emit an event or handle the outside click directly
        this.events.emit("clickedOutside");
        this.isFocused = false;
      }
    });

    // Listen for the even when space key is pressed to create a space in the input box
    // for some reason space key cannot be registered by the input box
    this.spaceKey.on("down", () => {
      if (this.isFocused) {
        // Append a space to the inputBox text
        // This assumes inputBox.text is accessible and modifiable.
        // You might need to adapt this depending on how rexUI handles text updates.
        // for some reason this work? any random invalid method will work
        // temporary fix
        this.inputBox.text.appendText(" ");
      }
    });

    this.enterKey.on("down", async () => {
      if (this.isFocused) {
        // Append a space to the inputBox text
        // This assumes inputBox.text is accessible and modifiable.
        // You might need to adapt this depending on how rexUI handles text updates.
        // for some reason this work? any random invalud method will work
        console.log(this.username);
        if (this.inputBox.text !== "" && this.username !== undefined) {
          this.events.emit(
            "send-message",
            this.inputBox.text,
            this.usernameBox.text,
          );
          this.room.send("sent_message", {
            message: this.inputBox.text,
            channel: this.currentChannel,
            channelType: this.currentChannelType,
          });
          this.inputBox.text = "";
        }
      }
    });

    this.scene.get(this.currentScene).events.on("userNameSet", (username) => {
      this.userName = username;
      // Update the UI based on the username
    });
    // after setting up finished, send a message to the server to update the userlist (mainly for battleroom)

    this.room.send("updatePlayerList");

  }

  setRoom(room: Colyseus.Room) {
    this.room = room;
    // You can now use this.room to listen for messages or send messages

    this.room.onMessage("new_message", (message) => {
      console.log(message);
      this.appendMessage(message);
    });

    if (this.room) {
      console.log("room set");
    }
  }

  setClient(client: Colyseus.Client) {
    this.client = client;
  }

  messageToString(message) {
    return `[${message.senderName}] ${message.message}\n`;
  }

  setMessage(message) {
    var s = this.messageToString(message);
    this.messageBox.appendText(s).scrollToBottom();
  }

  setUserListTextBox(users) {
    if (this.currentScene === "battle") {
      console.log("battle hence set team");
      this.channelList = ["all", "team", ...users];
    } else {
      this.channelList = ["all", ...users];
    }

    if (this.userListBox) this.userListBox.setText(users.join("\n"));
  }

  appendMessage(message) {
    var s = this.messageToString(message);
    this.messageBox.appendText(s).scrollToBottom();
  }

  createMainPanel(config) {
    this.mainPanel = this.rexUI.add.sizer({
      x: config.x,
      y: config.y,
      width: config.width,
      height: config.height,
      orientation: "y",
    });

    this.upperPanel = this.rexUI.add.sizer({
      orientation: "x",
    });
    var background = this.rexUI.add.roundRectangle(
      0,
      0,
      2,
      2,
      20,
      config.color.background,
    );
    this.createUserListBox(config);
    this.createMessageBox(config);
    this.createInputPanel(config);
    if (this.mainPanel) {
      console.log("mainPanel created");
    }
    if (this.inputPanel) {
      console.log("inputPanel created");
    }

    this.upperPanel
      .add(
        this.userListBox, //child
        0, // proportion
        "center", // align
        { right: 5 }, // paddingConfig
        true, // expand
      )
      .add(
        this.messageBox, //child
        1, // proportion
        "center", // align
        0, // paddingConfig
        true, // expand
      );

    if (this.upperPanel) {
      console.log("upperPanel created");
    }

    this.mainPanel
      .addBackground(background)
      .add(
        this.upperPanel, //child
        1, // proportion
        "center", // align
        { top: 10, bottom: 10, left: 5, right: 5 }, // paddingConfig
        true, // expand
      )
      .add(
        this.inputPanel, //child
        0, // proportion
        "center", // align
        0, // paddingConfig
        true, // expand
      );
  }

  createUserListBox(config) {
    var userListBox = this.rexUI.add.textArea({
      width: 150,
      background: this.mainPanel.scene.rexUI.add.roundRectangle(
        0,
        0,
        0,
        0,
        0,
        config.color.inputBox,
        0.5,
      ),
      text: this.mainPanel.scene.add.text(0, 0, "", {}),

      slider: false,

      name: "userListBox",
    });

    // Control

    this.userListBox = userListBox;
  }

  createMessageBox(config) {
    var messageBox = this.mainPanel.scene.rexUI.add.textArea({
      text: this.mainPanel.scene.add.text(0, 0, "", {
        wordWrap: { width: config.wrapWidth, useAdvancedWrap: true },
      }),

      slider: {
        track: this.mainPanel.scene.rexUI.add.roundRectangle(
          0,
          0,
          20,
          10,
          10,
          config.color.track,
        ),
        thumb: this.mainPanel.scene.rexUI.add.roundRectangle(
          0,
          0,
          0,
          0,
          10,
          config.color.thumb,
        ),
      },

      name: "messageBox",
    });

    // Control

    this.messageBox = messageBox;
  }

  createInputPanel(config) {
    var background = this.mainPanel.scene.rexUI.add.roundRectangle(
      0,
      0,
      2,
      2,
      { bl: 20, br: 20 },
      config.color.inputBackground,
    ); // Height is 40
    this.usernameBox = this.mainPanel.scene.add.text(0, 0, "", {
      halign: "right",
      valign: "center",
      Width: 50,
      fixedHeight: 20,
    });

    let channelText = this.add
      .text(400, 50, "all", { color: "#555555" })
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        channelText.setStyle({ fill: "#f00" });
      })
      .on("pointerout", () => {
        channelText.setStyle({ fill: "#555555" });
      })
      .on("pointerdown", () => {
        // when pressed set to next channel, if the channel is this sessionId, skip
        var index = 1 + this.channelList.indexOf(channelText.text);
        if (this.channelList[index] === this.userName) {
          index += 1;
        }
        if (index >= this.channelList.length) {
          index = 0;
        }
        // set the channel type to all
        if (index == 0) {
          this.currentChannelType = "all";
        }

        if (index == 1 && this.currentScene === "battle") {
          this.currentChannelType = "team";
        } else {
          this.currentChannelType = "private";
        }
        console.log(this.currentChannelType);
        console.log(this.channelList[index]);
        channelText.setText(this.channelList[index]);
        this.currentChannel = this.channelList[index];
      })
      .setDepth(1000);

    this.inputBox = this.mainPanel.scene.add.text(0, 0, "Hello world", {
      halign: "right",
      valign: "center",
      fixedWidth: 300,
      fixedHeight: 20,
      backgroundColor: `#${config.color.inputBox.toString(16)}`,
    });

    var SendBtn = this.mainPanel.scene.rexUI.add.label({
      text: this.mainPanel.scene.add.text(0, 0, "Send", { fontSize: 18 }),
    });

    var inputPanel = this.mainPanel.scene.rexUI.add.label({
      height: 40,

      background: background,
      icon: this.usernameBox,
      text: this.inputBox,
      expandTextWidth: true,
      action: SendBtn,

      space: {
        left: 15,
        right: 15,
        top: 0,
        bottom: 0,

        icon: 10,
        text: 10,
      },
    });

    // Control
    SendBtn.setInteractive().on(
      "pointerdown",
      async function () {
        if (this.inputBox.text !== "" && this.userName !== undefined) {
          this.events.emit(this.inputBox.text, this.userNameBox.text);
          await this.room.send("sent_message", {
            message: this.inputBox.text,
            channel: this.currentChannel,
            channelType: this.currentChannelType,
          });
          this.inputBox.text = "";
        }
      }.bind(this),
    );

    this.usernameBox.setInteractive().on(
      "pointerdown",
      function () {
        var prevUserName = this.usernameBox.text;
        this.mainPanel.scene.rexUI.edit(
          this.usernameBox, // text game object
          undefined, // Config
          function (textObject) {
            // onClose
            var currUserName = textObject.text;
            if (currUserName !== prevUserName) {
              this.emit("change-name", currUserName, prevUserName);
            }
          },
        );
      }.bind(this),
    );

    this.inputBox.setInteractive().on(
      "pointerdown",
      function () {
        this.isFocused = true;
        this.events.emit("inputFocused");

        this.mainPanel.scene.rexUI.edit(this.inputBox);
      }.bind(this),
    );

    this.inputPanel = inputPanel;
  }

  createToggleChatButton() {
    const toggleButton = this.add
      .text(440, 10, "-", {
        fontSize: "24px",
        padding: { left: 5, right: 5, top: 2, bottom: 2 },
        backgroundColor: "#555",
        color: "#fff",
      })
      .setInteractive();

    let isMinimized = false; // Tracks the state of the chatbox

    toggleButton.on("pointerdown", () => {
      isMinimized = !isMinimized; // Toggle the state

      // Toggle the visibility of the chat components
      this.mainPanel.setVisible(!isMinimized);
      this.upperPanel.setVisible(!isMinimized); // Assuming this is part of the chat UI
      this.inputPanel.setVisible(!isMinimized); // Assuming this is part of the chat UI

      // Update the button's text or appearance based on the state
      toggleButton.setText(isMinimized ? "+" : "-");

      // Optionally, adjust the chatbox and button positions based on the minimized state
      // For simplicity, this example doesn't include position adjustments
    });

    // Ensure the toggle button does not move with the camera
    toggleButton.setScrollFactor(0);
  }
  async sendUserJoinMessage() {
    if (this.room) {
      await this.room.send("playerJoined");
    }
  }
}
