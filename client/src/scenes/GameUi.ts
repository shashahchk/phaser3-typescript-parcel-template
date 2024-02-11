import Phaser from "phaser"
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import * as Colyseus from "colyseus.js";

export default class GameUi extends Phaser.Scene {
    rexUI: UIPlugin;
    private room: Colyseus.Room | undefined; //room is a property of the class
    private messageBox: any; // Assuming rexUI types are not strongly typed in your setup
    private userListBox: any;
    private inputPanel: any;
    private mainPanel: any;
    private upperPanel: any;
    private client: Colyseus.Client | undefined
    // array of users
    private userList: string[] = [];

    constructor() {
        super({key: 'game-ui'}) //can handle both object and string
    }

    preload() {

        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
    }

    create() {

        const hearts = this.add.group({
            classType: Phaser.GameObjects.Image
        })

        var userID = "Hello",
            // i want to get the client's id
            userName = this.room.sessionId

        this.createMainPanel({
            x: 700, y: 80,
            width: 200, height: 140,
            color: {
                background: 0x0E376F,
                track: 0x3A6BA5,
                thumb: 0xBFCDBB,
                inputBackground: 0x685784,
                inputBox: 0x182456
            },
            userName: userName
        })


        this.mainPanel.layout()



        hearts.createMultiple({
            key: 'ui-heart-full',
            setXY: {
                x: 10,
                y: 10,
                stepX: 16
            },
            quantity: 3
        });



        this.room.onMessage("new_player", ([users]) => {
            this.setUserList(users);
        });

        this.upDateUserList().then(() => {
            console.log("user list updated")
        });

        this.input.on('pointerdown', (pointer) => {
            // Check if the click is outside the mainPanel
            const isOutside = !this.mainPanel.getBounds().contains(pointer.x, pointer.y);

            if (isOutside) {
                // Emit an event or handle the outside click directly
                this.events.emit('clickedOutside');
            }
        });
    }


    setRoom(room: Colyseus.Room) {
        this.room = room;
        // You can now use this.room to listen for messages or send messages

        this.room.onMessage('new_message', (message) => {
            console.log(message)
            this.appendMessage(message);
        })

        if (this.room) {
            console.log("room set")
        }

    }

    setClient(client: Colyseus.Client) {
        this.client = client;
    }

    messageToString(message) {
        return `[${message.senderName}] ${message.message}\n`;
    }

    setMessages(message) {
        var s = this.messageToString(message);
        this.messageBox
            .appendText(s)
            .scrollToBottom()
    }

    setUserList(users) {
        var s = []
        console.log(users)
        users.forEach(function (user) {
            s.push(user)
        })
        if (this.userListBox)
        this.userListBox.setText(s.join('\n'));

    }

    appendMessage(message) {
        var s = this.messageToString(message);
        this.messageBox
            .appendText(s)
            .scrollToBottom()
    }

    createMainPanel(config) {
        this.mainPanel = this.rexUI.add.sizer({
            x: config.x, y: config.y,
            width: config.width, height: config.height,
            orientation: 'y'
        });

        this.upperPanel = this.rexUI.add.sizer({
            orientation: 'x'
        });
        var background = this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, config.color.background);
        this.createUserListBox(config);
        this.createMessageBox(config);
        this.createInputPanel(config);
        if (this.mainPanel){
            console.log("mainPanel created")
        }
        if (this.inputPanel) {
            console.log("inputPanel created")
        }



        this.upperPanel
            .add(
                this.userListBox, //child
                0, // proportion
                'center', // align
                { right: 5 }, // paddingConfig
                true, // expand
            )
            .add(
                this.messageBox, //child
                1, // proportion
                'center', // align
                0, // paddingConfig
                true, // expand
            )

        if(this.upperPanel) {
            console.log("upperPanel created")
        }


        this.mainPanel
            .addBackground(background)
            .add(
                this.upperPanel, //child
                1, // proportion
                'center', // align
                { top: 10, bottom: 10, left: 5, right: 5 }, // paddingConfig
                true, // expand
            )
            .add(
                this.inputPanel, //child
                0, // proportion
                'center', // align
                0, // paddingConfig
                true, // expand
            );
    };

    createUserListBox(config) {

        var userListBox = this.rexUI.add.textArea({
            width: 150,
            background: this.mainPanel.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, config.color.inputBox, 0.5),
            text: this.mainPanel.scene.rexUI.add.BBCodeText(0, 0, '', {

            }),

            slider: false,

            name: 'userListBox'
        });


        // Control

        this.userListBox = userListBox;
    }

    createMessageBox (config) {
        var  messageBox = this.mainPanel.scene.rexUI.add.textArea({
            text: this.mainPanel.scene.rexUI.add.BBCodeText(0, 0, '', {
            }),

            slider: {
                track: this.mainPanel.scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, config.color.track),
                thumb: this.mainPanel.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, config.color.thumb),
            },


            name: 'messageBox'
        });

        // Control

        this.messageBox = messageBox;
    };

    createInputPanel(config) {

        var background = this.mainPanel.scene.rexUI.add.roundRectangle(0, 0, 2, 2, { bl: 20, br: 20 }, config.color.inputBackground); // Height is 40
        var userNameBox = this.mainPanel.scene.rexUI.add.BBCodeText(0, 0, config.userName, {
            halign: 'right',
            valign: 'center',
            Width: 50,
            fixedHeight: 20
        });

        var inputBox = this.mainPanel.scene.rexUI.add.BBCodeText(0, 0, 'Hello world', {
            halign: 'right',
            valign: 'center',
            fixedWidth: 300,
            fixedHeight: 20,
            backgroundColor: `#${config.color.inputBox.toString(16)}`
        });

        var SendBtn = this.mainPanel.scene.rexUI.add.BBCodeText(0, 0, 'Send', {

        });

        var inputPanel = this.mainPanel.scene.rexUI.add.label({
            height: 40,

            background: background,
            icon: userNameBox,
            text: inputBox,
            expandTextWidth: true,
            action: SendBtn,

            space: {
                left: 15,
                right: 15,
                top: 0,
                bottom: 0,

                icon: 10,
                text: 10,
            }
        });

        // Control
        SendBtn.setInteractive().on('pointerdown', (async function () {

            if (inputBox.text !== '') {
                this.events.emit('send-message', inputBox.text, userNameBox.text);
                await this.room.send("sent_message", inputBox.text);
                inputBox.text = '';

            }
        }).bind(this));

        userNameBox
            .setInteractive()
            .on('pointerdown', (function () {
                var prevUserName = userNameBox.text;
                this.mainPanel.scene.rexUI.edit(
                    userNameBox,  // text game object
                    undefined,  // Config
                    function (textObject) { // onClose
                        var currUserName = textObject.text
                        if (currUserName !== prevUserName) {
                            this.emit('change-name', currUserName, prevUserName);
                        }
                    }
                );
            }).bind(this));

        inputBox
            .setInteractive()
            .on('pointerdown', (function () {
                this.events.emit('inputFocused', true);
                this.mainPanel.scene.rexUI.edit(inputBox);

            }).bind(this));

        this.inputPanel = inputPanel;
    }

    async upDateUserList() {
        if (this.room) {
            await this.room.send("player_joined");
        }
    }






}










