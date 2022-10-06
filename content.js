window.onload = function() {
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
}

function calcFlexPower(timeCardHeader, timeCard){
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