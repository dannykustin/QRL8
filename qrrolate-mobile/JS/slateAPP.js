/*
TODO:
[ ] Remove Addressbar
[ ] Auto population content from  a csv?
[ ] onboarding porcess to get this data?
[ ] clear board
[ ] Next Take function
[ ] next scene function
[ ] store location data of slate into object for analysis later
[ ] position QR in cent of screen (no cropping)
[ ] tagging a shot should flip a boolean
[ ] audio and video notes should write from top left in smaller font
[ ] don't zoom in to text box when typing. Avoid Keyboard if possible
[ ] click and hold event? to reduce how easy it is to accidentally change the data on the slate.
[ ] Probably should have a feature to see what has been shot so far.
[ ] remove remporary values already implemented for testing
[ ] Trigger the different screens of the app
*/
$(window).load(function () {
	setTimeout(function () {
		// Hide the address bar!
		window.scrollTo({
			top: 1
			, left: 0
			, behavior: "instant"
		});
	}, 0);
});
// *********** Utility Functions *********** //
/**
 *	@returns of the Width or height of the Screen it returns the value of the smaller
 *	@default will return 10 if jQuery can't get width or height
 */
function getSmallestScreenDimention() {
	try {
		var smallerDimention = 0;
		var windowWidth = $(window).width();
		var windowHeight = $(window).height();
		//determines which dimension is smaller
		if (windowHeight > windowWidth) {
			console.log("width is smaller:  " + windowWidth);
			smallerDimention = windowWidth;
		}
		else {
			console.log("height is smaller: " + windowHeight);
			smallerDimention = windowHeight;
		}
	}
	catch (err) {
		var smallerDimention = 10; // 10 is default to ensure somehting shows up.
		console.error("unable to get Smallest Screen Dimention: " + err)
	}
	return smallerDimention;
}
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
	console.log(JSON.stringify(stored));
	localStorage.setItem(localStore.toString(), JSON.stringify(stored));
}

function getFromLocalStorage(localStore) {
	try {
		var stored = JSON.parse(localStorage.getItem(localStore.toString()));
		console.log(stored);
		return stored
	}
	catch (err) {
		console.log("Uh oh! We encountered an error finding " + localStore + " in your local storage");
		return "No data in LocalStorage";
	}
}

