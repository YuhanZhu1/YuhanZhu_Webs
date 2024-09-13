let carIndex = 0;

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOMContentLoaded event fired, setting up event listeners...");
    document.getElementById('addCarBtn').addEventListener('click', addCarForm);
    document.getElementById('calculateBtn').addEventListener('click', function() {
        console.log("Calculate button clicked");
        calculateCosts();
    });
    addCarForm();  // Add the first car form automatically on load
});

document.getElementById('toggle-instructions').addEventListener('click', function() {
    const instructions = document.getElementById('instructions');
    instructions.style.display = instructions.style.display === 'none' ? 'block' : 'none';
});

function addCarForm() {
    console.log(`Adding form for Car ${carIndex + 1}`);
    const container = document.getElementById('carFormsContainer');
    const formHtml = `
        <div class="carForm" id="carForm${carIndex}">
            <h3>Car ${carIndex + 1}</h3>
            <label for="purchasePrice${carIndex}">Purchase Price (USD):</label>
            <input type="number" id="purchasePrice${carIndex}" required><br>

            <label for="fuelPrice${carIndex}">Fuel Price (USD per gallon):</label>
            <input type="number" step="0.01" id="fuelPrice${carIndex}" required><br>

            <label for="mpg${carIndex}">Miles per Gallon (MPG):</label>
            <input type="number" step="0.1" id="mpg${carIndex}" required><br>

            <label for="annualMileage${carIndex}">Annual Mileage (miles):</label>
            <input type="number" id="annualMileage${carIndex}" required><br>

            <label for="insuranceCost${carIndex}">Insurance Cost (USD per year):</label>
            <input type="number" id="insuranceCost${carIndex}" required><br>

            <label for="maintenanceCost${carIndex}">Maintenance Cost (USD per year):</label>
            <input type="number" id="maintenanceCost${carIndex}" required><br>

            <label for="resaleValue${carIndex}">Resale Value (USD):</label>
            <input type="number" id="resaleValue${carIndex}" required><br>

            <label for="yearsOfUse${carIndex}">Years of Use:</label>
            <input type="number" id="yearsOfUse${carIndex}" required><br>
            <hr />
        </div>
    `;

    container.insertAdjacentHTML('beforeend', formHtml);
    carIndex++;
}

function calculateCosts() {
    console.log("Starting cost calculations...");
    const carData = [];
    let lowestCostCar = { name: '', totalCost: Infinity };

    for (let i = 0; i < carIndex; i++) {
        console.log(`Calculating costs for Car ${i + 1}`);
        const purchasePrice = parseFloat(document.getElementById(`purchasePrice${i}`).value) || 0;
        const fuelPrice = parseFloat(document.getElementById(`fuelPrice${i}`).value) || 0;
        const mpg = parseFloat(document.getElementById(`mpg${i}`).value) || 0;
        const annualMileage = parseFloat(document.getElementById(`annualMileage${i}`).value) || 0;
        const insuranceCost = parseFloat(document.getElementById(`insuranceCost${i}`).value) || 0;
        const maintenanceCost = parseFloat(document.getElementById(`maintenanceCost${i}`).value) || 0;
        const resaleValue = parseFloat(document.getElementById(`resaleValue${i}`).value) || 0;
        const yearsOfUse = parseInt(document.getElementById(`yearsOfUse${i}`).value) || 1;

        if (mpg === 0) {
            console.log("MPG is zero, stopping calculation.");
            alert("MPG cannot be zero");
            return;
        }

        const fuelCost = (annualMileage / mpg) * fuelPrice * yearsOfUse;
        const depreciation = purchasePrice - resaleValue; // Not used in yearly cost, but calculated for total cost
        const totalInsurance = insuranceCost * yearsOfUse;
        const totalMaintenance = maintenanceCost * yearsOfUse;
        const totalCost = fuelCost + depreciation + totalInsurance + totalMaintenance;

        carData.push({
            name: `Car ${i + 1}`,
            purchasePrice,
            totalCost,
            fuelCost,
            depreciation,
            totalInsurance,
            totalMaintenance,
            yearsOfUse
        });

        if (totalCost < lowestCostCar.totalCost) {
            lowestCostCar = { name: `Car ${i + 1}`, totalCost };
        }
    }

    displayComparisonChart(carData);
    displayYearlyCosts(carData);  // Call to update yearly cost chart
    document.getElementById('lowestCostCar').innerHTML = `The car with the lowest total cost over ${carData[0].yearsOfUse} years is ${lowestCostCar.name} with a total cost of $${lowestCostCar.totalCost.toFixed(2)}.`;
}

function calculateYearlyCosts(car) {
    const yearlyCosts = [];
    let cumulativeCost = car.purchasePrice;  // Start with purchase price in the first year

    // Fuel cost remains constant each year based on mileage
    const yearlyFuelCost = car.fuelCost / car.yearsOfUse;
    
    // Insurance and maintenance costs are constant each year
    const yearlyInsurance = car.totalInsurance / car.yearsOfUse;
    const yearlyMaintenance = car.totalMaintenance / car.yearsOfUse;

    for (let year = 1; year <= car.yearsOfUse; year++) {
        // Add yearly fuel, insurance, and maintenance costs to cumulative cost
        cumulativeCost += yearlyFuelCost + yearlyInsurance + yearlyMaintenance;
        
        // Push the cumulative cost for each year
        yearlyCosts.push(cumulativeCost);
    }

    return yearlyCosts;
}

function displayComparisonChart(carData) {
    console.log("Displaying comparison chart...");
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    const labels = carData.map(car => car.name);
    const data = carData.map(car => car.totalCost);

    // Check if comparisonChart exists and is an instance of Chart before destroying
    if (window.comparisonChart && typeof window.comparisonChart.destroy === 'function') {
        window.comparisonChart.destroy();
    }

    window.comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Cost (USD)',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function displayYearlyCosts(carData) {
    console.log("Displaying yearly cost chart...");
    const ctx = document.getElementById('yearlyCostChart').getContext('2d');
    const labels = [...Array(carData[0].yearsOfUse).keys()].map(i => `Year ${i + 1}`);
    const datasets = carData.map(car => ({
        label: car.name,
        data: calculateYearlyCosts(car),
        fill: false,
        borderColor: getRandomColor(),
        tension: 0.1
    }));

    // Check if yearlyCostChart exists and is an instance of Chart before destroying
    if (window.yearlyCostChart && typeof window.yearlyCostChart.destroy === 'function') {
        window.yearlyCostChart.destroy();
    }

    window.yearlyCostChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
