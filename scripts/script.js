const COLUMN_INDEX_FOR_IMAGES = 8;

/**
 * データ管理クラス
 * @class
 */
class DataManager {
  /**
   * @constructor
   * @param {Array} data - クイズデータの配列
   */
  constructor(data) {
    this.originalData = data;
    this.shuffledData = [...data];
    this.currentData = this.originalData;
    this.limitedMode = false;
    this.isShuffled = false;
  }

  /**
   * 配列をシャッフルする
   * @param {Array} array - シャッフルする配列
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * 限定モードをトグルする
   */
  toggleLimitedMode() {
    this.limitedMode = !this.limitedMode;
    if (this.limitedMode) {
      this.currentData = this.isShuffled ? this.shuffledData.slice(0, 40) : this.originalData.slice(0, 40);
    } else {
      this.currentData = this.isShuffled ? this.shuffledData.slice() : this.originalData.slice();
    }
  }

  /**
   * シャッフルモードをトグルする
   */
  toggleShuffleMode() {
    if (this.isShuffled) {
      this.currentData = this.limitedMode ? this.originalData.slice(0, 40) : this.originalData.slice();
    } else {
      if (this.limitedMode) {
        const limitedData = this.originalData.slice(0, 40);
        this.shuffledData = [...limitedData];
        this.shuffleArray(this.shuffledData);
        this.currentData = this.shuffledData.slice();
      } else {
        this.shuffledData = [...this.originalData];
        this.shuffleArray(this.shuffledData);
        this.currentData = this.shuffledData.slice();
      }
    }
    this.isShuffled = !this.isShuffled;
  }

  /**
   * 表示するクイズを選択する
   * @returns {Array} - 表示するクイズの配列
   */
  selectDisplayedQuiz() {
    if (this.limitedMode) {
      return this.currentData.slice(0, 40);
    }
    return this.currentData;
  }
}


/**
 * テーブル表示クラス
 * @class
 */
