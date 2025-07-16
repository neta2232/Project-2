document.addEventListener("DOMContentLoaded", async () => {
    const form = document.querySelector('#formid');
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
        });

    }
    const coinsDiv = document.querySelector('#coinscontainer');
    const report = document.querySelector('#report-select');
    const reportDiv = document.querySelector('#real-time-report');
    const coinsSelector = document.querySelector('#coins-select');
    const aboutDiv = document.querySelector('#about-page');
    const aboutSelector = document.querySelector('#about-select');
    const nocoins = document.querySelector('#no-coins-alert');
    const loadingbar = document.createElement('div');
    const Loader = document.querySelector('#loadingbar');


    report.addEventListener('click', (event) => {
        event.preventDefault();
        coinsDiv.style.display = 'none';
        reportDiv.style.display = 'block';
        aboutDiv.style.display = 'none';
        nocoins.style.display = 'none'
        coinsGraph();
    });


    coinsSelector.addEventListener('click', (event) => {
        event.preventDefault();
        coinsDiv.style.display = 'grid';
        reportDiv.style.display = 'none';
        aboutDiv.style.display = 'none';
        const allCoins = JSON.parse(localStorage.getItem('coins') || "[]");
        showCoins(allCoins);
        console.log(allCoins);

    });


    aboutSelector.addEventListener('click', (event) => {
        event.preventDefault();
        aboutDiv.style.display = 'block';
        nocoins.style.display = 'none'
        reportDiv.style.display = 'none';
        coinsDiv.style.display = 'none';
        chartContainer.style.display = 'none';
    });

    Loader.style.display = 'block';
    const coins = await loadCoins();
    Loader.style.display = 'none';
    showCoins(coins);
});

async function loadCoins() {
    try {
        const storedCoins = localStorage.getItem("coins");
        const lastUpdate = localStorage.getItem("coins_last_update");
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (storedCoins && lastUpdate && now - Number(lastUpdate) < oneDay) {
            return JSON.parse(storedCoins);
        }

        else {
            const url = 'https://api.coingecko.com/api/v3/coins/markets';
            const params = {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 100,
                page: 1
            };

            const query = new URLSearchParams(params).toString();
            const response = await fetch(`${url}?${query}`);
            const data = await response.json();

            localStorage.setItem("coins", JSON.stringify(data));
            localStorage.setItem("coins_last_update", now.toString());
            return data;
        }
    } catch (error) {
        console.error("Error loading coins:", error);
        return [];
    }
}

