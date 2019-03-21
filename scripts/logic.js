function startAlgorithm(){
	checkData();
}

function clearEntryContent(){
	document.getElementById('entryContent').value = "";
}

function checkData(){
	var entryData = document.getElementById('entryContent');
	var lines = entryData.value.split('\n');
	if(lines == ""){
		alert('Puste pole: dane wejsciowe!');
		return;
	}
	for (var i = 0; i < lines.length; i++){
		if(isNaN(lines[i])){
			alert('Dane wejsciowe zawieraja elementy nie bedace liczbami!');
			return;
		}
		else if(lines[i] < 0){
			alert('Jedna z wartosci wejsciowych jest mniejsza od 0!');
			return;
		}
	}
	
	var sessionNumber = document.getElementById('entrySessionNumber').value;
	if(isNaN(sessionNumber)){
		alert('Liczba sesji nie jest liczba!');
		return;
	}
	else if(sessionNumber > (lines.length/2)){
		alert('Liczba sesji jest zbyt duza!');
		return;
	}
	else if(sessionNumber < 2){
		alert('Liczba sesji nie moze byc mniejsza od 2');
		return;
	}
	
	var money = document.getElementById('money').value;
	if(isNaN(money)){
		alert('kapital nie jest liczba!');
		return;
	}
	else if(sessionNumber < 0){
		alert('Kapital jest mniejszy od 0!');
		return;
	}
	startCalculations(lines, sessionNumber, money);
}

function startCalculations(lines, session, money){
	var sma = countSMA(lines, session);
	var deviation = countDeviation(lines, session, sma);
	var upper = countUpper(sma, deviation);
	var lower = countLower(sma, deviation);
	printResult(sma, deviation, upper, lower, lines);
	invest(money, sma, upper, lower, lines);
}

function invest(money,sma, upper, lower, lines){
	document.getElementById('investLabel').style.visibility = 'visible';
	var investResult = document.getElementById('invest');
	investResult.style.visibility = 'visible';
	
	var investHistory = "";
	var realSma = [];
	var price = [];
	var possibleBought = 1;
	var actions = 0;
	var startMoney = money;
	
	var startNum = sma.length - upper.length  ;
	for(var i = startNum; i < sma.length; i++){
		realSma.push(sma[i].toString());
	}
	
	startNum = lines.length - upper.length;
	for (var i = startNum; i < lines.length; i++){
		price.push(lines[i].toString());
	}
	
	var downSma = 0;
	var upSma = 0;
	for (var i = 1; i < price.length; i++){
		if(price[i-1] < realSma[i-1] && price[i] > realSma[i]){
			downSma = 1;
			upSma = 0;
		}
		if(price[i-1] > realSma[i-1] && price[i] < realSma[i]){
			downSma = 0;
			upSma = 1;
		}
		
		if(downSma == "1" && possibleBought == "0" && price[i-1] < upper[i-1] && price[i] > upper[i]){
			//sprzedajemy
			money = parseFloat(money) + parseFloat(actions)*parseFloat(price[i]);
			tempActions = actions;
			actions = 0;
			investHistory = investHistory + 'dzien: '+(i+1) + ' sprzedano: ' + tempActions + ' akcji w cenie: ' + price[i] + ' posiadane pieniadze: ' + money + '\n';
			downSma = 0;
			possibleBought = 1;
		}
		if(upSma == "1" && possibleBought == "1" && price[i-1] > lower[i-1] && price[i] < lower[i]){
			//kupujemy
			actions = parseInt(parseFloat(money)/parseFloat(price[i]));
			money = parseFloat(money) - actions*parseFloat(price[i]);
			investHistory = investHistory + 'dzien: '+(i+1) + ' kupiono: ' + actions + ' akcji w cenie: ' + price[i] + ' posiadane pieniadze: ' + money + '\n';
			downSma = 0;
			possibleBought = 0;
		}
	}
	investHistory = investHistory + '\n\n\n' + 'PODSUMOWANIE:\n'
	var realMoney = money;
	if(possibleBought == "0"){
		var virtualMoney = parseFloat(actions)*parseFloat(price[price.length-1]);
		realMoney = parseFloat(realMoney) + parseFloat(virtualMoney);
		investHistory = investHistory + 'Akcje nie zostaly sprzedane!\nStan aktualny:\nPosiadane akcje: '+ actions +' o wartosci: '+ virtualMoney + '\n' + 'Posiadane pieniadze: ' + money + '\n';
	}
	var difference = realMoney - startMoney;
	var percentage = realMoney/startMoney*100;
	var more;
	if(difference > 0){
		more = (percentage - 100) + '%';
	}
	else{
		more = '-' + (100 - percentage) + '%';
	}
	investHistory = investHistory + '\nAktualny kapital: ' + realMoney + '\nRoznica kapitalow: ' +difference + '\nProcentowy zysk: '+more +'\n';
	investResult.innerHTML = investHistory;
}

