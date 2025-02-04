import ClientInBattleMonster from "~/character/ClientInBattleMonster";
import Battle from "~/scenes/Battle";

export class QuestionPopup {
  scene: any;
  popup: any;
  input: any;
  confirmButton: any;
  questions: string[];
  textLabel: any;
  scrollablePanel: any;
  options: string[][];
  completedQuestions: number[];
  optionBoxes: Phaser.GameObjects.Graphics[]; // Array to keep references to option graphics and text
  closeButton: any; // Reference to the close button
  container: Phaser.GameObjects.Container;
  monsterID: number;
  qnsId: number;
  currentQuestionIndex: number;
  questionText: Phaser.GameObjects.Text;
  optionTexts: Phaser.GameObjects.Text[];
  selectedOptionIndex: number = undefined;
  selectedOption: Phaser.GameObjects.Text;
  interactiveZones: Phaser.GameObjects.Zone[] = [];

  submitButton: Phaser.GameObjects.Text;

  // fields to be used for all
  x: number;
  optionWidth: number;
  optionHeight: number;
  borderRadius: number;
  optionStartY: number;
  questionTitle: Phaser.GameObjects.Text;

  constructor(scene, monster: ClientInBattleMonster, qnsId: number) {
    this.qnsId = qnsId;
    this.scene = scene;
    this.popup = null;
    this.input = null;
    this.confirmButton = null;
    this.textLabel = null;
    this.scrollablePanel = null;
    this.options = monster.getOptions();
    this.optionBoxes = []; // Initialize the array
    this.closeButton = null;
    this.questions = monster.getQuestions();
    this.completedQuestions = [];
    for (let i = 0; i < this.questions.length; i++) {
      this.completedQuestions.push(-1);
    }
    this.monsterID = monster.getId();
    this.currentQuestionIndex = qnsId;

    this.questionText = null;
    this.optionTexts = [];
    // Create the container and position it in the center of the camera's viewport
  }

  createPopup(monsterIndex: number, questionIndex: number) {
    const popupOffset = { x: 190, y: 0 }; // Adjust as needed
    const popupWidth = 600; // Adjusted for larger content
    const popupHeight = 500;
    const x = this.scene.cameras.main.centerX + popupOffset.x;
    const y = this.scene.cameras.main.centerY + popupOffset.y;

    this.x = x;
    // Options setup remains the same as your original code

    const optionWidth = popupWidth - 80;
    const optionHeight = 40;
    const borderRadius = 10;
    let optionStartY = y + 50; // Adjust start Y position for options
    this.optionWidth = optionWidth;
    this.optionHeight = optionHeight;
    this.borderRadius = borderRadius;
    this.optionStartY = optionStartY;

    this.container = this.scene.add.container();
    // this.container.setScrollFactor(0);

    this.container.setScrollFactor(0);

    // Popup Background
    this.popup = this.scene.add
      .graphics({
        x: x - popupWidth / 2,
        y: y - popupHeight / 2,
      })
      .fillStyle(0x000000, 0.8)
      .fillRoundedRect(0, 0, popupWidth, popupHeight, 20);

    this.questionTitle = this.scene.add
      .text(880, 147, "Your Question", {
        fontSize: "30px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(100);

    const closeButton = this.scene.add
      .text(x + popupWidth / 2 - 20, y - popupHeight / 2 + 5, "X", {
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#ff0000",
        padding: {
          left: 5,
          right: 5,
          top: 5,
          bottom: 5,
        },
      })
      .setInteractive({ useHandCursor: true });

    // Close button functionality
    closeButton.on("pointerdown", () => {
      this.closePopup(); // Function to close/hide the popup
    });

    // Ensuring the close button does not move with the camera
    this.container.add(this.popup);
    this.container.add(closeButton);
    closeButton.setScrollFactor(0);

    // Creating a RexUI Scrollable Panel for the text area
    const scrollablePanel = this.scene.rexUI.add
      .scrollablePanel({
        x: x,
        y: y - 100, // Adjust for positioning
        width: popupWidth - 40, // Slightly less than popup width for padding
        height: 200, // Adjusted height for text area
        scrollMode: 0, // Vertical scroll

        background: this.scene.rexUI.add.roundRectangle(
          0,
          0,
          2,
          2,
          10,
          0x4e4e4e
        ), // Optional: Adding a background to the scrollable area

        panel: {
          child: this.scene.add.text(0, 0, "", {
            fontSize: "20px",
            color: "#ffffff",
            wordWrap: { width: popupWidth - 100 }, // Ensure word wrap width is correct
          }),

          mask: { padding: 1 },
        },

        slider: {
          track: this.scene.rexUI.add.roundRectangle(
            0,
            0,
            20,
            10,
            10,
            0x797979
          ),
          thumb: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0xffffff),
        },

        space: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
          panel: 10,
        },
      })
      .layout();

    // Set the text for question
    this.questionText = scrollablePanel
      .getElement("panel")
      .setText(this.questions[this.currentQuestionIndex]);

    // Set the scrollable panel to not move with the camera
    this.container.add(scrollablePanel);

    const nextButtonStyle = {
      fontSize: "22px",
      fontFamily: "Press Start 2P, sans-serif",
      color: "#ffffff",
      backgroundColor: "#28a745", // Green
      padding: { left: 10, right: 10, top: 5, bottom: 5 },
    };
    const nextButton = this.scene.add
      .text(
        x - 40 + popupWidth / 4,
        y + popupHeight / 2 - 30,
        "Next",
        nextButtonStyle
      )
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () =>
        nextButton.setStyle({ backgroundColor: "#34ce57" })
      ) // Lighter green on hover
      .on("pointerout", () =>
        nextButton.setStyle({ backgroundColor: "#28a745" })
      ) // Original green on mouse out
      .on("pointerdown", () => this.nextQuestion());

