let isGameOver = false;
let multiplayerMode = false;
let isPaused = false;

const TITLE_HEIGHT = 100;

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth - 20,
    height: window.innerHeight - TITLE_HEIGHT,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let ducky;
let wug;
let artemis;
let heart;
let cursors;
let keys;
let winImage;
let pauseImage;

function preload() {
    this.load.image('background', 'imgs/background.jpg');
    this.load.image('ducky', 'imgs/ducky.png');
    this.load.image('wug', 'imgs/wug.png');
    this.load.image('heart', 'imgs/heart.png');
    this.load.image('artemis', 'imgs/artemis.png');
    this.load.image('duckyWin', 'imgs/duckyWin.jpg');
    this.load.image('artemisWin', 'imgs/artemisWin.jpg');
    this.load.image('wugWin', 'imgs/wugWin.jpg');
    this.load.image('ducky_wug', 'imgs/ducky_wug.jpg');
    this.load.image('wug_artemis', 'imgs/wug_artemis.jpg');
    this.load.image('ducky_artemis', 'imgs/ducky_artemis.jpg');
}

function create() {
    this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    ducky = this.add.image(400, 300, 'ducky');
    ducky.setOrigin(0.5, 0.5);
    ducky.setDisplaySize(75, 75);

    wug = this.add.image(500, 300, 'wug');
    wug.setOrigin(0.5, 0.5);
    wug.setDisplaySize(75, 75);
    wug.setVisible(false);

    heart = this.add.image(200, 200, 'heart');
    heart.setOrigin(0.5, 0.5);
    heart.setDisplaySize(30, 25);

    artemis = this.add.image(600, 600, 'artemis');
    artemis.setOrigin(0.5, 0.5);
    artemis.setDisplaySize(30, 30);
    artemis.speed = 1;

    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys({
        up: 'W',
        left: 'A',
        down: 'S',
        right: 'D'
    });

    this.input.keyboard.on('keydown-M', toggleMultiplayer);
}

function toggleMultiplayer() {
    multiplayerMode = !multiplayerMode;
    console.log(`Multiplayer mode: ${multiplayerMode ? 'ON' : 'OFF'}`);

    if (multiplayerMode) {
        wug.setVisible(true);
    } else {
        wug.setVisible(false);
    }
}

function update() {
    if (isGameOver || isPaused) {
        return;
    }

    if (multiplayerMode && Phaser.Geom.Intersects.RectangleToRectangle(ducky.getBounds(), wug.getBounds())) {
        pauseGame(this, ducky, wug);
    }

    if (Phaser.Geom.Intersects.RectangleToRectangle(ducky.getBounds(), artemis.getBounds())) {
        pauseGame(this, ducky, artemis);
    }

    if (multiplayerMode && Phaser.Geom.Intersects.RectangleToRectangle(wug.getBounds(), artemis.getBounds())) {
        pauseGame(this, wug, artemis);
    }

    ducky.x = Phaser.Math.Clamp(ducky.x, 50, config.width - 50);
    ducky.y = Phaser.Math.Clamp(ducky.y, 50, config.height - 50);

    artemis.x = Phaser.Math.Clamp(artemis.x, 50, config.width - 50);
    artemis.y = Phaser.Math.Clamp(artemis.y, 50, config.height - 50);

    if (cursors.left.isDown) {
        ducky.x -= 5;
    }
    if (cursors.right.isDown) {
        ducky.x += 5;
    }
    if (cursors.up.isDown) {
        ducky.y -= 5;
    }
    if (cursors.down.isDown) {
        ducky.y += 5;
    }

    if (multiplayerMode) {
        if (keys.left.isDown) {
            wug.x -= 5;
        }
        if (keys.right.isDown) {
            wug.x += 5;
        }
        if (keys.up.isDown) {
            wug.y -= 5;
        }
        if (keys.down.isDown) {
            wug.y += 5;
        }
    
        // Clamp Wug's position to prevent it from going off-screen
        wug.x = Phaser.Math.Clamp(wug.x, 50, config.width - 50);
        wug.y = Phaser.Math.Clamp(wug.y, 50, config.height - 50);
    }

    artemisWander(artemis);

    if (Phaser.Geom.Intersects.RectangleToRectangle(ducky.getBounds(), heart.getBounds())) {
        showWin('ducky', this);
        heart.setVisible(false);
    }

    if (multiplayerMode && Phaser.Geom.Intersects.RectangleToRectangle(wug.getBounds(), heart.getBounds())) {
        showWin('wug', this);
        heart.setVisible(false);
    }

    if (Phaser.Geom.Intersects.RectangleToRectangle(artemis.getBounds(), heart.getBounds())) {
        showWin('artemis', this);
        heart.setVisible(false);
    }
}

