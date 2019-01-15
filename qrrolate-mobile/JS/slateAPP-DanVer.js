//Global Varibles
var takeNum; //Current take number for the shot, used to auto increment the take number
var takeNum;
var windowWidth;
var windowHeight;
var smallerDimension;
var dimension;
var refferenceNum;
var tempfootageData = {
	card: ""
	, sceneNumber: ""
	, shotLetter: ""
	, take: ""
	, productionName: ""
	, productionCompany: ""
	, director: ""
	, camera: ""
	, description: ""
	, date: ""
	, videoNotes: ""
	, audioNotes: ""
	, cameraDeadroll: false
	, messedUpLine: false
	, greatActing: false
	, badFocus: false
	, lockedOff: false
	, badCameraMovement: false
	, goodCameraMovement: false
	, circleTake: false };
//var fullData = [];
//fires function after certain interval of time
//window.setInterval(function () {
//	setDimensions();
//}, 100);
$(document).ready(function () {
	// make the form field font size as big as possible
	$('input').fitText();
	//sets the refference number on start up
	refferenceNum = 000001;
	SetDate();
	$('#sriptSupPart').hide();
	setDimensions();
	//Gets info from form and creats QR code  
	$("#slateTop").click(function (event) {
		//detertimes where on the slate
		slateTopWidth = this.clientWidth;
		var currentMouseX = event.clientX;
		if ((slateTopWidth / 2) > currentMouseX) {
			//Take data from slate part and put into temp data
			//            dataFromSlate();
			//takes info from user and puts into string Json Object
			var tempfootageStr = JSON.stringify($('#slateForm').serializeFormJSON());
			console.log(tempfootageData);
			console.log(tempfootageStr);
			//adds temp data to fulldata
			//            fullData.push({id: refferenceNum, data: tempfootageData});
			//Gets the current Takenumber
			takeNum = parseInt($('#take').val());
			//hides slateForm
			$('#slatePart').hide();
			callSlate();
			//Waits 1 second and then restores form
			setTimeout(function () {
				$('#sriptSupPart').show();
				$('#qrcode1').hide();
				refferenceNum++;
			}, 1000);
		}
		else {
			//hides slateForm
			$('#slatePart').hide();
			//creates QR Code
			$('#qrcode2').empty();
			$('#qrcode2').qrcode({
				width: dimension
				, height: dimension
				, text: "" + refferenceNum
			});
			$('#qrcode2').show();
			$("#qrcode2").click(function () {
				//Brings back slateForm 
				$('#slatePart').show();
				$('#qrcode2').hide();
			});
		}
	});
	//brings the slateForm back and stores data from AD info
	$("#backButton").click(function () {
		dataFromScriptSup();
		//Brings back slateForm 
		$('#slatePart').show();
		$('#sriptSupPart').hide();
		//Auto fills the take number with one higher than previous
		takeNum++;
		$('#take').val(takeNum);
	});
	$("#backButton").click(function () {
		var ADString = JSON.stringify($('#ADForm').serializeFormJSON());
		//Brings back slateForm 
		$('#slatePart').show();
		$('#sriptSupPart').hide();
		//Auto fills the take number with one higher than previous
		takeNum++;
		$('#take').val(takeNum);
	});
	//Auto Fills the date as curent day
	function SetDate() {
		//Gets date info
		var date = new Date();
		//Parses it to a useful format
		var day = date.getDate();
		var month = date.getMonth() + 1;
		var year = date.getFullYear();
		if (month < 10) month = "0" + month;
		if (day < 10) day = "0" + day;
		var today = month + "/" + day + "/" + year;
		//fills in the date input
		$('#date').val(today);
	}
	$("#date").click(function () {
		$('#date').attr('type', 'date');
	});
	$("#secondSticks").click(function () {
		$('#sriptSupPart').hide();
		callSlate();
		//Waits 1 second and then restores form
		setTimeout(function () {
			$('#sriptSupPart').show();
			$('#qrcode1').hide();
		}, 1000);
	});
	//Functionality if the user presses the decreae button
	$("#decrease").click(function (e) {
		e.preventDefault();
		takeNum = parseInt($('#take').val());
		//checks if the number is greater than 0 to stop negative numbers
		if (takeNum > 0) {
			takeNum--;
			$('#take').val(takeNum);
		}
	});
	//Functionality if the user presses the increase button
	$("#increase").click(function (e) {
		e.preventDefault();
		if (isNaN(takeNum)) {
			takeNum = 1;
		}
		else {
			takeNum = parseInt($('#take').val());
			takeNum++;
		}
		$('#take').val(takeNum);
	});
	$(".tagButton").click(function (e) {
		e.preventDefault();
		var tagId = $(this).attr('id');
		commonTagAdd(tagId);
	});
});
//Set the Dimensions of 
function setDimensions() {
	//sets the width of the stuff in App
	windowWidth = $(window.screen).width();
	windowHeight = $(window.screen).height();
	//determines which dimension is smaller
	if (windowHeight > windowWidth) {
		smallerDimension = windowWidth;
	}
	else {
		smallerDimension = windowHeight;
	}
	$('.slateTop').css('width', windowWidth);
	//Determines width of QRcode
	dimension = smallerDimension - (smallerDimension / 10);
}
//Clearss and creates QR code
function callSlate() {
	//creates QR Code
	$('#qrcode1').empty();
	$('#qrcode1').qrcode({
		width: dimension
		, height: dimension
		, text: "" + refferenceNum
	});
	$('#qrcode1').show();
}
//Fills in the data from the slate
function dataFromSlate() {
	tempfootageData.card = $('#card').val();
	tempfootageData.sceneNumber = $('#sceneNumber').val();
	tempfootageData.shotLetter = $('#shotLetter').val();
	tempfootageData.shotLetter = $('#shotLetter').val();
	tempfootageData.take = $('#take').val();
	tempfootageData.productionName = $('#productionName').val();
	tempfootageData.productionCompany = $('#productionCompany').val();
	tempfootageData.director = $('#director').val();
	tempfootageData.camera = $('#camera').val();
	tempfootageData.description = $('#description').val();
	tempfootageData.date = $('#date').val();
}
//Takes the data from the data from the notes sections
function dataFromScriptSup() {
	tempfootageData.videoNotes = $('#videoNotes').val();
	tempfootageData.audioNotes = $('#audioNotes').val();
}
//Toggles the state of the tags
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