window.onload = function () {
    const grid = document.querySelector('body > div.attendance-contents > div.attendance-contents-inner > div > div > div > div > section > section > div.tw-bg-white > div.tw-flex.tw-flex-col-reverse.tw-border-b.tw-border-solid.tw-border-main > div.transition > section > section:nth-child(2) > section');

    const titleLine = grid.children[0];
    const contentLine = grid.children[1];

    const totalWorkingTimeTitleCell = titleLine.children[0];
    const totalWorkingTimeContentCell = contentLine.children[0];
    const flexPowerTitleCell = totalWorkingTimeTitleCell.cloneNode(true);
    const flexPowerContentCell = totalWorkingTimeContentCell.cloneNode(true);

    titleLine.insertBefore(flexPowerTitleCell, totalWorkingTimeTitleCell);
    contentLine.insertBefore(flexPowerContentCell, totalWorkingTimeContentCell);

    flexPowerTitleCell.firstChild.textContent = '残フレックスパワー';
    const timeCardHeader = document.querySelector('body > div.attendance-contents > div.attendance-contents-inner > div > div > div > div > section > section > div.daily-attendances-table > div.att-pc.tw-p-16.tw-pt-0 > section > header > section > section > div');
    const timeCard = document.querySelector('body > div.attendance-contents > div.attendance-contents-inner > div > div > div > div > section > section > div.daily-attendances-table > div.att-pc.tw-p-16.tw-pt-0 > section > section > section > section');
    flexPowerContentCell.firstChild.textContent = calcFlexPower(timeCardHeader, timeCard);

    grid.style.cssText = '--horizontal-cells:repeat(7, 1fr); --cell-padding:4px 8px;';

    const button = document.createElement('button');
    button.textContent = '労働時間ぶちぬきボタン';
    flexPowerContentCell.appendChild(button);

    button.addEventListener('click', function () {
        const text = getWorkTimeList(timeCardHeader, timeCard);
        navigator.clipboard.writeText(text).then(function () {
            console.log('労働時間がクリップボードにコピーされました');
        }, function () {
            console.error('労働時間をクリップボードにコピーできませんでした');
        });
    });

}

function calcFlexPower(timeCardHeader, timeCard) {
    const totalWorkRowIndex = [...timeCardHeader.children].findIndex(x => x.firstChild.textContent === '総労働');
    const flexPower = [...timeCard.children]
        .map(x => x.children[totalWorkRowIndex])
        .map(x => x.firstChild.textContent)
        .map(x => x.replace(/[^0-9:]/g, ""))
        .filter(x => x !== "")
        .map(x => x.split(":"))
        .map(x => Number(x[0]) * 60 + Number(x[1]))
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
    const restIndex = [...timeCardHeader.children].findIndex(x => x.firstChild.firstChild.textContent === '休憩')
    const workTimeList = [...timeCard.children]
        .map(x => [
            x.children[dateIndex],
            x.children[startTimeIndex],
            x.children[endTimeIndex],
            x.children[restIndex],
        ])
        .map(x => [
            x[0].id,
            x[1].children[1].firstChild,
            x[2].children[1].firstChild,
            x[3].children[0].firstChild,
            x[3].children[1].firstChild,
        ])
        .map(x => [
            x[0].replace(/attendances-table-date-cell-/g, ""),
            x[1] !== null ? x[1].textContent : '',
            x[2] !== null ? x[2].textContent : '',
            x[3] !== null ? x[3].textContent : '',
            x[4] !== null ? x[4].textContent : '',
        ])
        .map(x => [
            x[0].replace(/-/g, "/"),
            x[1].replace(/[^0-9:]/g, ""),
            x[2].replace(/[^0-9:]/g, ""),
            x[3].replace(/[^0-9:]/g, ""),
            x[4].replace(/[^0-9:]/g, ""),
        ])
        .filter(x => x[1] !== "" && x[2] !== "")
        .filter(x => (x[3] === "") === (x[4] === ""))
        .reduce((sum, x) => sum + '\n' + x.join(", "), 'date,start,end, rest_start, rest_end')
    return workTimeList;
}