function showWin(winner, scene) {
    if (winImage) {
        winImage.destroy();
    }

    let winMessageText = '';

    if (winner === 'ducky') {
        winImage = scene.add.image(scene.cameras.main.width / 2, scene.cameras.main.height / 2, 'duckyWin');
        winMessageText = 'Ducky wins!';
    } else if (winner === 'wug') {
        winImage = scene.add.image(scene.cameras.main.width / 2, scene.cameras.main.height / 2, 'wugWin');
        winMessageText = 'Wug wins!';
    } else if (winner === 'artemis') {
        winImage = scene.add.image(scene.cameras.main.width / 2, scene.cameras.main.height / 2, 'artemisWin');
        winMessageText = 'Artemis wins!';
    }

    winImage.setDisplaySize(200, 200);

    const winMessage = scene.add.text(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2 + 150,
        winMessageText,
        {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'monospace',
            backgroundColor: '#000000',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }
    ).setOrigin(0.5);

    isGameOver = true;

    scene.time.delayedCall(2000, () => {
        winImage.destroy();
        winMessage.destroy();
        resetGame.call(scene);
    });
}

function resetGame() {
    isGameOver = false;

    function isTooClose(x1, y1, x2, y2, minDistance = 50) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
    }

    function getRandomPosition(existingPositions, margin = 100) {
        let x, y;
        let isValid = false;
        
        const minX = margin;
        const minY = margin;
        const maxX = window.innerWidth - margin;
        const maxY = window.innerHeight - margin;

        while (!isValid) {
            x = Math.random() * (maxX - minX) + minX;
            y = Math.random() * (maxY - minY) + minY;
            isValid = existingPositions.every(pos => !isTooClose(x, y, pos.x, pos.y));
        }

        return { x, y };
    }

    let positions = [];

    let duckyPos = getRandomPosition(positions);
    ducky.setPosition(duckyPos.x, duckyPos.y);
    positions.push(duckyPos);

    let wugPos = getRandomPosition(positions);
    wug.setPosition(wugPos.x, wugPos.y);
    positions.push(wugPos);

    let artemisPos = getRandomPosition(positions);
    artemis.setPosition(artemisPos.x, artemisPos.y);
    positions.push(artemisPos);

    let heartPos = getRandomPosition(positions);
    heart.setPosition(heartPos.x, heartPos.y);
    positions.push(heartPos);

    heart.setVisible(true);

    if (winImage) {
        winImage.destroy();
    }
}

function artemisWander(artemis) {
    let dx = heart.x - artemis.x;
    let dy = heart.y - artemis.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance !== 0) {
        dx /= distance;
        dy /= distance;
    }

    artemis.x += dx * artemis.speed;
    artemis.y += dy * artemis.speed;

    if (artemis.x < 50) artemis.x = 50;
    if (artemis.x > config.width - 50) artemis.x = config.width - 50;
    if (artemis.y < 50) artemis.y = 50;
    if (artemis.y > config.height - 50) artemis.y = config.height - 50;
}

function pauseGame(scene, char1, char2) {
    isPaused = true;

    if (pauseImage) {
        pauseImage.destroy();
    }

    let winMessageText;

    if (char1 === ducky && char2 === wug) {
        pauseImage = scene.add.image(scene.cameras.main.width / 2, scene.cameras.main.height / 2, 'ducky_wug');
        winMessageText = "*smooch*"
    }
    else if (char1 === ducky && char2 === artemis) {
        pauseImage = scene.add.image(scene.cameras.main.width / 2, scene.cameras.main.height / 2, 'ducky_artemis');
        winMessageText = "*meow*"
    }
    else if (char1 === wug && char2 === artemis) {
        pauseImage = scene.add.image(scene.cameras.main.width / 2, scene.cameras.main.height / 2, 'wug_artemis');
        winMessageText = "*meow*"
    }

    pauseImage.setDisplaySize(200, 200);

    const winMessage = scene.add.text(
        scene.cameras.main.width / 2,
        scene.cameras.main.height / 2 + 150,
        winMessageText,
        {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'monospace',
            backgroundColor: '#000000',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }
    ).setOrigin(0.5);

    const moveApartDistance = 10;
    if (char1.x < char2.x) {
        char1.x -= moveApartDistance / 2;
        char2.x += moveApartDistance / 2;
    } else {
        char1.x += moveApartDistance / 2;
        char2.x -= moveApartDistance / 2;
    }

    if (char1.y < char2.y) {
        char1.y -= moveApartDistance / 2;
        char2.y += moveApartDistance / 2;
    } else {
        char1.y += moveApartDistance / 2;
        char2.y -= moveApartDistance / 2;
    }

    char1.x = Phaser.Math.Clamp(char1.x, 50, config.width - 50);
    char1.y = Phaser.Math.Clamp(char1.y, 50, config.height - 50);
    char2.x = Phaser.Math.Clamp(char2.x, 50, config.width - 50);
    char2.y = Phaser.Math.Clamp(char2.y, 50, config.height - 50);

    scene.time.delayedCall(1500, () => {
        if (pauseImage) {
            pauseImage.destroy();
            winMessage.destroy();
            pauseImage = null;
        }
        isPaused = false;
    });
}