function showCoins(coins) {
    const coinsList = document.querySelector("#coinscontainer");
    if (!coinsList) return;
    coinsList.innerHTML = "";

    coins.forEach(coin => {
        const card = document.createElement("div");
        card.classList.add("card",);
        card.style.width = "300px"

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        const symbolTitle = document.createElement("h5");
        symbolTitle.textContent = coin.symbol;
        symbolTitle.classList.add('symbolName')


        const nameTitle = document.createElement("h4");
        nameTitle.textContent = coin.name;
        nameTitle.classList.add('coinName')

        const moreInfoBtn = document.createElement("button");
        moreInfoBtn.classList.add("moreInfoBtn");
        moreInfoBtn.textContent = "More info";

        const touggleDiv = document.createElement('div');
        touggleDiv.innerHTML = `
        <label class="switch">
         <input id="${coin.id}" type="checkbox">
         <span class="slider round"></span>
       </label>
        `;
        const coinInfo = document.createElement("div");
        coinInfo.classList.add("coin-info");
        coinInfo.style.display = "none";

        const progressBar = document.createElement("div");
        progressBar.classList.add("progress");
        progressBar.style.display = "none";
        progressBar.innerHTML = `<div class="progress-bar-animated myprogress progress-bar progress-bar-striped bg-info" style="width: 100%">Loading...</div>`;

        let isLoading = false;
        let count = 0;
        moreInfoBtn.addEventListener("click", async () => {
            count++
            if (isLoading) return;
            isLoading = true;
            progressBar.style.display = "block";

            let cachedData = null;
            try {
                cachedData = JSON.parse(localStorage.getItem("coinDetails" + coin.id));
            } catch (e) {
                cachedData = null;
            }
            const now = Date.now();
            if (count % 2 !== 0) {
                moreInfoBtn.innerHTML = `<span>Hide</span>`
            }
            else {
                moreInfoBtn.innerText = 'More info'
            }
            if (!cachedData || now - cachedData.timestamp > 120000) {
                try {
                    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}`);
                    const data = await response.json();
                    cachedData = { data, timestamp: now };
                    localStorage.setItem("coinDetails" + coin.id, JSON.stringify(cachedData));
                } catch (e) {
                    coinInfo.innerHTML = "<p>Failed to load coins data</p>";
                }

            }

            if (cachedData && cachedData.data) {
                const info = cachedData.data;
                coinInfo.innerHTML = `
                    <img class="coinImg" src="${info.image.small}" alt="${coin.name}">
                    <p>Price in USD: $${info.market_data.current_price.usd}</p>
                    <p>Price in EUR: €${info.market_data.current_price.eur}</p>
                    <p>Price in ILS: ₪${info.market_data.current_price.ils}</p>
                `;
            }
            progressBar.style.display = "none";
            coinInfo.style.display = (coinInfo.style.display === "none") ? "block" : "none";
            isLoading = false;
        });

        cardBody.append(symbolTitle, nameTitle, moreInfoBtn, progressBar, coinInfo, touggleDiv);

        card.append(cardBody);
        coinsList.append(card);
        touggleActions(touggleDiv, coin);
    });
}

function filterCoins() {
    const alert = document.querySelector('#no-coins-alert');
    const reportDiv = document.querySelector('#real-time-report');
    const aboutDiv = document.querySelector('#about-page');
    const coinsDiv = document.querySelector('#coinscontainer');


    coinsDiv.style.display = 'flex';
    reportDiv.style.display = 'none';
    aboutDiv.style.display = 'none';
    alert.style.display = 'none';

    const coinsList = JSON.parse(localStorage.getItem('coins') || "[]");
    const searchinput = document.querySelector("#searchinput").value.trim().toLowerCase();

    const filteredCoins = coinsList.filter(
        (coin) => coin.symbol.toLowerCase() === searchinput
    );

    if (filteredCoins.length === 0 || !searchinput) {
        alert.style.display = 'block';
        document.querySelector('#searchinput').value = "";
        coinsDiv.style.display = 'none';
        coinsDiv.classList.remove('center-results');
        return;
    }

    coinsDiv.classList.add('center-results')
    showCoins(filteredCoins);
    document.querySelector("#searchinput").value = "";
}

let reportarr = [];
let pendingCoinId = null;

function touggleActions(touggle, coin) {
    const checkbox = touggle.querySelector('input[type="checkbox"]');
    if (!checkbox) return;
    checkbox.checked = reportarr.includes(coin.id);

    checkbox.addEventListener('change', e => {
        if (e.target.checked) {
            if (reportarr.length >= 5) {
                pendingCoinId = coin.id;
                let tempArr = [...reportarr];
                let removed = false;
                const alertdiv = document.createElement('div');
                alertdiv.innerHTML = `
                    <div id="alertmessage" role="alert">
                        <h3 id="alertTitle" >Oops! That's more coins than the limit...</h3>
                        <p id="alertsubTitle">Please remove one or more coins to proceed</p>
                        <div id="coinselected"></div>
                        <div id="alertbtn">
                        <button id="cancelalertbtn">Cancel</button>
                        <button id="closealertbtn">Confirm</button>
                        </div>
                    </div>`;
                document.querySelector('#popalert').innerHTML = '';
                document.querySelector('#popalert').appendChild(alertdiv);
                const allCoins = JSON.parse(localStorage.getItem('coins') || "[]");
                const coinselectedDiv = alertdiv.querySelector('#coinselected');

                const onRemove = (id, card2) => {
                    const idx = tempArr.indexOf(id);
                    if (idx > -1) {
                        tempArr.splice(idx, 1);
                        removed = true;
                        card2.remove();
                    }
                };
                renderSelected(tempArr, allCoins, coinselectedDiv, onRemove);

                alertdiv.querySelector('#closealertbtn').addEventListener('click', () => {
                    if (removed && tempArr.length < 5 && pendingCoinId) {
                        tempArr.push(pendingCoinId);
                        pendingCoinId = null;
                    }
                    if (removed) {
                        reportarr = [...tempArr];
                        document.querySelectorAll('#coinscontainer input[type="checkbox"]').forEach(toggle =>
                            toggle.checked = reportarr.includes(toggle.id)
                        );
                        alertdiv.remove();
                    }
                });
                alertdiv.querySelector('#cancelalertbtn').addEventListener('click', () => {
                    alertdiv.remove();
                    pendingCoinId = null;
                });
                e.target.checked = false;
                return;
            }
            reportarr.push(coin.id);
        } else {
            const idx = reportarr.indexOf(coin.id);
            if (idx > -1) reportarr.splice(idx, 1);
        }
    });
}

function renderSelected(tempArr, allCoins, coinselectedDiv, onRemove) {
    coinselectedDiv.innerHTML = '';
    tempArr.slice(0, 5).forEach(id => {
        const coinObj = allCoins.find(c => c.id === id);
        if (!coinObj) return;
        const card2 = document.createElement("div");
        card2.className = "card w-50";
        card2.innerHTML = `
            <div class="card-body">
                <h5>${coinObj.symbol}</h5>
                <h4>${coinObj.name}</h4>
                <label class="switch">
                    <input type="checkbox" checked>
                    <span class="slider round"></span>
                </label>
            </div>`;
        coinselectedDiv.appendChild(card2);
        card2.querySelector('input[type="checkbox"]').addEventListener('change', ev => {
            if (!ev.target.checked) onRemove(coinObj.id, card2);
        });
    });
}
const coinsHistory = {};
function coinsGraph() {
    const reportDiv = document.querySelector('#real-time-report');

    reportDiv.innerHTML = "";

    if (reportarr.length === 0) {
        reportDiv.innerHTML = `
            <p class="custom-alert-box">You need to choose at least 1 coin in order to see some data.</p>
        `;
        reportDiv.style.display = 'block';
        reportDiv.style.height = 'auto';
        reportDiv.style.paddingBottom = '5px';
        reportDiv.style.paddingTop = '80px';

        if (window.graphInterval) {
            clearInterval(window.graphInterval);
        }
        return;
    }

    reportDiv.style.display = 'block';
    reportDiv.style.height = 'auto';
    reportDiv.style.paddingBottom = '0';

    const loadingGraphMsg = document.createElement('div');
    loadingGraphMsg.id = 'graph-loader';
    loadingGraphMsg.innerHTML = `
  <div style="display: flex; justify-content: center; align-items: center; height: 100px;">
    <div class="progress" style="width: 40%; height: 20px;">
      <div class="progress-bar progress-bar-striped progress-bar-animated bg-info" style="width: 100%;">
        Loading...
      </div>
    </div>
  </div>
`;
    reportDiv.appendChild(loadingGraphMsg);

    const newChart = document.createElement('div');
    newChart.id = 'chartContainer';
    newChart.style.height = '370px';
    newChart.style.width = '100%';
    reportDiv.appendChild(newChart);

    updateGraph();

    if (window.graphInterval) clearInterval(window.graphInterval);
    window.graphInterval = setInterval(updateGraph, 2000);
}



function updateGraph() {
    loadUpdateData().then(({ data, symbolarr }) => {
        const now = new Date();
        symbolarr.forEach(symbol => {
            if (!coinsHistory[symbol]) coinsHistory[symbol] = [];
            coinsHistory[symbol].push({
                x: now,
                y: Number(data[symbol]?.USD) || 0
            });
            if (coinsHistory[symbol].length > 30) coinsHistory[symbol].shift();
        });

        const chartData = symbolarr.map(symbol => ({
            type: "line",
            name: symbol,
            showInLegend: true,
            yValueFormatString: "$#,##0.###########",
            dataPoints: coinsHistory[symbol]
        }));

        var chart = new CanvasJS.Chart("chartContainer", {
            backgroundColor: "transparent",
            axisX: {
                title: "Time",
                lineColor: "#08295a",       
                labelFontColor: "#08295a",  
                tickColor: "#08295a",
                gridColor: "#08295a"      
            },
            axisY: {
                title: "Price",
                lineColor: "#08295a",      
                labelFontColor: "#08295a",  
                tickColor: "#08295a",
                gridColor: "#08295a"
            },
            title: {
                text: "Coins Update Prices"
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                itemclick: toggleDataSeries
            },
            data: chartData
        });
        chart.render();
        const loader = document.querySelector('#graph-loader');
        if (loader) loader.remove();
    });

}

async function loadUpdateData() {
    const coinslist = JSON.parse(localStorage.getItem('coins') || "[]");
    let symbolarr = [];
    reportarr.forEach(id => {
        const coin = coinslist.find(c => c.id === id);
        if (coin) {
            const symbol = coin.symbol.toUpperCase();
            if (!symbolarr.includes(symbol)) symbolarr.push(symbol);
        }
    });
    const coinsSelected = symbolarr.join(',');
    if (coinsSelected.length === 0) {
        console.error("No coins selected for update.");
        return { data: {}, symbolarr: [] };
    }
    const apiKey = "036ada3b2d3a66b008a84acc37fcf9cf09eea373a52523af28830640dbcb3028";
    try {
        const res = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsSelected}&tsyms=USD&api_key=${apiKey}`);
        const data = await res.json();
        return { data, symbolarr };
    } catch (e) {
        return { data: {}, symbolarr };
    }
}

function toggleDataSeries(e) {
    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
    } else {
        e.dataSeries.visible = true;
    }
    e.chart.render();
}

