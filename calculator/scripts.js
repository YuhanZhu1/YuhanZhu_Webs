document.getElementById('compare-ev').addEventListener('change', function() {
    const evOptions = document.getElementById('ev-options');
    evOptions.style.display = this.checked ? 'block' : 'none';
});

document.getElementById('toggle-instructions').addEventListener('click', function() {
    const instructions = document.getElementById('instructions');
    instructions.style.display = instructions.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('calculator-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const unit = document.getElementById('unit').value;
    let annualMileage = parseFloat(document.getElementById('mileage').value) || (unit.includes('miles') ? 14000 : 22531);
    const years = parseFloat(document.getElementById('years').value) || 8;
    const fuelEfficiencies = document.getElementById('fuel-efficiency').value.split(',').map(parseFloat);
    const carPrices = document.getElementById('car-prices').value.split(',').map(parseFloat);
    const compareEv = document.getElementById('compare-ev').checked;

    let evPrice = parseFloat(document.getElementById('ev-price').value) || 30000;
    let electricityPrice = parseFloat(document.getElementById('electricity-price').value) || 0.16;
    let electricEfficiency = parseFloat(document.getElementById('electric-efficiency').value) || 30;

    const fuelPrice = unit.includes('miles') ? 3.5 : 0.9;  // Default values, can be customized

    function convertUnits(value, from, to) {
        const conversions = {
            'mpg-lkm': value => 235.21 / value,
            'mpg-kml': value => value * 0.425144,
            'lkm-mpg': value => 235.21 / value,
            'kml-mpg': value => value / 0.425144,
        };
        return conversions[`${from}-${to}`](value);
    }

    if (unit === 'km-lkm') {
        annualMileage *= 0.621371;  // Convert km to miles
        fuelEfficiencies = fuelEfficiencies.map(eff => convertUnits(eff, 'lkm', 'mpg'));
        electricEfficiency *= 0.621371;  // Convert kWh/100 km to kWh/100 miles
    } else if (unit === 'km-kml') {
        annualMileage *= 0.621371;  // Convert km to miles
        fuelEfficiencies = fuelEfficiencies.map(eff => convertUnits(eff, 'kml', 'mpg'));
        electricEfficiency *= 0.621371;  // Convert kWh/100 km to kWh/100 miles
    }

    function calculateCosts(annualMileage, years, fuelPrice, electricityPrice, carPrices, fuelEfficiencies, electricEfficiency, evPrice) {
        const totalMileage = annualMileage * years;
        const fuelCosts = fuelEfficiencies.map(eff => (totalMileage / eff) * fuelPrice);
        const electricCostEv = (totalMileage / 100) * electricEfficiency * electricityPrice;

        const totalCosts = carPrices.map((price, index) => price + fuelCosts[index]);
        const evTotalCost = evPrice + electricCostEv;

        return { totalCosts, evTotalCost };
    }

    function getBestCost(totalCosts, evTotalCost) {
        const minCost = Math.min(...totalCosts, evTotalCost);
        const bestCarIndex = totalCosts.indexOf(minCost);
        const bestCarCost = minCost;
        const evIsBest = evTotalCost < bestCarCost;

        return evIsBest ? { bestCar: 'EV', cost: evTotalCost } : { bestCar: `Car with ${fuelEfficiencies[bestCarIndex]} MPG`, cost: bestCarCost };
    }

    function plotCostCurves(annualMileage, years, fuelPrice, electricityPrice, carPrices, fuelEfficiencies, electricEfficiency, evPrice) {
        const totalMileage = annualMileage * years;
        const mileages = Array.from({ length: 19 }, (_, i) => (i + 1) * (totalMileage / 19));
        const costCurves = mileages.map(mileage => calculateCosts(mileage / years, years, fuelPrice, electricityPrice, carPrices, fuelEfficiencies, electricEfficiency, evPrice));
        const datasets = fuelEfficiencies.map((eff, index) => {
            return {
                label: `${eff} ${unit.includes('miles') ? 'MPG' : unit === 'km-lkm' ? 'L/100KM' : 'KM/L'}`,
                data: costCurves.map(curve => curve.totalCosts[index]),
                borderColor: `hsl(${(index * 60) % 360}, 70%, 50%)`,
                fill: false
            };
        });
        if (compareEv) {
            datasets.push({
                label: 'EV',
                data: costCurves.map(curve => curve.evTotalCost),
                borderColor: 'green',
                fill: false
            });
        }

        const ctx = document.getElementById('cost-chart').getContext('2d');
        if (window.costChart) {
            window.costChart.destroy();
        }
        window.costChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mileages,
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Total Mileage' } },
                    y: { title: { display: true, text: 'Total Cost ($)' } }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const index = context.dataIndex;
                                const mileage = context.chart.data.labels[index];
                                const costs = context.chart.data.datasets.map(dataset => ({
                                    label: dataset.label,
                                    cost: dataset.data[index]
                                }));
                                return costs.map(cost => `${cost.label}: $${cost.cost.toFixed(2)}`).join('\n');
                            }
                        }
                    }
                }
            }
        });
    }

    const { totalCosts, evTotalCost } = calculateCosts(annualMileage, years, fuelPrice, electricityPrice, carPrices, fuelEfficiencies, electricEfficiency, evPrice);
    const bestCost = getBestCost(totalCosts, evTotalCost);

    document.getElementById('results').innerText = `The most cost-effective option is ${bestCost.bestCar} with a total cost of $${bestCost.cost.toFixed(2)} over ${years} years and ${annualMileage * years} ${unit.includes('miles') ? 'miles' : 'km'}.`;

    plotCostCurves(annualMileage, years, fuelPrice, electricityPrice, carPrices, fuelEfficiencies, electricEfficiency, evPrice);
});