function getShotID() {
	try {
		if (!localStorage.getItem("shotID")) {
			//4 digits of shots cause it's unlikely to call slate over 9,000 times. preceding 1 is just to ensure all 4 digits are present
			return 1000
		}
		else {
			return parseInt(localStorage.getItem("shotID"));
		}
	}
	catch (err) {
		return 1000;
	}
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
		console.log("This is the cache from LocalStorage: " + localStorage.getItem(localStore.toString()));
		try {
			var headers = cache[0]; // Take the headers off of the first object
		}
		catch (TypeError) {
			console.error("TypeError: There should be an object in the local Storage array '" + localStore + "'. can not make CSV if there is no data." + TypeError);
			return null;
		}
		for (var k in headers) {
			csvContent += k + ',';
		}
		csvContent = csvContent.slice(0, -1); //remove trailing comma
		csvContent += "\r\n";
		for (var i = 0; i < cache.length; i++) {
			row = cache[i]; //parse the shot from the array
			var fields = Object.values(row);
			console.log(fields);
			for (var j = 0; j < fields.length; j++) {
				if (fields[j] === true || fields[j] === false) {
					console.log(fields[j] + " is an boolean");
					csvContent += fields[j] + ',';
				}
				else if (!isNaN(fields[j])) {
					console.log(fields[j] + " is an number");
					csvContent += parseInt(fields[j]) + ',';
				}
				else if (fields[j] != true || fields[j] != false) {
					console.log(fields[j] + " is an string");
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
	//	out of date on Older devices 
	window.open(encodedUri, '_system');
	return encodedUri;
}
// *********** Model Controllers *********** // 
/**
 * Auto Fills the date as curent day
 */
function getTodayDate() {
	console.log("getting a date");
	//Gets date info
	var date = new Date();
	//Parses it to a useful format
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	if (month < 10) {
		month = "0" + month;
	}
	if (day < 10) {
		day = "0" + day;
	}
	var today = year + "-" + month + "-" + day;
	console.log(today);
	//fills in the date input
	return today;
}

function clearTempFootageData() {
	return {
		shotID: getShotID()
		, card: ""
		, sceneNumber: ""
		, shotLetter: ""
		, take: 1
		, productionName: getFromLocalStorage("productionName")
		, productionCompany: getFromLocalStorage("productionCompany")
		, director: getFromLocalStorage("director")
		, camera: getFromLocalStorage("camera")
		, description: ""
		, date: getTodayDate()
		, videoNotes: ""
		, audioNotes: ""
		, cameraDeadroll: false
		, messedUpLine: false
		, greatActing: false
		, badFocus: false
		, lockedOff: false
		, badCameraMovement: false
		, goodCameraMovement: false
		, circleTake: false
	};
}

function clearScriptSupNotes(obj) {
	obj.shotID = getFromLocalStorage("shotID");
	obj.videoNotes = "";
	obj.audioNotes = "";
	obj.cameraDeadroll = false;
	obj.messedUpLine = false;
	obj.greatActing = false;
	obj.badFocus = false;
	obj.lockedOff = false;
	obj.badCameraMovement = false;
	obj.goodCameraMovement = false;
	obj.circleTake = false;
}
/**
	get data from slate and push it into obj
	!! -- This could probably be optomized if the slate id's were the same as the obj keys -- !!
*/
function ingestSlateData(obj) {
	obj.card = $('#card').val();
	obj.sceneNumber = parseInt($('#sceneNumber').val());
	obj.shotLetter = $('#shotLetter').val();
	obj.shotLetter = $('#shotLetter').val();
	obj.take = parseInt($('#take').val());
	obj.productionName = $('#productionName').val();
	obj.productionCompany = $('#productionCompany').val();
	obj.director = $('#director').val();
	obj.camera = $('#camera').val();
	obj.description = $('#description').val();
	obj.date = $('#date').val();
}
//Takes the data from the data from the notes sections
function ingestScriptSupData(obj) {
	if ($('#videoNotes').val() == undefined) {
		obj.videoNotes = "No Notes"
	}
	else {
		obj.videoNotes = $('#videoNotes').val();
	}
	if ($('#audioNotes').val() == undefined) {
		obj.audioNotes = "No Notes"
	}
	else {
		obj.audioNotes = $('#audioNotes').val();
	}
	ingestCheckBoxData(obj);
}
/**
 * @ignore May be out of date.
 * Toggles the state of the tags
 */
function commonTagAdd(tagId) {
	if (tempfootageData[tagId] == false) {
		tempfootageData[tagId] = true;
		$("#" + tagId).addClass("selected");
	}
	else {
		tempfootageData[tagId] = false;
		$("#" + tagId).removeClass("selected");
	}
}
/**
 *	Matches checkboxes on page (with specific id's) with the same id in the object and marks it true or false.
 *	Specifically designed to work with the .pretty-Checkbox libaray
 */
function ingestCheckBoxData(obj) {
	console.log("ingesting Checkbox Data");
	var chkboxes = $('input[type="checkbox"]'); // array of all checkbox elements
	//console.log(chkboxes);
	//FOR EACH IN ARRAY
	for (var i = 0; i < chkboxes.length; i++) {
		//console.log($(chkboxes[i]).next(".state").children("label").attr("id"));
		//IF BOX is CHECKED
		if (chkboxes[i].checked) {
			//DO SOMETHING. Also can access the id of the label with: $(chkboxes[i]).next(".state").children("label").attr("id")
			//			obj[$(chkboxes[i]).next(".state").children("label").attr("id")] = true
			obj[$(chkboxes[i]).attr("id")] = true
		}
		else {
			//			obj[$(chkboxes[i]).next(".state").children("label").attr("id")] = false
			obj[$(chkboxes[i]).attr("id")] = false
		}
	}
}

function ingestAndSaveData(obj) {
	console.log(obj);
	ingestSlateData(obj);
	ingestScriptSupData(obj);
	addToLocalStorage("shots", obj); //push into local storage
	//	$('#finishShoot').attr('href', makeCSV("shots"));
}
// !! -- Serialize is not getting all the data -- !!
//serialize Function
(function ($) {
	$.fn.serializeFormJSON = function () {
		var o = {};
		var a = this.serializeArray();
		$.each(a, function () {
			if (o[this.name]) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			}
			else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};
})(jQuery);
// *********** View Controllers *********** //
function showQR(dimension, shotID) {
	//Remove QR code if there is one there, but keet any click events or other properties (i think)
	$('#qrcode1').empty();
	//Construct new QR code
	$('#qrcode1').qrcode({
		width: dimension
		, height: dimension
		, text: "" + shotID
	});
	//Display on page
	$("#qrcode1").css("height", dimension)
	$("#qrcode1").css("width", dimension)
	$('#qrcode1').show();
}

function hideQR() {
	$('#qrcode1').hide();
}

function callSlate(IDtoShow, timeOnScreen) {
	var qrDimention = getSmallestScreenDimention();
	//take 1/7 off the dimention so there can be a border.
	qrDimention = qrDimention - (qrDimention / 3);
	console.log("The qr should be this size: " + qrDimention);
	$("body").addClass('bg-white');
	showQR(qrDimention, IDtoShow);
	setTimeout(function () {
		$('#sriptSupPart').show();
		$("body").removeClass('bg-white');
		$('#qrcode1').hide();
	}, timeOnScreen);
	//hides slateForm
	$('#slatePart').hide();
}

function updateView(obj) {
	for (var key in obj) {
		//		console.log("#" + key);
		//		console.log(obj[key]);
		var sel = "#" + key;
		if (obj[key] === true) {
			$(sel).attr('checked', 'checked');
		}
		else if (obj[key] === false) {
			$(sel).removeAttr('checked');
		}
		else {
			$(sel).val(obj[key]);
//			$(sel).css("color", "red");
		}
	}
}
//funciton populateSlateFromModel(tempFootageData)
// *********** Click and Main Controller *********** //
$(document).ready(function () {
	$("#sriptSupPart").hide();
	var shotID = getShotID();
	var tempFootageData = clearTempFootageData();
	updateView(tempFootageData);
	$("#slateTop").click(function (event) {
		//detertimes where on the slate
		//		slateTopWidth = this.clientWidth;
		//		var currentMouseX = event.clientX;
		//		if ((slateTopWidth / 2) > currentMouseX) {
		//Take data from slate part and put into temp data
		ingestSlateData(tempFootageData);
		//takes info from user and puts into string Json Object
		//			var tempfootageStr = JSON.stringify($('#slateForm').serializeFormJSON());
		console.log(tempFootageData);
		//			console.log(tempfootageStr);
		//Gets the current Takenumber
		//			takeNum = parseInt($('#take').val());
		updateView(tempFootageData);
		callSlate(getShotID(), 1000);
		//		}
	});
	$("#sceneNumber, #shotLetter").change(function () {
		console.log("Noticed a Change");
		ingestSlateData(tempFootageData);
		tempFootageData.take = 1;
		tempFootageData.description = "";
		updateView(tempFootageData);
	});
	//Functionality if the user presses the decreae button
	$("#decrease").click(function (e) {
		e.preventDefault();
		//		takeNum = parseInt($('#take').val());
		//checks if the number is greater than 0 to stop negative numbers
		if (tempFootageData.take > 0) {
			tempFootageData.take--;
			updateView(tempFootageData);
			//			$('#take').val(takeNum);
		}
	});
	//Functionality if the user presses the increase button
	$("#increase").click(function (e) {
		e.preventDefault();
		//		if (isNaN(takeNum)) {
		//			takeNum = 1;
		//		}
		//		else {
		//			takeNum = parseInt($('#take').val());
		//			takeNum++;
		//		}
		//		ingestSlateData(tempFootageData);
		tempFootageData.take++;
		updateView(tempFootageData)
			//		$('#take').val(takeNum);
	});
	$("#backButton").click(function () {
		tempFootageData.shotID = getShotID();
		ingestAndSaveData(tempFootageData);
		localStorage.setItem("shotID", getShotID()+1);
		tempFootageData.take++;
		clearScriptSupNotes(tempFootageData);
		updateView(tempFootageData);
		//Brings back slateForm 
		$('#slatePart').show();
		$('#sriptSupPart').hide();
	});
	$("#finishShoot").click(function (e) {
		ingestAndSaveData(tempFootageData);
		makeCSV("shots");
	});
	$("#secondSticks").click(function () {
		$('#sriptSupPart').hide();
		callSlate(getShotID(), 3000);
		setTimeout(function () {
			updateView(tempFootageData);
			$('#sriptSupPart').show();
		}, 3000)
	});
	//	$("#callSlate").click(ingestCheckBoxData(tempFootageData));
}); // ends document.ready()
//Code picked up from various sources to hide addres bar
//var body = document.documentElement;
//if (body.requestFullscreen) {
//  body.requestFullscreen();
//} else if (body.webkitrequestFullscreen) {
//  body.webkitrequestFullscreen();
//} else if (body.mozrequestFullscreen) {
//  body.mozrequestFullscreen();
//} else if (body.msrequestFullscreen) {
//  body.msrequestFullscreen();
//}
//document.addEventListener("touchmove", function(e) { e.preventDefault() });