class TableView {
  /**
   * @constructor
   * @param {DataManager} dataManager - データ管理クラスのインスタンス
   * @param {string} spanText - セルに表示するテキスト
   */
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.spanText = "■■■■■";
  }

  /**
   * クイズを表示する
   */
  displayQuiz() {
    const quizBody = document.getElementById("quizBody");
    quizBody.innerHTML = '';  // 既存の行をクリア
    const displayData = this.dataManager.selectDisplayedQuiz();

    displayData.forEach((data, displayIndex) => {
      const originalIndex = this.dataManager.originalData.indexOf(data);
      const row = this.createTableRow(data, originalIndex);
      quizBody.appendChild(row);
    });
  }

  /**
   * 行を作成する
   * @param {Array} data - 行に表示するデータの配列
   * @param {number} index - 行のインデックス
   * @returns {HTMLTableRowElement} - 作成した行のHTMLTableRowElement
   */
  createTableRow(data, index) {
    const row = document.createElement("tr");
    row.id = `row${index}`;

    const rowNumberCell = this.createRowNumberCell(index);
    row.appendChild(rowNumberCell);

    data.forEach((item, colIndex) => {
      const cell = this.createCell(item, colIndex);
      row.appendChild(cell);
    });

    return row;
  }

  /**
   * 行番号のセルを作成する
   * @param {number} index - 行のインデックス
   * @returns {HTMLTableCellElement} - 作成したセルのHTMLTableCellElement
   */
  createRowNumberCell(index) {
    const rowNumberCell = document.createElement("td");
    const rowNumberSpan = document.createElement("span");
    rowNumberSpan.textContent = index + 1;
    rowNumberCell.appendChild(rowNumberSpan);
    rowNumberCell.classList.add("row-number");

    // イベントリスナーの追加
    rowNumberCell.addEventListener("click", (event) => {
      const row = event.currentTarget.parentElement;
      let anyCellRevealed = false;
      for (let cell of row.cells) {
        if (!cell.classList.contains("row-number") && cell.classList.contains("revealed")) {
          anyCellRevealed = true;
          break;
        }
      }

      for (let cell of row.cells) {
        if (!cell.classList.contains("row-number")) {
          if (anyCellRevealed) {
            this.hideCell(cell);
          } else {
            this.revealCell(cell);
          }
        }
      }
    });

    return rowNumberCell;
  }


  /**
   * セルを作成する
   * @param {string} item - セルに表示するテキスト
   * @param {number} index - セルのインデックス
   * @returns {HTMLTableCellElement} - 作成したセルのHTMLTableCellElement
   */
  createCell(item, index) {
    console.log("Function createCell called with:", item, index);

    const cell = document.createElement("td");
    cell.textContent = this.spanText;
    cell.classList.add(`data${index}`, "blank");

    let touchStartX;
    let touchStartTime;

    // デスクトップやラップトップでの右クリック
    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      cell.classList.toggle("highlighted");
    });

    // クリックイベントを追加
    cell.addEventListener("click", () => {
      if (cell.classList.contains("revealed")) {
        this.hideCell(cell);
      } else {
        this.revealCell(cell);
      }
    });

    // タッチデバイスでの横スワイプの開始座標と時間を記録
    cell.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
    });

    cell.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndTime = Date.now();
      if (touchEndTime - touchStartTime < 500 && Math.abs(touchEndX - touchStartX) > 50) {
        // スワイプの時間が500ms未満で、スワイプの幅が50px以上の場合
        cell.classList.toggle("highlighted");
      } else {
        if (cell.classList.contains("revealed")) {
          this.hideCell(cell);
        } else {
          this.revealCell(cell);
        }
      }
      e.preventDefault();
    });
    

    return cell;
  }


  /**
   * セルを表示する
   * @param {HTMLTableCellElement} cell - 表示するセルのHTMLTableCellElement
   */
  revealCell(cell) {
    if (!cell.classList.contains("row-number")) {
      this.revealDataInCell(cell);
      cell.classList.add("revealed");
    }
  }

  /**
   * セルを非表示にする
   * @param {HTMLTableCellElement} cell - 非表示にするセルのHTMLTableCellElement
   */
  hideCell(cell) {
    if (!cell.classList.contains("row-number")) {
      cell.textContent = this.spanText;
      cell.classList.remove("revealed");
      cell.classList.add("blank");
    }
  }

  /**
   * セルにデータを表示する
   * @param {HTMLTableCellElement} cell - データを表示するセルのHTMLTableCellElement
   */
  revealDataInCell(cell) {
    const className = cell.classList.item(0);
    const colIndex = parseInt(className.slice(4));
    const rowIndex = cell.parentElement.rowIndex - 1;
    const answer = this.dataManager.currentData[rowIndex][colIndex];
    cell.classList.remove("blank");

    if (colIndex === COLUMN_INDEX_FOR_IMAGES) {
      this.insertImageInCell(cell, answer);
    } else {
      this.insertTextInCell(cell, answer);
    }
  }

  /**
   * セルに画像を表示する
   * @param {HTMLTableCellElement} cell - 画像を表示するセルのHTMLTableCellElement
   * @param {string} src - 画像のURL
   */
  insertImageInCell(cell, src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = "structure image";
    img.classList.add("structure-img");
    cell.textContent = '';
    cell.appendChild(img);
  }

  /**
   * セルにテキストを表示する
   * @param {HTMLTableCellElement} cell - テキストを表示するセルのHTMLTableCellElement
   * @param {string} text - 表示するテキスト
   */
  insertTextInCell(cell, text) {
    if (text === "") {
      cell.textContent = this.spanText;
    } else {
      cell.textContent = text;
    }
  }
}


/**
 * シャッフルモードクラス
 * @class
 */
class ShuffleMode {
  /**
   * @constructor
   * @param {DataManager} dataManager - データ管理クラスのインスタンス
   * @param {TableView} tableView - テーブル表示クラスのインスタンス
   */
  constructor(dataManager, tableView) {
    this.dataManager = dataManager;
    this.tableView = tableView;
  }

  /**
   * 行をシャッフルする
   */
  shuffleRows() {
    this.dataManager.toggleShuffleMode();
    this.tableView.displayQuiz();
  }
}

/**
 * イベント管理クラス
 * @class
 */