function countUpper(sma, deviation){
	var upper = [];
	var startNum = sma.length - deviation.length;
	for (var i = 0; i < sma.length - startNum; i++){
		var value = parseFloat(sma[i+startNum]) + (2*parseFloat(deviation[i]));
		upper.push(value.toString());
	}
	return upper;
}

function countLower(sma, deviation){
	var lower = [];
	var startNum = sma.length - deviation.length;
	for (var i = 0; i < sma.length - startNum; i++){
		var value = parseFloat(sma[i+ startNum]) - (2*parseFloat(deviation[i]));
		lower.push(value.toString());
	}
	return lower;
}

function countSMA(lines, session){
	var sma = [];
	for (var i = 0; i < lines.length - session+1; i++){
		var sum = 0;
		for (var j = 0; j < session; j++){
			sum = parseFloat(sum) + parseFloat(lines[i+j]);
		}
		var value = parseFloat(sum)/parseFloat(session);
		sma.push(value.toString());
	}
	return sma;
}

function countDeviation(lines, session, sma){
	var deviation = [];
	var startNum = session-1;
	var k = 0;
	for (var i = startNum; i < lines.length - session + 1; i++){
		var sum = 0;
		for (var j = 0; j < session; j++){
			var difference = parseFloat(lines[i+j]) - parseFloat(sma[k+j]);
			var pow = Math.pow(difference, 2);
			sum = parseFloat(sum) + parseFloat(pow);
		}
		var temp = parseFloat(sum)/parseFloat(session);
		var value = Math.sqrt(temp);
		deviation.push(value.toString());
		k++;
	}
	return deviation;
}

function printResult(sma, deviation, upper, lower, lines){
	var startNum = sma.length - deviation.length;
	var smaResult = [];
	for (var i = 1; i < sma.length+1 - startNum; i++){
		smaResult= smaResult + i + ". " + sma[i+ startNum-1] + '\n';
	}
	document.getElementById('smaData').innerHTML = smaResult;
	
	var deviationResult = [];
	for (var i = 1; i < deviation.length+1; i++){
		deviationResult= deviationResult + i + ". " + deviation[i-1] + '\n';
	}
	document.getElementById('deviationData').innerHTML = deviationResult;
	
	var upperResult = [];
	for (var i = 1; i < upper.length+1; i++){
		upperResult= upperResult + i + ". " + upper[i-1] + '\n';
	}
	document.getElementById('upperData').innerHTML = upperResult;
	
	var lowerResult = [];
	for (var i = 1; i < lower.length+1; i++){
		lowerResult = lowerResult + i + ". " + lower[i-1] + '\n';
	}
	document.getElementById('lowerData').innerHTML = lowerResult;
	
	var price = [];
	var priceResult = [];
	startNum = lines.length - deviation.length;
	for (var i = startNum; i < lines.length; i++){
		price.push(lines[i].toString());
	}
	for (var i = 1; i < price.length+1; i++){
		priceResult = priceResult + i + ". " + price[i-1]+'\n';
	}
	document.getElementById('priceData').innerHTML = priceResult;
	

	printChart(sma, deviation, upper, lower, price);


}

