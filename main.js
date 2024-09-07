const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

(async () => {
    // ブラウザを起動（headlessモードを無効にしてブラウザを可視化）
    const browser = await puppeteer.launch({
        headless: false, // ブラウザを表示するためにheadlessモードをオフにする
        args: ['--start-maximized'] // ブラウザを最大化して起動
    });

    const setTimeout = require("node:timers/promises").setTimeout;
    const page = await browser.newPage();
    
    // 指定されたURLにアクセス
    await page.goto('https://sushida.net/play.html?soundless', { waitUntil: 'networkidle2' });

    // スクリーンショットを撮影
    const screenshotPath = path.join(__dirname, 'screenshots');
    // ディレクトリが存在しない場合、作成
    if (!fs.existsSync(screenshotPath)) {
        fs.mkdirSync(screenshotPath);
    }

    const filePath = path.join(screenshotPath, 'sushida_screenshot.png');

    async function clickAtCoordinates(x, y) {
        // マウスを特定の座標に移動
        await page.mouse.move(x, y);
        // マウスクリック
        await page.mouse.click(x, y);
        console.log(`Clicked at coordinates: (${x}, ${y})`);
    }

    async function pressEnter() {
        await page.keyboard.press('Enter');
        console.log('Enter key pressed');
    }

    // 文字列をタイプする関数
    async function typeText(text) {
        await page.keyboard.type(text); // delayオプションでタイピングの速度を調整
        console.log(`Typed text: ${text}`);
    }

    // OCRを実行してテキストを取得する関数
    async function ocr(imagePath) {
        const result = await Tesseract.recognize(imagePath, 'eng', {
        });
        const text = result.data.text.trim(); // テキストの取得
        // textから空白で分割し、文字数が一番多い文字列を取得
        const cleanedText = text.split(' ').reduce((a, b) => a.length > b.length ? a : b);
        return cleanedText;
    }

    await setTimeout(3000);
    await clickAtCoordinates(400, 380);
    await setTimeout(1500);
    await clickAtCoordinates(400, 380);
    await setTimeout(1000);
    await pressEnter();
    await setTimeout(1000);

    let text = "";

    let count = 0;

    // 現在時刻を取得し、開始時刻との差分を計算し、92000ミリ秒（92秒）経過するまでループ
    while (count < 50) {
        console.log(`Loop count: ${count}`);
        // スクリーンショットを取得し、OCRを実行する
        await page.screenshot({
            clip: { x: 250, y: 350, width: 350, height: 20 }, // クリップで特定の範囲を指定
            path: filePath
        });

        // OCRを実行してスクリーンショットからテキストを取得
        let pre_text = text;
        text = await ocr(filePath);

        if (text === pre_text) {
            await typeText('i');
            count++;
            continue;
        }
        await typeText(text);

        // ファイル名を変更
        const newFilePath = path.join(screenshotPath, `sushida_screenshot_${text}.png`);
        fs.renameSync(filePath, newFilePath);
    }

    fs.rmdirSync(screenshotPath, { recursive: true });

    // ブラウザを閉じない（ブラウザは手動で閉じる）
})();