class EventManager {
  /**
   * @constructor
   * @param {DataManager} dataManager - データ管理クラスのインスタンス
   * @param {TableView} tableView - テーブル表示クラスのインスタンス
   * @param {ShuffleMode} shuffleMode - シャッフルモードクラスのインスタンス
   */
  constructor(dataManager, tableView, shuffleMode) {
    this.dataManager = dataManager;
    this.tableView = tableView;
    this.shuffleMode = shuffleMode;
  }

  /**
   * イベントリスナーを追加する
   */
  addEventListeners() {
    this.addClickListener("revealAllButton", () => this.toggleRevealAll());
    this.addClickListener("createRandomQuizButton", () => this.createRandomQuiz());

    // シャッフルモードのボタン
    this.addClickListener("shuffleRowsButton", () => {
        this.shuffleMode.shuffleRows();
        this.updateButtonStyles();
    });

    // 40行表示モードのボタン
    this.addClickListener("toggleLimitedModeButton", () => {
        this.dataManager.toggleLimitedMode();
        this.tableView.displayQuiz();
        this.updateButtonStyles();
    });

    // リセットボタン
    this.addClickListener("resetQuizButton", () => {
      this.resetTable();
      this.updateButtonStyles();
    });

    this.addColumnHeaderListeners();
}


  /**
   * クリックイベントリスナーを追加する
   * @param {string} elementId - イベントリスナーを追加する要素のID
   * @param {function} callback - イベントリスナーのコールバック関数
   */
  addClickListener(elementId, callback) {
    document.getElementById(elementId).addEventListener("click", callback);
  }

  /**
   * 列ヘッダーのイベントリスナーを追加する
   */
  addColumnHeaderListeners() {
    let quizHeadCells = document.getElementsByClassName("quizHead");
    for (let cell of quizHeadCells) {
      cell.addEventListener("click", (event) => {
        const colIndex = event.target.cellIndex;
        this.toggleRevealColumn(colIndex - 1);
      });
    }
  }

  toggleRevealAll() {
    const cells = this.getCellsWithClass('.blank', '.revealed');
    this.toggleCells(cells);
  }

  toggleRevealColumn(colIndex) {
    const cells = this.getCellsWithClass(`.data${colIndex}.blank`, `.data${colIndex}.revealed`);
    this.toggleCells(cells);
  }

  getCellsWithClass(...classes) {
    const hiddenCells = document.querySelectorAll(classes[0]);
    const revealedCells = document.querySelectorAll(classes[1]);

    return revealedCells.length > 0 ? revealedCells : hiddenCells;
  }

  toggleCells(cells) {
    cells.forEach(cell => {
      if (cell.classList.contains("revealed")) {
        this.tableView.hideCell(cell);
      } else {
        this.tableView.revealCell(cell);
      }
    });
  }

  updateButtonStyles() {
    const shuffleButton = document.getElementById("shuffleRowsButton");
    const limitedModeButton = document.getElementById("toggleLimitedModeButton");

    if (this.dataManager.isShuffled) {
        shuffleButton.classList.add("active-mode");
    } else {
        shuffleButton.classList.remove("active-mode");
    }

    if (this.dataManager.limitedMode) {
        limitedModeButton.classList.add("active-mode");
    } else {
        limitedModeButton.classList.remove("active-mode");
    }
  }

  createRandomQuiz() {
    const quizBody = document.getElementById("quizBody");
    const rows = Array.from(quizBody.children);

    rows.forEach(row => {
      const cells = Array.from(row.children).slice(1, 4);  // 生薬、基原、学名のセルのみを取得
      cells.forEach(cell => this.tableView.hideCell(cell));  // すべてのセルを隠す
      const randomIndex = Math.floor(Math.random() * cells.length);
      this.tableView.revealCell(cells[randomIndex]);  // ランダムにセルを表示
    });
  }

  resetTable() {
    console.log("Resetting the table...");
    this.dataManager.currentData = this.dataManager.originalData;
    this.dataManager.limitedMode = false;
    this.tableView.displayQuiz();
  }
}


const dataManager = new DataManager(questionsAnswers);
const tableView = new TableView(dataManager);
const shuffleMode = new ShuffleMode(dataManager, tableView);
const eventManager = new EventManager(dataManager, tableView, shuffleMode);

document.addEventListener("DOMContentLoaded", () => {
  tableView.displayQuiz();
  eventManager.addEventListeners();
});