var dataSma;
var dataUpper;
var dataLower;
var dataPrice;
var dataLabels;
var bollingerChart;

function printChart(sma, deviation, upper, lower, price){
	var smaReal = [];
	dataLabels = [];
	var startNum = sma.length - upper.length;
	for (var i = startNum; i < sma.length; i++){
		smaReal.push(sma[i].toString());
	}
	
	for (var i = 1; i < smaReal.length + 1; i++){
		dataLabels.push(i.toString());
	}
	
	dataSma = {
		label: "SMA",
		data: smaReal,
		lineTension: 0.3,
		fill: false,
		borderColor: 'red',
		backgroundColor: 'transparent',
		pointRadius: 0,
		pointHoverRadius: 15,
		pointHitRadius: 30
	};
  
	dataUpper = {
		label: "Wstega gorna",
		data: upper,
		lineTension: 0.3,
		fill: false,
		borderColor: 'green',
		backgroundColor: 'transparent',
		pointRadius: 0,
		pointHoverRadius: 15,
		pointHitRadius: 30
	};


	dataLower = {
		label: "Wstega dolna",
		data: lower,
		lineTension: 0.3,
		fill: false,
		borderColor: 'blue',
		backgroundColor: 'transparent',
		pointRadius: 0,
		pointHoverRadius: 15,
		pointHitRadius: 30
	};
	
	dataPrice = {
		label: "Cena",
		data: price,
		lineTension: 0.3,
		fill: false,
		borderColor: 'black',
		backgroundColor: 'transparent',
		pointRadius: 0,
		pointHoverRadius: 15,
		pointHitRadius: 30
	};
	
	var bollingerData = {
		labels: dataLabels,
		datasets:[dataSma, dataUpper, dataLower, dataPrice]
	};
	var smaCheck = document.getElementById('smaChecked');
	smaCheck.style.visibility = 'visible';
	smaCheck.checked = true;
	var upperCheck = document.getElementById('upperChecked');
	upperCheck.style.visibility = 'visible';
	upperCheck.checked = true;
	var lowerCheck = document.getElementById('lowerChecked');
	lowerCheck.style.visibility = 'visible';
	lowerCheck.checked = true;
	var priceCheck = document.getElementById('priceChecked');
	priceCheck.style.visibility = 'visible';
	priceCheck.checked = true;
	
	printRealChart(bollingerData);
}

function printRealChart(bollingerData){
	var chartOptions = {
		legend: {
			display: true,
			position: 'top',
			labels: {
				boxWidth: 80,
				fontColor: 'black'
			}
		},
		pan: {
            enabled: true,
            mode: 'xy',
        },
        zoom: {
            enabled: true,                      
            mode: 'xy',
        }
	};
	var myChart = document.getElementById('myChart');
	var ctx = myChart.getContext('2d');	
	if(typeof bollingerChart != "undefined"){
			bollingerChart.destroy();
	}

	bollingerChart = new Chart(ctx,{
		type:'line',
		data: bollingerData,
		options: chartOptions
	});
}

function checkCheckBoxes(){
	dataSet = [];
	var smaCheck = document.getElementById('smaChecked');
	var upperCheck = document.getElementById('upperChecked');
	var lowerCheck = document.getElementById('lowerChecked');
	var priceCheck = document.getElementById('priceChecked');
	if(smaCheck.checked == true){
		dataSet.push(dataSma);
	}
	if(upperCheck.checked == true){
		dataSet.push(dataUpper);
	}
	if(lowerCheck.checked == true){
		dataSet.push(dataLower);
	}
	if(priceCheck.checked == true){
		dataSet.push(dataPrice);
	}
	var bollingerData = {
		labels: dataLabels,
		datasets:dataSet
	};
	bollingerChart.destroy();
	printRealChart(bollingerData);
}




































