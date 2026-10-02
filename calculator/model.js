/* Shared pure calculation model; usable in a browser and Node tests. */
function estimateCar(car, settings) {
  const {years, miles, inflation} = settings;
  const tax = car.price * car.tax / 100;
  const upfront = car.price + tax + car.fees;
  const principal = car.financed ? Math.max(0, upfront - car.down) : 0;
  const rate = car.apr / 1200;
  const payment = principal === 0 ? 0 : rate === 0 ? principal / car.term : principal * rate / (1 - Math.pow(1 + rate, -car.term));
  let balance = principal, interest = 0;
  const annual = {energy: miles / (car.electric ? 100 : car.efficiency) * (car.electric ? car.efficiency : 1) * car.energyPrice, insurance:car.insurance, maintenance:car.maintenance, registration:car.registration, parking:car.parking};
  const parts = {depreciation:car.price-car.resale, taxes:tax+car.fees, interest:0, energy:0, insurance:0, maintenance:0, registration:0, parking:0};
  const timeline = [];
  for(let year=1; year<=years; year++) {
    for(let month=(year-1)*12; month<Math.min(year*12,car.term); month++) {
      const charged = balance*rate; interest += charged; balance=Math.max(0,balance-(payment-charged));
    }
    for(const key of Object.keys(annual)) parts[key] += annual[key]*Math.pow(1+inflation/100,year-1);
    parts.interest=interest;
    timeline.push((car.price-car.resale)*year/years + parts.taxes + interest + Object.keys(annual).reduce((sum,key)=>sum+parts[key],0));
  }
  const total=Object.values(parts).reduce((a,b)=>a+b,0);
  return {name:car.name,parts,total,timeline,payment,balance,monthly:total/(years*12),perMile:miles?total/(miles*years):null,budget:payment+Object.values(annual).reduce((a,b)=>a+b,0)/12, upfrontCash:car.financed?Math.min(car.down,upfront):upfront};
}
if(typeof module!=='undefined') module.exports={estimateCar};