    const backButtonStyle = {
      fontSize: "22px",
      fontFamily: "Press Start 2P, sans-serif",
      color: "#ffffff",
      backgroundColor: "#fd7e14", // Orange
      padding: { left: 10, right: 10, top: 5, bottom: 5 },
    };
    const backButton = this.scene.add
      .text(
        x - 110 + popupWidth / 4,
        y + popupHeight / 2 - 30,
        "Back",
        backButtonStyle
      )
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () =>
        backButton.setStyle({ backgroundColor: "#fc9644" })
      ) // Lighter orange on hover
      .on("pointerout", () =>
        backButton.setStyle({ backgroundColor: "#fd7e14" })
      ) // Original orange on mouse out
      .on("pointerdown", () => this.previousQuestion());

    const submitButtonStyle = {
      fontSize: "22px",
      fontFamily: "Arial, sans-serif",
      color: "#ffffff",
      backgroundColor: "#007bff", // Blue
      padding: { left: 10, right: 10, top: 5, bottom: 5 },
    };
    this.submitButton = this.scene.add
      .text(
        x - 100 + popupWidth / 2,
        y + popupHeight / 2 - 30,
        "Submit",
        submitButtonStyle
      )
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () =>
        this.submitButton.setStyle({ backgroundColor: "#0069d9" })
      ) // Darker blue on hover
      .on("pointerout", () =>
        this.submitButton.setStyle({ backgroundColor: "#007bff" })
      ) // Original blue on mouse out
      .on("pointerdown", () => this.submitAnswer());

    this.container.add([nextButton, backButton, this.submitButton]);
    nextButton.setScrollFactor(0);
    backButton.setScrollFactor(0);
    this.submitButton.setScrollFactor(0);

    this.options[this.currentQuestionIndex].forEach((option, index) => {
      let optionY = optionStartY + index * (optionHeight + 10);
      let optionBox: Phaser.GameObjects.Graphics = this.createOptionBox(
        index,
        0xffffff
      );
      let optionText: Phaser.GameObjects.Text = this.createOptionText(
        index,
        option,
        "#000000"
      );
      this.optionTexts.push(optionText);
      this.optionBoxes.push(optionBox);

      let hitArea = new Phaser.Geom.Rectangle(0, 0, optionWidth, optionHeight);
      const interactiveZone = this.scene.add
        .zone(x, optionY, optionWidth, optionHeight)
        .setOrigin(0.5)
        .setInteractive({
          hitArea: hitArea,
          hitAreaCallback: Phaser.Geom.Rectangle.Contains,
          useHandCursor: true,
        })
        .on("pointerdown", () => this.onOptionSelected(option));
      this.interactiveZones.push(interactiveZone);
      // Set elements to not move with the camera
      // optionBox.setScrollFactor(0);
      // optionText.setScrollFactor(0);
      // interactiveZone.setScrollFactor(0);
      this.container.add([optionBox, optionText, interactiveZone]);
      interactiveZone.setScrollFactor(0);

      for (let i = 0; i < this.optionTexts.length; i++) {
        this.optionTexts[i].setScrollFactor(0);
      }
    });

    // inform server that this player is tackling this question

    // Set the popup background to not move with the camera
    // this.popup.setScrollFactor(0);

    this.scene.room.onMessage("monsterAbandoned" + this.monsterID, () => {
      if (this.popup) {
        if (this.popup) this.popup.destroy();
        // Destroy the scrollable panel
        if (this.scrollablePanel) this.scrollablePanel.destroy();
        // Destroy each option box and text
        this.container.destroy();
      }
    });

    for (let i = 0; i < this.options.length; i++) {
      this.scene.room.onMessage("answerCorrect" + i.toString(), (message) => {
        this.completedQuestions[i] = message.optionIndex;
        console.log(
          "Correct Answer received for question",
          i,
          "answer is option",
          this.completedQuestions[i]
        );
        if (this.currentQuestionIndex === i) {
          this.updatePopup();
        }

        this.scene.room.onMessage(
          "monsterCompleted" + this.monsterID,
          (message) => {
            console.log("Monster killed");
            this.questionSolvedClosePopup();
          }
        );
      });
    }
  }

  sendServerdMonsterAttackRequest() {
    console.log("Sending monster attack request to server");
    this.scene.room.send("playerStartMonsterAttack", {
      monsterID: this.monsterID,
    });
  }

  abandon() {
    console.log("Sending request to stop monster attack to server");
    this.scene.room.send("abandon" + this.monsterID, {});
  }

  nextQuestion() {
    this.currentQuestionIndex =
      (this.currentQuestionIndex + 1) % this.questions.length;
    this.updatePopup();
  }

  previousQuestion() {
    this.currentQuestionIndex =
      (this.currentQuestionIndex - 1 + this.questions.length) %
      this.questions.length;
    this.updatePopup();
  }

  // Modify the submitAnswer method
  submitAnswer() {
    if (this.qnsId !== this.currentQuestionIndex) {
      console.log("This is not your question to answer");
      return;
    }

    if (!this.selectedOption) {
      console.log("No option selected");
      return;
    }

    this.answers(
      this.scene,
      this.monsterID,
      this.currentQuestionIndex,
      this.selectedOption.text,
      this.selectedOptionIndex
    );
  }

  questionSolvedClosePopup() {
    if (this.popup) this.popup.destroy();
    // Destroy the scrollable panel
    if (this.scrollablePanel) this.scrollablePanel.destroy();
    // Destroy each option box and text
    this.container.destroy();
    console.log("question popup closed as monster has been defeated");
  }

  closePopup() {
    // Destroy the popup background
    if (this.popup) this.popup.destroy();
    // Destroy the scrollable panel
    if (this.scrollablePanel) this.scrollablePanel.destroy();
    // Destroy each option box and text
    this.container.destroy();
    console.log("question popup closed");
    this.abandon();
  }

  createOptionText(
    index: number,
    option: string,
    color: string
  ): Phaser.GameObjects.Text {
    let optionY = this.optionStartY + index * (this.optionHeight + 10);
    return this.scene.add
      .text(this.x, optionY, option, {
        fontSize: "16px",
        color: color,
      })
      .setOrigin(0.5);
  }

  createOptionBox(index: number, color: number): Phaser.GameObjects.Graphics {
    let optionY = this.optionStartY + index * (this.optionHeight + 10);
    let optionBox: Phaser.GameObjects.Graphics = this.scene.add
      .graphics()
      .fillStyle(color, 0.5)
      .fillRoundedRect(
        this.x - this.optionWidth / 2,
        optionY - this.optionHeight / 2,
        this.optionWidth,
        this.optionHeight,
        this.borderRadius
      )
      .lineStyle(2, 0xffffff)
      .strokeRoundedRect(
        this.x - this.optionWidth / 2,
        optionY - this.optionHeight / 2,
        this.optionWidth,
        this.optionHeight,
        this.borderRadius
      );
    return optionBox;
  }

  updateOptionTextAndBoxWhenQuestionChanged() {
    // change the color of the selected option to differentiate it
    if (this.qnsId !== this.currentQuestionIndex) {
      this.onOptionSelected("");
    } else {
      if (this.selectedOption) {
        this.onOptionSelected(this.selectedOption.text);
      }
    }
  }

  // should only be able to select if playerId == questionIndex
  // the particular option should look different from the rest if successful selected
  onOptionSelected(selected: string) {
    console.log(`Option ${selected} selected`);

    // Change the color of the selected option to differentiate it
    this.optionTexts.forEach((optionText, index) => {
      if (optionText.text === selected) {
        this.updateOptionBox(
          this.optionBoxes[index],
          selected,
          0x0000ff,
          index
        );
        this.updateOptionText(optionText, "#ffffff");
        console.log("changed color of selected option", optionText.text);
        this.selectedOption = optionText;
        this.selectedOptionIndex = index;
        console.log("selected option index", this.selectedOptionIndex);
      } else {
        this.updateOptionBox(
          this.optionBoxes[index],
          selected,
          0xffffff,
          index
        );
        this.updateOptionText(optionText, "#000000");
        console.log("not changing colour of unselcted option", optionText.text);
      }
    });
  }

  updateOptionText(optionText: Phaser.GameObjects.Text, color: string) {
    optionText.setColor(color);
  }

  updateTitleText(text: string) {
    this.questionTitle.setText(text);
  }

  updateOptionBox(
    optionBox: Phaser.GameObjects.Graphics,
    text: string,
    color: number,
    index: number
  ) {
    let optionY = this.optionStartY + index * (this.optionHeight + 10);

    optionBox.clear();
    optionBox
      .fillStyle(color, 0.5)
      .fillRoundedRect(
        this.x - this.optionWidth / 2,
        optionY - this.optionHeight / 2,
        this.optionWidth,
        this.optionHeight,
        this.borderRadius
      )
      .lineStyle(2, 0xffffff)
      .strokeRoundedRect(
        this.x - this.optionWidth / 2,
        optionY - this.optionHeight / 2,
        this.optionWidth,
        this.optionHeight,
        this.borderRadius
      );
  }

  updatePopup() {
    if (this.completedQuestions[this.currentQuestionIndex] == -1) {
      this.updateOptionTextAndBoxWhenQuestionChanged();

      // Update the question text
      this.questionText.setText(this.questions[this.currentQuestionIndex]);

      // Update the option texts
      this.options[this.currentQuestionIndex].forEach((option, index) => {
        if (index < this.optionTexts.length) {
          this.optionTexts[index].setText(option);
          this.optionBoxes[index].setInteractive();
          this.interactiveZones[index].setInteractive();
          this.updateOptionBox(
            this.optionBoxes[index],
            option,
            0xffffff,
            index
          );
        }
      });
      let titleText;
      // Update the submit button color
      if (this.qnsId != this.currentQuestionIndex) {
        titleText = "Your Teammate's Question";
        this.submitButton.setVisible(false);
      } else {
        titleText = "Your Question";
        this.submitButton.setVisible(true);
      }

      this.updateTitleText(titleText);
    } else {
      this.updateOptionTextAndBoxWhenQuestionChanged();

      // Update the question text
      this.questionText.setText(this.questions[this.currentQuestionIndex]);

      // Update the option texts
      this.options[this.currentQuestionIndex].forEach((option, index) => {
        if (index < this.optionTexts.length) {
          this.optionTexts[index].setText(option);
          if (index == this.completedQuestions[this.currentQuestionIndex]) {
            this.updateOptionBox(
              this.optionBoxes[index],
              option,
              0x00ff00,
              index
            );
          }
          this.optionBoxes[index].disableInteractive();
          this.interactiveZones[index].disableInteractive();
          console.log("disabling option", index);
        }
      });
      let titleText;
      // Update the submit button color
      if (this.qnsId != this.currentQuestionIndex) {
        titleText = "Your Teammate's Question";
        this.submitButton.setVisible(false);
      } else {
        titleText = "Your Question";
        this.submitButton.setVisible(false);
      }

      this.updateTitleText(titleText);
    }
  }

  answers = (
    scene: Battle,
    monsterId: number,
    questionId: number,
    answer: string,
    optionIndex: number
  ) => {
    const payload = {
      monsterID: monsterId,
      questionID: questionId,
      answer: answer,
      optionIndex: optionIndex,
    };
    scene.room.send("answerQuestion", payload);
    console.log("Correct Answer verification requested");
  };
}
