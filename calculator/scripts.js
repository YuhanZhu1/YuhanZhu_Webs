document.getElementById('compare-ev').addEventListener('change', function() {
    const evOptions = document.getElementById('ev-options');
    evOptions.style.display = this.checked ? 'block' : 'none';
});

document.getElementById('calculator-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const unit = document.getElementById('unit').value;
    let mileage = parseFloat(document.getElementById('mileage').value) || (unit.includes('miles') ? 14000 : 22531);
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
        mileage *= 0.621371;
        fuelEfficiencies = fuelEfficiencies.map(eff => convertUnits(eff, 'lkm', 'mpg'));
    } else if (unit === 'km-kml') {
        mileage *= 0.621371;
        fuelEfficiencies = fuelEfficiencies.map(eff => convertUnits(eff, 'kml', 'mpg'));
    }

    function calculateCosts(mileagePerYear, years, fuelPrice, electricityPrice, carPrices, fuelEfficiencies, electricEfficiency, evPrice) {
        const fuelCosts = fuelEfficiencies.map(eff => (mileagePerYear / eff) * fuelPrice);
        const electricCostEv = (mileagePerYear / 100) * electricEfficiency * electricityPrice;

        const totalCosts = carPrices.map((price, index) => price + (fuelCosts[index] * years));
        const evTotalCost = evPrice + (electricCostEv * years);

        return { totalCosts, evTotalCost };
    }

    function getBestCost(totalCosts, evTotalCost) {
        const minCost = Math.min(...totalCosts, evTotalCost);
        const bestCarIndex = totalCosts.indexOf(minCost);
        const bestCarCost = minCost;
        const evIsBest = evTotalCost < bestCarCost;

        return evIsBest ? { bestCar: 'EV', cost: evTotalCost } : { bestCar: `Car with ${fuelEfficiencies[bestCarIndex]} MPG`, cost: bestCarCost };
    }

    function plotCostCurves(mileagePerYear, years, fuelPrice, electricityPrice, carPrices, fuelEfficiencies, electricEfficiency, evPrice) {
        const mileages = Array.from({ length: 19 }, (_, i) => (i + 1) * 5000);
        const costCurves = mileages.map(mileage => calculateCosts(mileage, years, fuelPrice, electricityPrice, carPrices, fuelEfficiencies, electricEfficiency, evPrice));
        const standardCosts = costCurves.map(curve => curve.totalCosts[0]);
        const hybridCosts = costCurves.map(curve => curve.totalCosts[1]);
        const evCosts = costCurves.map(curve => curve.evTotalCost);

        const ctx = document.getElementById('cost-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: mileages,
                datasets: [
                    { label: 'Standard Fuel Car', data: standardCosts, borderColor: 'red', fill: false },
                    { label: 'Hybrid Car', data: hybridCosts, borderColor: 'blue', fill: false },
                    { label: 'Electric Car', data: evCosts, borderColor: 'green', fill: false }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: unit.includes('miles') ? 'Mileage (miles)' : 'Mileage (km)' } },
                    y: { title: { display: true, text: 'Total Cost ($)' } }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const index = context.dataIndex;
                                return [
                                    `Standard Fuel Car: $${standardCosts[index].toFixed(2)}`,
                                    `Hybrid Car: $${hybridCosts[index].toFixed(2)}`,
                                    `Electric Car: $${evCosts[index].toFixed(2)}`
                                ];
                            }
                        }
                    }
                }
            }
        });
    }

    const { totalCosts, evTotalCost } = calculateCosts(mileage, years, fuelPrice, electricityPrice, carPrices, fuelEfficiencies, electricEfficiency, evPrice);
    const bestCost = getBestCost(totalCosts, evTotalCost);

    document.getElementById('results').innerText = `The most cost-effective option is ${bestCost.bestCar} with a total cost of $${bestCost.cost.toFixed(2)} over ${years} years and ${mileage} miles per year.`;

    plotCostCurves(mileage, years, fuelPrice, electricityPrice, carPrices, fuelEfficiencies, electricEfficiency, evPrice);
});

