/*
	::::::TODO::::::
	[v]. Get the data from the page
	[v]. print the csv into the page to show that it's working. - the leading zeros are trimmed from the shot id when converting to csv
	[v]. send dummy json data to csv file and download
	[v]. is it possible to append new data to the file? - yes, just pull it out, edit and put it back
	[v]. find a way to store the data in something more persistant then a session/cookie on mobile. - Use Local Storage
	[v]. test the workflow on mobile - I WORKS OFFLINE!!!! Just download the page once!- local storage is cleared when the page is closed but not when you reload!
*/

/**
*	@var localStore - The Local storage variable name that will be appended to
*	@var dataObj - is a JSON Object to be appended to local storage
*	Assumptions:
*	1.) If no variable in local storage found, a new variable will be created
*	2.) the dataObj should be a JS object
*/
function addToLocalStorage(localStore, dataObj) {
	console.log("Adding to local storage");
	//If there is no session variable by the __localStore__ then make a new array for containing data
	if (!localStorage.getItem(localStore.toString())) {
		console.log("No Local Strorage named: " + localStore + "\nCreating a new array to store passed data");
		localStorage.setItem(localStore.toString(), "[]"); //initialize session variable for shots
	}
	try {
		//pull the object from local storage
		var stored = JSON.parse(localStorage.getItem(localStore.toString())); 
	}
	catch (err) {
		console.log("Uh oh! We got an error parsing the JSON stored in the '" + localStore.toString() + "' Local Storage \n" + err);
	}
	//add new data
	stored.push(dataObj);
	//put the object back
	localStorage.setItem(localStore.toString(), JSON.stringify(stored)); 
}
/**
*	@var localStore - the key for the localStorage object you want to convert to csv.
*	@Assumptions:  
*	1.) The localStore exsists in local storage, 
*	2.) the object is an array of objects, 
*	3.) each object in the array has the same number of fields and datamembers as the first entry and 
*	4.) there is at least one entry in the array.
*	@Returns the CSV file
*/
function makeCSV(localStore) {
	var row;
	var csvContent = "data:text/csv;charset=utf-8,";
	try {
		var cache = JSON.parse(localStorage.getItem(localStore.toString())); //Should return an array of JSON Shot objects
		console.log("This is the cache from LocalStorage: " + cache);
		try{
			var headers = JSON.parse(cache[0]); // Take the headers off of the first object
		}
	catch (TypeError){
		console.error("TypeError: There should be an object in the local Storage array '"+localStore+"'. can not make CSV if there is no data.");
		return null;
	}
		for (var k in headers) {
			csvContent += k + ',';
		}
		csvContent = csvContent.slice(0, -1); //remove trailing comma
		csvContent += "\r\n";
		for (var i = 0; i < cache.length; i++) {
			row = JSON.parse(cache[i]); //parse the shot from the array
			var fields = Object.values(row);
			console.log(fields);
			for (var j = 0; j < fields.length; j++) {
				if (fields[j] === true || fields[j] === false){
					console.log(fields[j] +" is an boolean");
					csvContent += fields[j] + ',';
				} else if (!isNaN(fields[j])) {
					console.log(fields[j] +" is an number");
					csvContent += parseInt(fields[j])+',';
				} else if (fields[j] != true || fields[j] != false) {
					console.log(fields[j] +" is an string");
					csvContent += '"' + fields[j] + '",';
				} 
			}
			csvContent = csvContent.slice(0, -1);
			csvContent += "\r\n";
			console.log(csvContent);
		}
	}
	catch (err) {
		console.log("Uh oh! We got an error\n" + err);
	}
	var encodedUri = encodeURI(csvContent);
	window.open(encodedUri);
	return csvContent;

}

function addShot2DB() {
	console.log("runCSV is running!");
	
	//Animate the Output box
	$("#csv").css('background-color', '#5c5c5c').delay(250).queue(function () {
		$(this).css('background-color', 'black');
	});
	
	var data = $("#json").text(); 	//Get the data from the page
	var dataJSON = JSON.parse(data); //clean it
	
	addToLocalStorage("shots", data); //push into local storage
}