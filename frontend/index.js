import { backend } from 'declarations/backend';

document.addEventListener('DOMContentLoaded', async () => {
    const addHoldingForm = document.getElementById('addHoldingForm');
    const holdingsTable = document.getElementById('holdingsTable').getElementsByTagName('tbody')[0];
    const totalValueSpan = document.getElementById('totalValue');

    addHoldingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const symbol = document.getElementById('symbol').value.toUpperCase();
        const quantity = parseFloat(document.getElementById('quantity').value);
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);

        if (symbol && !isNaN(quantity) && !isNaN(purchasePrice) && quantity > 0 && purchasePrice > 0) {
            await backend.addHolding(symbol, quantity, purchasePrice);
            addHoldingForm.reset();
            await updateHoldings();
        } else {
            alert('Please enter valid values for all fields.');
        }
    });

    async function updateHoldings() {
        const holdings = await backend.getHoldings();
        const totalValue = await backend.calculateTotalValue();
        const currentPrices = await backend.getCurrentPrices();

        const priceMap = new Map(currentPrices);

        holdingsTable.innerHTML = '';
        holdings.forEach(holding => {
            const currentPrice = priceMap.get(holding.symbol) || holding.currentPrice;
            const totalValue = holding.quantity * currentPrice;
            const profitLoss = totalValue - (holding.quantity * holding.purchasePrice);

            const row = holdingsTable.insertRow();
            row.innerHTML = `
                <td>${holding.symbol}</td>
                <td>${holding.quantity.toFixed(2)}</td>
                <td>$${holding.purchasePrice.toFixed(2)}</td>
                <td>$${currentPrice.toFixed(2)}</td>
                <td>$${totalValue.toFixed(2)}</td>
                <td style="color: ${profitLoss >= 0 ? 'green' : 'red'}">$${profitLoss.toFixed(2)}</td>
                <td>
                    <button onclick="updateHolding('${holding.symbol}', ${holding.quantity}, ${currentPrice})">Update</button>
                    <button onclick="removeHolding('${holding.symbol}')">Remove</button>
                </td>
            `;
        });

        totalValueSpan.textContent = `$${totalValue.toFixed(2)}`;
    }

    window.removeHolding = async (symbol) => {
        await backend.removeHolding(symbol);
        await updateHoldings();
    };

    window.updateHolding = async (symbol, quantity, currentPrice) => {
        const newQuantity = prompt(`Enter new quantity for ${symbol}:`, quantity);
        if (newQuantity !== null) {
            const parsedQuantity = parseFloat(newQuantity);
            if (!isNaN(parsedQuantity) && parsedQuantity > 0) {
                await backend.updateHolding(symbol, parsedQuantity, currentPrice);
                await updateHoldings();
            } else {
                alert('Please enter a valid quantity.');
            }
        }
    };

    // Update holdings every 30 seconds to simulate real-time updates
    setInterval(updateHoldings, 30000);

    await updateHoldings();
});