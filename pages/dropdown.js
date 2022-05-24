var mydata = [
    [],
    ["United States of America","Joe Biden"],
    ["United States of America","Donald Trump"],
    ["United States of America","Barack Obama"],
    ["Russia","Vladimir Putin"],
    ["China","Xi Jinping"],
    ["France","Emmanuel Macron"],
    ["India"," Narendra Modi"], 
    ["Argentina", "Alberto Fernández"],
	["Japan", "Fumio Kishida"],
	["Mexico", "Andrés Manuel López Obrador"],
	["Saudi Arabia", "Mohammed bin Salman"],
	["South Korea", "Moon Jae-in"],
	["Turkey", "Recep Tayyip Erdoğan"],
    ["Germany", "Olaf Scholz"],
    ["Australia","Scott Morrison"],
    ["United Kingdom","Boris Johnson"],
    ["European Union","Ursula von der Leyen"],
    ["Canada","Justin Trudeau"],
    ["Indonesia","Joko Widodo"],
    ["Italy","Mario Draghi"],
    ["South Africa","Cyril Ramaphosa"]
];

function makeDropDown(data,filtersAsArray,targetElement){

    const filteredArray = filterArray(data,filtersAsArray);
    const uniqueList = getUniqueValues(filteredArray,filtersAsArray.length);
    populateDropDown(targetElement,uniqueList);

}

function applyDropDown() {
    const selectLevel1Value = document.getElementById("level1").value;
    const selectLevel2 = document.getElementById("level2");
    makeDropDown(mydata,[selectLevel1Value],selectLevel2);
    applyDropDown2();
}

function applyDropDown2() {
    const selectLevel1Value = document.getElementById("level1").value;
    const selectLevel2Value = document.getElementById("level2").value;
    const selectLevel3 = document.getElementById("level3");
    makeDropDown(mydata,[selectLevel1Value,selectLevel2Value],selectLevel3);
}

function afterDocumentLoads(){
    populateFirstLevelDropDown();
    applyDropDown();

}

function getUniqueValues(data,index){
    const uniqueOptions = new Set();
    data.forEach(r => uniqueOptions.add(r[index]));

    return [...uniqueOptions];

}

function populateFirstLevelDropDown(){
    const uniqueList = getUniqueValues(mydata,0);
    const el = document.getElementById("level1");
    populateDropDown(el,uniqueList);

}

function populateDropDown(el,listAsArray){
    el.innerHTML = "";

    listAsArray.forEach(item => {
        const option = document.createElement("option");
        option.textContent = item;
        el.appendChild(option);
    });
}

function filterArray(data,filtersAsArray){

   return data.filter(r => filtersAsArray.every((item,i) => item === r[i]));

}



document.getElementById("level1").addEventListener("change", applyDropDown);
document.getElementById("level2").addEventListener("change", applyDropDown2);
document.addEventListener("DOMContentLoaded", afterDocumentLoads);
