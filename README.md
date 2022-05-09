# GenTankProj

Genesis坦克殺手

## 開發環境配置

手動安裝

* 編輯器：[Visual Studio Code](https://code.visualstudio.com)
* 執行環境：[NodeJS](https://nodejs.org/en/download/)、npm(包含在NodeJS中)
* 樣式檢查：[TSLint for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=eg2.tslint)

自動安裝

* 程式語言：TypeScript
* 建置：webpack

## 建置方法

第一次建置前需要先安裝NodeJS Dependencies，dependencies不是安裝到系統中而是安裝到專案資料夾底下的`node_modules`資料夾

1. 在專案目錄下開啟終端機
1. 在終端機中輸入`npm install`開始安裝dependencies
1. 在終端機中輸入`npm run build`開始建置

* 建置後資料會在`dist`資料夾
* 在終端機中輸入`npm run dev`可以於專案中直接開啟瀏覽器執行與偵錯

## 目錄架構說明

* `assets`           : 遊戲素材
  * `images`         : 坦克殺手遊戲素材
* `src`              : 遊戲原始碼
  * `states`         : 遊戲關卡組成，目前只有一關卡，在main.state.ts之中
* `styles`           : 遊戲外框參數
* `templates`        : 遊戲html基本參數
* `.vscode`          : Visual Studio Code 專案設定資料夾
* `node_modules`     : NodeJS 套件資料夾，由 npm 自動產生

## 遊戲操作與說明

1. 按下螢幕->鍵(亦可使用鍵盤右鍵)：坦克會順時針旋轉
2. 按下螢幕<-鍵(亦可使用鍵盤左鍵)：坦克會逆時針旋轉
3. 按下螢幕^鍵(亦可使用鍵盤上鍵)：坦克會前進
4. 按下螢幕v鍵(亦可使用鍵盤下鍵)：坦克會後退
5. 按下螢幕A鍵(亦可使用鍵盤1鍵)：坦克會發射子彈（紅色子彈攻擊力10，藍色20，綠色25）
6. 按下螢幕B鍵(亦可使用鍵盤2鍵)：坦克會變顏色
7. 坦克移動沒有邊界
8. 地形會隨機生成，有牆與草，牆無法通過，草的生命值為100，可用子彈破壞

## 程式技術方面

* 遊戲引擎使用Phaser 2
* 遊戲程式使用TypeScript
* 牆壁碰撞與坦克與Camera跟隨使用物理引擎p2.Js
* 遊戲執行網址：https://moseschang.github.io/
* 遊戲程式GitHub網址：https://github.com/MosesChang/GenTankProj

## 程式組成

* enum TileType：磚塊種類定義
* class Tile：儲存磚塊的物件
* export default class MainState：遊戲主要關卡
  * create(): 初始遊戲資源
  * update(): 處理輸入與子彈飛行,子彈碰撞,UI跟隨鏡頭,草湮滅以及場景生成與消失
  * tileAssign(): 處理場景生成與消失
  * checkTileExistAnyArrayIt(): 檢查此個地方是否有地磚了，沒有的話，生成一個容器準備裝載
  * bulletMoveCollision(): 子彈移動與碰撞與草的消滅
  * initBts(): 初始化螢幕按鈕
  * bulletFire(): 發射子彈
  * changeTankColor(): 改變坦克顏色

  文章結束
  