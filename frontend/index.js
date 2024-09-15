import { Actor, HttpAgent } from "@dfinity/agent";

// Initialize Feather Icons
feather.replace();

let assets = [];
let backend;

async function initializeBackend() {
    const canisterId = import.meta.env.VITE_BACKEND_CANISTER_ID;
    const agent = new HttpAgent({ host: "https://ic0.app" });
    
    // Dynamically import the declarations
    const { idlFactory } = await import(/* @vite-ignore */ `../declarations/${canisterId}.did.js`);
    backend = Actor.createActor(idlFactory, { agent, canisterId });
}

async function fetchAssets() {
    try {
        if (!backend) await initializeBackend();
        assets = await backend.getAssets();
        displayHoldings();
        updateCharts();
    } catch (error) {
        console.error('Error fetching assets:', error);
        alert('Failed to fetch assets. Please try again later.');
    }
}

async function displayHoldings() {
    const holdingsBody = document.getElementById('holdings-body');
    holdingsBody.innerHTML = '';

    if (assets.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6">No assets found. Add some assets to get started!</td>';
        holdingsBody.appendChild(row);
        return;
    }

    for (const asset of assets) {
        const marketData = await fetchMarketData(asset.symbol);
        const marketPrice = marketData.currentPrice;
        const previousClose = marketData.previousClose;
        const marketValue = marketPrice * asset.quantity;
        const totalGainValue = marketValue - (previousClose * asset.quantity);
        const totalGainPercent = (totalGainValue / (previousClose * asset.quantity)) * 100;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="stock-symbol">${asset.symbol}</span> ${asset.name}</td>
            <td>${asset.quantity}</td>
            <td>$${marketValue.toFixed(2)}</td>
            <td>$${marketPrice.toFixed(2)}</td>
            <td class="${totalGainValue >= 0 ? 'positive' : 'negative'}">
                ${totalGainPercent >= 0 ? '+' : ''}${totalGainPercent.toFixed(2)}%<br>
                $${totalGainValue.toFixed(2)}
            </td>
            <td>${asset.assetType}</td>
        `;
        holdingsBody.appendChild(row);
    }
}

async function fetchMarketData(symbol) {
    try {
        const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        const quote = data['Global Quote'];
        return {
            currentPrice: parseFloat(quote['05. price']),
            previousClose: parseFloat(quote['08. previous close']),
        };
    } catch (error) {
        console.error('Error fetching market data:', error);
        return {
            currentPrice: 0,
            previousClose: 0,
        };
    }
}

function showPage(pageName) {
    const pages = document.querySelectorAll('#holdings-page, #allocations-page');
    const tabs = document.querySelectorAll('.tab');

    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === `${pageName}-page`) {
            page.classList.add('active');
        }
    });

    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.page === pageName) {
            tab.classList.add('active');
        }
    });

    if (pageName === 'allocations') {
        updateCharts();
    }
}

function showAddAssetModal() {
    const modal = document.getElementById('add-asset-modal');
    modal.style.display = 'block';
}

function closeAddAssetModal() {
    const modal = document.getElementById('add-asset-modal');
    modal.style.display = 'none';
    document.getElementById('add-asset-form').reset();
}

document.getElementById('add-asset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const symbol = document.getElementById('symbol').value.toUpperCase();
    const name = document.getElementById('name').value;
    const quantity = parseFloat(document.getElementById('quantity').value);
    const type = document.getElementById('type').value;

    const newAsset = { symbol, name, quantity, assetType: type };

    try {
        if (!backend) await initializeBackend();
        await backend.addAsset(newAsset);
        await fetchAssets();
        closeAddAssetModal();
    } catch (error) {
        console.error('Error adding asset:', error);
        alert('Failed to add asset. Please try again.');
    }
});

async function updateCharts() {
    const assetTypes = {};
    const performanceData = [];
    const performanceLabels = [];

    for (const asset of assets) {
        if (!assetTypes[asset.assetType]) {
            assetTypes[asset.assetType] = 0;
        }
        const marketData = await fetchMarketData(asset.symbol);
        const marketValue = marketData.currentPrice * asset.quantity;
        assetTypes[asset.assetType] += marketValue;

        const previousClose = marketData.previousClose;
        const totalGainValue = marketValue - (previousClose * asset.quantity);
        performanceData.push(totalGainValue);
        performanceLabels.push(asset.symbol);
    }

    const allocationLabels = Object.keys(assetTypes);
    const allocationData = Object.values(assetTypes);

    const allocationChartCtx = document.getElementById('allocationChart').getContext('2d');
    new Chart(allocationChartCtx, {
        type: 'doughnut',
        data: {
            labels: allocationLabels,
            datasets: [{
                data: allocationData,
                backgroundColor: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        boxWidth: 15
                    }
                }
            }
        }
    });

    const performanceChartCtx = document.getElementById('performanceChart').getContext('2d');
    new Chart(performanceChartCtx, {
        type: 'bar',
        data: {
            labels: performanceLabels,
            datasets: [{
                label: 'Performance ($)',
                data: performanceData,
                backgroundColor: performanceData.map(value => value >= 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)'),
                borderColor: performanceData.map(value => value >= 0 ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    showPage('holdings');
    fetchAssets();

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => showPage(tab.dataset.page));
    });

    document.getElementById('add-asset-btn').addEventListener('click', showAddAssetModal);
    document.getElementById('close-modal').addEventListener('click', closeAddAssetModal);
});

window.onclick = function(event) {
    const modal = document.getElementById('add-asset-modal');
    if (event.target == modal) {
        closeAddAssetModal();
    }
};