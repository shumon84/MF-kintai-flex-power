window.onload = function () {
    const grid = document.querySelector("body > div > div.htBlock-mainContents > div > div:nth-child(11) > table")
    const titleLine = grid.children[0].children[0];
    const contentLine = grid.children[1].children[0];

    const totalWorkingTimeTitleCell = titleLine.children[0];
    const totalWorkingTimeContentCell = contentLine.children[0];
    const flexPowerTitleCell = totalWorkingTimeTitleCell.cloneNode(true);
    const flexPowerContentCell = totalWorkingTimeContentCell.cloneNode(true);

    titleLine.insertBefore(flexPowerTitleCell, totalWorkingTimeTitleCell);
    contentLine.insertBefore(flexPowerContentCell, totalWorkingTimeContentCell);

    flexPowerTitleCell.firstChild.textContent = '残フレックスパワー';
    const timeCardHeader = document.querySelector("body > div > div.htBlock-mainContents > div > div.htBlock-adjastableTableF > div.htBlock-adjastableTableF_inner > table > thead > tr");
    const timeCard = document.querySelectorAll("body > div > div.htBlock-mainContents > div > div.htBlock-adjastableTableF > div.htBlock-adjastableTableF_inner > table > tbody > tr");
    flexPowerContentCell.firstChild.textContent = calcFlexPower(timeCardHeader, timeCard);

    //grid.style.cssText = '--horizontal-cells:repeat(7, 1fr); --cell-padding:4px 8px;';

    const button = document.createElement('button');
    button.textContent = 'ぶちぬき';
    button.style.cssText = 'margin-right:8px;';
    flexPowerContentCell.prepend(button);

    button.addEventListener('click', function () {
        const text = getWorkTimeList(timeCardHeader, timeCard);
        navigator.clipboard.writeText(text).then(function () {
            showTooltip(button, 'コピー！');
        }, function () {
            showTooltip(button, '失敗！');
        });
    });
}

function calcFlexPower(timeCardHeader, timeCard) {
    const totalWorkRowIndex = [...timeCardHeader.children].findIndex(x => x.firstChild.textContent === '労働合計');
    const flexPower = [...timeCard]
        .map(x => x.children[totalWorkRowIndex])
        .map(x => x.innerText)
        .filter(x => x !== "")
        .map(x => Math.floor(Number(x) * 60))
        .map(x => x - 8 * 60)
        .reduce((sum, x) => sum + x, 0);
    const h = Math.floor(Math.abs(flexPower) / 60);
    const m = Math.abs(flexPower) % 60;
    const sign = (flexPower < 0) ? "-" : "";
    return sign + h.toString() + ":" + m.toString().padStart(2, '0');
}

function getWorkTimeList(timeCardHeader, timeCard) {
    const dateIndex = [...timeCardHeader.children].findIndex(x => x.firstChild.textContent === '日付');
    const startTimeIndex = [...timeCardHeader.children].findIndex(x => x.firstChild.textContent === '出勤');
    const endTimeIndex = [...timeCardHeader.children].findIndex(x => x.firstChild.textContent === '退勤');
    const restStartIndex = [...timeCardHeader.children].findIndex(x => x.firstChild.textContent === '休憩開始');
    const restEndIndex = [...timeCardHeader.children].findIndex(x => x.firstChild.textContent === '休憩終了');
    const year = document.querySelector("#select_year_month_picker").value.substring(0,4);
    const workTimeList = [...timeCard]
        .map(x => [
            x.children[dateIndex].innerText,
            x.children[startTimeIndex].innerText,
            x.children[endTimeIndex].innerText,
            x.children[restStartIndex].innerText,
            x.children[restEndIndex].innerText,
        ])
        .filter(x => x[0] !== '')
        .filter(x => x[1] !== '')
        .filter(x => x[2] !== '')
        .filter(x => x[3] !== '')
        .filter(x => x[4] !== '')
        .map(x => [
            year +'/'+x[0].split('（')[0],
            x[1].replace(/[^0-9:]/g, ""),
            x[2].replace(/[^0-9:]/g, ""),
            x[3].split('\n')[0].replace(/[^0-9:]/g, ""),
            x[4].split('\n')[0].replace(/[^0-9:]/g, ""),
        ])
        .filter(x => x[1] !== "" && x[2] !== "")
        .filter(x => (x[3] === "") === (x[4] === ""))
        .reduce((sum, x) => sum + '\n' + x.join(", "), 'date,start,end, rest_start, rest_end')
    return workTimeList;
}

// ボタンがクリックされたときに実行する関数
function showTooltip(button, text) {
    // ツールチップを作成
    const tooltip = document.createElement('div');
    tooltip.classList.add('work-time-copy-tooltip');
    tooltip.innerText = text;

    // ボディにツールチップを追加
    button.appendChild(tooltip);
    button.style.pointerEvents = 'none';

    // 1 秒後にツールチップを削除
    setTimeout(() => {
        button.removeChild(tooltip);
        button.style.pointerEvents = 'auto';
    }, 1000);
}
