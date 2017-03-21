var GWWOfflineTesting = true;

var GWWFileSavingDisabled;
disableSave();

var GWWFileOpeningDisabled;
enableOpen();


function disableSave(){
	var elem;
	elem = document.getElementById("navBar_Save");
	elem.disabled = true;
	elem.className = elem.className.replace("buttonEnabled","buttonDisabled");

	GWWFileSavingDisabled = true;
}
function enableSave(){
	var elem;
	elem = document.getElementById("navBar_Save");
	elem.disabled = false;
	elem.className = elem.className.replace("buttonDisabled","buttonEnabled");

	GWWFileSavingDisabled = false;
}

function disableOpen(){
	var elem;
	elem = document.getElementById("navBar_Open");
	elem.disabled = true;
	elem.className = elem.className.replace("buttonEnabled","buttonDisabled");

	GWWFileOpeningDisabled = true;
}
function enableOpen(){
	var elem;
	elem = document.getElementById("navBar_Open");
	elem.disabled = false;
	elem.className = elem.className.replace("buttonDisabled","buttonEnabled");

	GWWFileOpeningDisabled = false;
}
function adjustEditTextOKButton( event ){
	var titleTextarea = document.getElementById("title-textarea");
	var textarea = document.getElementById("textarea");
	var okButton = document.getElementById("textareaButton");
	if (textarea.value != "" && titleTextarea.value != ""){
		okButton.className = okButton.className.replace("operationButtonDisabled","operationButtonEnabled");
		okButton.disabled = false;
	} else {
		okButton.className = okButton.className.replace("operationButtonEnabled","operationButtonDisabled");
		okButton.disabled = true;
	}
}

/*

Each element in the array represents all the tokens in a given line of the text.
Within that array, each token is itself an array with the [ word_orig, "original", 
	challenge_1, type_of_challenge_1,
	challenge_2, type of challenge_2, etc.].


*/

var GWWChallengeEditMode = "single";
var GWWCurrentChallengeDefault = "";


var GWWTokenModel = [];
var GWWWordTokenModel = [];
var GWWTitle = "";
var GWWIntroText = "";
var GWWUniqueId = null;

var GWWCurrentTokenElement;
var GWWCurrentTokenInfo;
var GWWCurrentTokenInfoInitial;

var GWWCurrentKeyTokenElement;
var GWWCurrentKeyLineNumber;
var GWWCurrentKeyWordIndex;
var GWWCurrentKeyTokenIndex;
var GWWCurrentKeyChallengeIndex;

/*
var GWWCHALLENGE_WORD = 0;
var GWWCHALLENGE_TYPE = 1;
var GWWCHALLENGE_KEY = 2;
var GWWCHALLENGE_INDEX = 3;
var GWWCHALLENGE_NEEDEDKEY = 4;
var GWWCHALLENGE_DEPELEMENTS = 5;
*/

var GWWCHALLENGE_WORD = "word";
var GWWCHALLENGE_TYPE = "type";
var GWWCHALLENGE_KEY = "key" ;
var GWWCHALLENGE_INDEX = "index" ;
var GWWCHALLENGE_NEEDEDKEY = "needed" ;
var GWWCHALLENGE_DEPELEMENTS = "dependencies" ;

/*
var GWWKEY_LINE = 0;
var GWWKEY_WORD = 1;
var GWWKEY_TOKEN = 2;
var GWWKEY_CHALLENGEINDEX = 3;
*/
var GWWKEY_LINE = "line";
var GWWKEY_WORD = "word";
var GWWKEY_TOKEN = "token";
var GWWKEY_CHALLENGEINDEX = "challenge";



//--------------------------------------
//          KEY PRESS HANDLER
//--------------------------------------

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 37) {
        //console.log('Left was pressed');
        if (GWWCurrentTokenElement){
        	var id = GWWCurrentTokenElement.id;

        	//console.log("GWWCurrentTokenElement.id = " + id );

        	var lineIndex = modelLineIndexFromTokenElementId( id );
        	var tokenIndex = modelTokenIndexFromElementId( id );

        	var lineArray;
        	var tokensInLine;


        	if (tokenIndex > 0){
        		//can move left

        		var newTokenIndex = tokenIndex - 1;

        		var newTokenElementId = tokenId( lineIndex, newTokenIndex );
        		var newTokenElement = document.getElementById( newTokenElementId );
        		if (newTokenElement){
        			selectToken( newTokenElement );
        		}

        	} else if ( lineIndex > 0 ) {

        		var newLineIndex = lineIndex - 1;
        		
        		lineArray = GWWWordTokenModel[ newLineIndex ];
        		//lineArray = GWWTokenModel[ lineIndex ];

  		      	tokensInLine = lineArray.length;
  		      	tokenIndex = tokensInLine - 1;
  		      	var newTokenElementId = tokenId( newLineIndex, tokenIndex );
        		var newTokenElement = document.getElementById( newTokenElementId );
        		if (newTokenElement){
        			selectToken( newTokenElement );
        		}

        	} else {

        	}
        }
    }
    else if(event.keyCode == 39) {
       // console.log('Right was pressed');

        if (GWWCurrentTokenElement){

       		var id = GWWCurrentTokenElement.id;

        	var lineIndex = modelLineIndexFromTokenElementId( id );
        	var tokenIndex = modelTokenIndexFromElementId( id );

        	var lineArray;
        	var tokensInLine;
        
        	var linesInModel = GWWWordTokenModel.length;
        	//var linesInModel = GWWTokenModel.length;

        	var maxLineIndex = linesInModel - 1;

        	lineArray = GWWWordTokenModel[ lineIndex ];
        	//lineArray = GWWTokenModel[ lineIndex ];


  		    tokensInLine = lineArray.length;
  		    var maxTokenIndex = tokensInLine - 1;

        	if (tokenIndex < maxTokenIndex ){
        		//can move right

        		tokenIndex = tokenIndex + 1;

        		var newTokenElementId = tokenId( lineIndex, tokenIndex );
        	//	console.log("Want new id "+newTokenElementId);
        		var newTokenElement = document.getElementById( newTokenElementId );
        		if (newTokenElement){
        			selectToken( newTokenElement );
        		}
        	} else if ( lineIndex < maxLineIndex  ) {
        		lineIndex = lineIndex + 1;
  		      	tokenIndex = 0; //beginning of line
  		      	var newTokenElementId = tokenId( lineIndex, tokenIndex );
  		      //	console.log("Want new id "+newTokenElementId);
        		var newTokenElement = document.getElementById( newTokenElementId );
        		if (newTokenElement){
        			selectToken( newTokenElement );
        		}

        	} else {
        		//console.log("can't move right");
        	}



        	

 		}


    } else if (event.keyCode == 27){
    	//escape
    	//console.log("escape key pressed");
    	//cancelEditBox();
    	okEditBox();

    }
});


//--------------------------------------
//            TOKEN CONTROL
//--------------------------------------

function tokenClick( event ){
	selectToken( event.target );
}
function selectToken( tokenElement ){

	if (tokenElement == null){ 
		return; 
	}

	var counter = 0;
	var i,j = 0;
	
	var tokens;
	var thisToken;
	var matchCounter;
	var unmatchCounter;

	var lineIndex;
	var tokenIndex;

	var rect = tokenElement.getBoundingClientRect();
	//console.log("T:"+rect.top+"  R:"+rect.right+"  B:"+rect.bottom+"  L:"+rect.left);

	

	if (tokenElement === GWWCurrentTokenElement ){
		cancelEditBox();
	} else {

		clearSelectedToken();

		GWWCurrentTokenElement = tokenElement;
		updateTokenAppearance( tokenElement );


		//Lookup record for this token **in the model**

		var token =  tokenForElementId( tokenElement.id );
		var original = token[0];
		var word = original[ GWWCHALLENGE_WORD ];

		removeEditBox()

		if ( punctuationInToken(word) === false && !(/\s+/.test(word)) ){

			//set up for editing challenges

			var tokenDiv = document.getElementById("tokens");
			var newEditBox = buildEditBox( rect, token );
			tokenDiv.appendChild( newEditBox );	

			GWWCurrentTokenInfo = token;
			GWWCurrentTokenInfoInitial = token;

			var editBoxInput = document.getElementById("editBoxInput");
			if (editBoxInput){
				editBoxInput.focus();
			}
		}	
	}
}

function tokenForElementId( id ){
	//Token id's are built as "token_" + line number + "_" + token number
	//numbers are 0 indexed

	var lineIndex = modelLineIndexFromTokenElementId( id );
	var tokenIndex = modelTokenIndexFromElementId( id );
	//console.log("TOKENFORLEMENTID lineIndex "+ lineIndex + " tokenIndex " + tokenIndex);

	//lineIndex and tokenIndex point to array in GWWWordTokenModel

	//console.log("GWWWordTokenModel.length " + GWWWordTokenModel.length);
	var x = GWWWordTokenModel[lineIndex];
	//console.log("   x.length "+ x.length);

	var tokenModelInfo = GWWWordTokenModel[lineIndex][tokenIndex];
	var tokenModelLineIndex = tokenModelInfo[0];
	var tokenModelTokenIndex = tokenModelInfo[1];
	//	console.log("TOKENFORLEMENTID tokenModelLineIndex "+ tokenModelLineIndex + " tokenModelTokenIndex " + tokenModelTokenIndex);

	//return GWWTokenModel[lineIndex][tokenIndex];
	return GWWTokenModel[tokenModelLineIndex][tokenModelTokenIndex];
}

function modelLineIndexFromTokenElementId( id ){
	var lineIndexPattern = /_[0-9]+_/;
	var lineIndex;

	var match = id.match(lineIndexPattern);
	match = match[0].match(/[0-9]+/);
	lineIndex = match[0]

	return parseInt(lineIndex);
}

function modelTokenIndexFromElementId( id ){
	var tokenIndex;
	var tokenIndexPattern = /[0-9]+$/;
	match = id.match(tokenIndexPattern);
	tokenIndex = match[0]

	return parseInt(tokenIndex);
}




//--------------------------------------
//               EDITING
//--------------------------------------

function buildEditBox( rect, tokenInfo ){

	var box = document.createElement("P");
	box.className = "editbox ";
	box.id = "editbox";
	box.style = "left: " + (rect.right+4) +"px; top: "+rect.top+"px;";

	

	var editModeLabel = document.createElement("P");
	editModeLabel.id = "editModeLabel";
	box.appendChild(editModeLabel);
	if (GWWChallengeEditMode === "single"){
		box.className += "singleEditMode";
		editModeLabel.innerHTML = "Single Mode<br>";
	} else {
		box.className += "globalEditMode";
		editModeLabel.innerHTML = "Global Mode<br>";
	}


	//ADD THE EDITABLE FIELDS FOR A NEW CHALLENGE

	var newChallenge = createNewChallengeForm();
	newChallenge.setAttribute("onSubmit","return false;");
	box.appendChild(newChallenge);


	//ADD THE LIST OF EXISTING CHALLENGES

	var existingChallengesDiv = createExistingChallengeDivForToken( tokenInfo );
	box.appendChild(existingChallengesDiv);

	

	//ADD BUTTON TO CLOSE EDIT BOX

	var okButton = document.createElement("INPUT");
	okButton.type = "button"
	okButton.onclick = function(){
		//console.log("okButton.onclick");
		okEditBox();
	}
	okButton.id = "okButtonEditBox";
	okButton.className = "editBoxButton bottomRight";
	okButton.setAttribute("value","Done");
	box.appendChild(okButton);

	return box;
}

function createExistingChallengeDivForToken( tokenInfo ){

	var existingChallengesDiv = document.createElement("DIV");
	existingChallengesDiv.id = "existingChallengesDiv";

	var wordsForToken = tokenInfo.length;
	//console.log("wordsForToken = " + wordsForToken);
	if (wordsForToken > 1){
		//a challenge has already been entered for this word
		//list the existing challenges and types in the box

		//start counting at 1 becuase tokenInfo[0] is the original word
		for (var i=1; i<wordsForToken; i++){

			var challenge = tokenInfo[i];

			var challengeWord = challenge[ GWWCHALLENGE_WORD ];
			var challengeType = challenge[ GWWCHALLENGE_TYPE ];
			var challengeKey = challenge[ GWWCHALLENGE_KEY ];
			var challengeIndex = challenge[ GWWCHALLENGE_INDEX ]; //this is a unique value given to
																//each challenge for a token when 
																//it is created; it has nothing to
																//do with the position of the challenge
																//in the list
			var challengeNeededKey = challenge[ GWWCHALLENGE_NEEDEDKEY ];
			var challengeDepElements = challenge[ GWWCHALLENGE_DEPELEMENTS ];

			if ( typeof challengeIndex === "undefined"){
				challengeIndex = 0;
			}

			if ( typeof challengeKey === "undefined" ){
				challengeKey = false;
			}


			var para = document.createElement("P");
			para.id = "existingChallenge_para";
			para.className = "existingChallengeInEditBox"


			// KEY CHALLENGE CHECKBOX
			
			var keyRadio = document.createElement("INPUT");
			keyRadio.type = "checkbox";
			keyRadio.id = "keyChallengeRadio_" + challengeIndex;
			//keyRadio.value = i;
			if (challengeKey != true ){
				//keyRadio.disabled = true;
				keyRadio.setAttribute("disabled","true");
				keyRadio.style.visibility = "hidden";
			} else {
				//this challenge is a potential key challenge and could currently be set,
				//see we need to check for that and reflect it in the status of the checkbox
				if ( GWWCurrentTokenElement ===   GWWCurrentKeyTokenElement &&
				 challengeIndex === GWWCurrentKeyChallengeIndex){
					keyRadio.checked = true;
				}
			}
			keyRadio.onclick = function( event ){

				//console.log("radio click "+event.target.id );
				//Make sure only one key is active !!!!!

				if (  event.target.getAttribute("disabled") === "true"){
					return;
				} else {

					//console.log("radio enabled")
					
					if (event.target.checked === true ){
						//find the other radio buttons and uncheck them
						var existingChallengesDiv = document.getElementById("existingChallengesDiv");
						var inputElements;
						if ( existingChallengesDiv != null ){
							inputElements = existingChallengesDiv.getElementsByTagName("INPUT");
						}
						
						for (var j=0; j < inputElements.length; j++){
							var element = inputElements[ j ];
							var id = element.id;

							//console.log( "DEBUG "+id);
							
							if ( id.includes("keyChallengeRadio") && (id != event.target.id ) ){
							//	console.log( id );
								element.checked = false;
							}
						}


						//If a key is set, change it's style to indicate unset
						if (GWWCurrentKeyTokenElement != null )
						{

							var oldKeyTokenElement = GWWCurrentKeyTokenElement;
							clearKeyChallenge()  //Unset the pointer
							updateTokenAppearance( oldKeyTokenElement );
						}

						// update info about current key

						GWWCurrentKeyTokenElement = GWWCurrentTokenElement; //set it to this element

						GWWCurrentKeyLineNumber = modelLineIndexFromTokenElementId( GWWCurrentTokenElement.id );
						GWWCurrentKeyWordIndex = modelTokenIndexFromElementId( GWWCurrentTokenElement.id );
						

						var thisTokenIndex = GWWCurrentTokenElement.getAttribute("data-goojaji-tokenindex");
						// console.log( "thisTokenIndex = "+thisTokenIndex);
						GWWCurrentKeyTokenIndex = parseInt( thisTokenIndex );

						updateTokenAppearance( GWWCurrentKeyTokenElement );

						



						// parse out challenge index value
						//this function is called when
						//the "key" checkbox beside a challenge is clicked.  So the target of the
						//event is the checkbox and the id of these boxes is "keyChallengeRadio_" +
						//the unique challenge index of the associated challenge.  This is 
						//what we are recovering here.

						var indexPattern = /[0-9]+$/;  //string of digits at end
						var match = event.target.id.match(indexPattern); 
						var indexString = match[0]
						GWWCurrentKeyChallengeIndex = parseInt( indexString );




						var challengeInfo = tokenForElementId( GWWCurrentKeyTokenElement.id );
						var challengeWord = "";
						for (var k=1;k<challengeInfo.length;k++){
							var info = challengeInfo[k];
							var index = info[ GWWCHALLENGE_INDEX];
							if (index === GWWCurrentKeyChallengeIndex){
								//this is the One
								challengeWord = info[ GWWCHALLENGE_WORD ];
							}
						}


						
						setTextDisplayedByElement( challengeWord, GWWCurrentKeyTokenElement);

						console.log("key SET: l="+GWWCurrentKeyLineNumber+", t="+GWWCurrentKeyTokenIndex+", w="+GWWCurrentKeyWordIndex+", c="+GWWCurrentKeyChallengeIndex);

					} else {
						//Key has been unchecked
						var oldKeyTokenElement = GWWCurrentKeyTokenElement;
						clearKeyChallenge()
						updateTokenAppearance( oldKeyTokenElement ); 
						
					}
				}
			}
			para.appendChild(keyRadio);



			// LABEL FOR CHALLENGE

			var challengeNeededKeyDescription = "";
			if ( isNotAnEmptyKey( challengeNeededKey ) ){
				challengeNeededKeyDescription = ", ";
				challengeNeededKeyDescription = challengeNeededKeyDescription + stringDescribingChallengeNeeded( challengeNeededKey );
			}

			var challengeLabel = document.createElement("LABEL");
			var labelText = challengeWord + " (<em>" + challengeType +", "+challengeIndex+challengeNeededKeyDescription+"</em>) ";	
			challengeLabel.innerHTML = labelText;
			challengeLabel.setAttribute("for", keyRadio.id);
			para.appendChild( challengeLabel );



			//DELETE CHALLENGE BUTTON

			var butt = document.createElement("INPUT");
			butt.type = "button";
			// butt.id = i - 1;
			butt.id = i;
			butt.value = "X";
			butt.onclick = function(){
				//console.log("want to delete for butt.id = " + this.id);

				//remove this challenge. the butt.id is the position of this 
				//item in the list stored in the token info (where the items are zero indexed)
					
				//NOTE USE OF THIS: JS does not have upvalues like Lua or self like obj-c
				// "this" is the object on which this listener has been set and you
				//access its properties with this.

				//The splice() method: add/remove from array
				// splice( index, howmany, optionalItem1, optionalItem2, ...)
				// remove howmany items from array starting at index (zero indexing) and
				// put optional items in place

				// could also have event as the argumnet of this function and use
				// event.target.id


				var indexOfThisChallengeInTokenInfoList = parseInt( this.id );

				var challenge = GWWCurrentTokenInfo[ indexOfThisChallengeInTokenInfoList ];
				var challengeWord = challenge[ GWWCHALLENGE_WORD ];
				var challengeType = challenge[ GWWCHALLENGE_TYPE ];
				var challengeKey = challenge[ GWWCHALLENGE_KEY ];
				var challengeIndex = challenge[ GWWCHALLENGE_INDEX ]; //the unique list-independant
																	//id of this challenge
				var challengeNeededKey = challenge[ GWWCHALLENGE_NEEDEDKEY ];
				var dependantElements = challenge[ GWWCHALLENGE_DEPELEMENTS ];



				if (GWWCurrentKeyTokenElement === GWWCurrentTokenElement &&
					GWWCurrentKeyChallengeIndex === challengeIndex)
				{
					// this challenge, which is being deleted, was the reason this
					// token was showing as the key, so this unsets the key token
					clearKeyChallenge();
				}

				deleteChallenge( GWWCurrentTokenElement, challengeIndex )

				if (challengeKey === true)
				{
					alert("still need to implement deleted a key");
				}
				


				//get rid of the list of challenges
				var existingChallengesDiv = document.getElementById("existingChallengesDiv");
				if (existingChallengesDiv){
					existingChallengesDiv.remove();
				}

				//rebuild the list of the challenges to include the new info
				existingChallengesDiv = createExistingChallengeDivForToken(tokenInfo);
				var editbox = document.getElementById("editbox");
				if (editbox && existingChallengesDiv){
					editbox.appendChild(existingChallengesDiv);
				}

				updateTokenAppearance( GWWCurrentTokenElement );


			}
			para.appendChild(butt);


			existingChallengesDiv.appendChild(para);
		}
	}

	return existingChallengesDiv;
}




function deleteChallenge( element, indexOfChallengeToDelete )
{
	console.log("in deleteChallenge deleting "+ indexOfChallengeToDelete );

	var token = tokenForElementId( element.id );  //gets the info about this from the model

	if (token === null){
		alert("Element with challenge to delete not found.");
		return false;
	}

	//Find the challenge
	var indexOfThisChallengeInTokenInfoList = null;
	var challengeBeingDeleted = null;
	for (var i=1; i<token.length; i++)
	{
		var thisChallenge = token[i];
		var thisChallengeIndex = thisChallenge[ GWWCHALLENGE_INDEX ];
		if (thisChallengeIndex === indexOfChallengeToDelete  ){
			challengeBeingDeleted = thisChallenge;
			indexOfThisChallengeInTokenInfoList = i;
			//console.log("it's item "+i+" in the challenge list");
			break;
		}// else {
			//console.log("it's not "+thisChallengeIndex );
		//}
	}

	if (challengeBeingDeleted != null){

		var lineOfChallengeBeingDeleted = modelLineIndexFromTokenElementId( element.id );
		var wordIndexOfChallengeBeingDeleted = modelTokenIndexFromElementId( element.id );
		// this and the indexOfChallengeToDelete are the parameters that identify this
		// challenge


		var dependencies = challengeBeingDeleted[ GWWCHALLENGE_DEPELEMENTS ];
		for (var i=0; i < dependencies.length; i++){
			var depElement = dependencies[ i ];

			//In the challenges for this element, find and delete all that are
			//have this challenge as their "needed key"

			var depTokenInfo = tokenForElementId( depElement.id );
			for (var j=1; j < depTokenInfo.length; j++){
				var challenge = depTokenInfo[ j ];
				if ( isNotAnEmptyKey( challenge[ GWWCHALLENGE_NEEDEDKEY ])){
					var neededKey = challenge[ GWWCHALLENGE_NEEDEDKEY ];


					if ( lineOfChallengeBeingDeleted === neededKey[ GWWKEY_LINE ] &&
						 wordIndexOfChallengeBeingDeleted === neededKey[ GWWKEY_WORD ] &&
						 indexOfChallengeToDelete === neededKey[ GWWKEY_CHALLENGEINDEX ] ){

						//The needed key of this challenge is the challenge being deleted,
						//so delete this challenge too ... RECURSION HAPPENS!

						deleteChallenge( depElement, challenge[ GWWCHALLENGE_INDEX ]);
					}
				}
			}
		}
	}




	if (indexOfThisChallengeInTokenInfoList != null){
		token.splice(  indexOfThisChallengeInTokenInfoList , 1);
	}
	/*

	if (challengeToDelete != null){

		

		var dependantElements = challengeToDelete[ GWWCHALLENGE_DEPELEMENTS ];
		if (dependantElements.length > 0 ){
			alert("other challenges were defined with this as a key");
		}
	}
	*/

	return true;

}





function clearKeyChallenge(){

	var token = tokenForElementId( GWWCurrentKeyTokenElement.id );
	var original = token[0];
	var word = original[ GWWCHALLENGE_WORD ];

	setTextDisplayedByElement( word, GWWCurrentKeyTokenElement);

	GWWCurrentKeyTokenIndex = null;
	GWWCurrentKeyChallengeIndex = null;
	GWWCurrentKeyWordIndex = null;
	GWWCurrentKeyLineNumber = null;
	GWWCurrentKeyTokenElement = null;
}

function createNewChallengeForm()
{

	var newChallengeForm = document.createElement("FORM");
	//newChallengeForm.setAttribute("onSubmit","submitChallenge( event ); return false;");
	

	var challengeInput = document.createElement("INPUT");
	challengeInput.type = "text";
	challengeInput.id = "editBoxInput";
	challengeInput.className = "challengeBoxText editBoxText";
	newChallengeForm.appendChild(challengeInput);


	//SELECT WIDGET FOR TYPE OF CHALLENGE
	//    Set to type of last entered challenge or default (value of option0)

	var editBoxSelect = document.createElement("SELECT");
	editBoxSelect.id = "editBoxSelect";
	editBoxSelect.className = "challengeBoxSelect editBoxText";

	var option0 = document.createElement("OPTION");
	option0.value = "Silly";
	option0.innerHTML = option0.value;
	option0.className = "editBoxText";
	editBoxSelect.appendChild(option0);

	var option1 = document.createElement("OPTION");
	option1.value = "Tricky";
	option1.innerHTML = option1.value;
	option1.className = "editBoxText";
	editBoxSelect.appendChild(option1);


	if (GWWCurrentChallengeDefault === ""){
		editBoxSelect.value = option0.value;
	} else {
		editBoxSelect.value = GWWCurrentChallengeDefault;
	}

	newChallengeForm.appendChild(editBoxSelect);


	// IS A KEY TO DOWNSTREAM CHALLENGES
	var keyButton = document.createElement("INPUT");
	keyButton.type = "checkbox";
	keyButton.name = "keyChallenge"
	keyButton.id = "editBoxKeyCheckbox";
	keyButton.setAttribute("innerHTML","Key");
	keyButton.setAttribute("value","true");
	newChallengeForm.appendChild(keyButton);

	var keyButtonLabel = document.createElement("LABEL");
	keyButtonLabel.innerHTML = "Key   ";
	keyButtonLabel.setAttribute("for","editBoxKeyCheckbox"); //bind this to the radio button
	newChallengeForm.appendChild(keyButtonLabel);



	// ENTER BUTTON

	var okButton = document.createElement("INPUT");
	//okButton.type = "submit"
	okButton.type = "button";
	okButton.id = "okButtonEditBox";
	//okButton.className = "editBoxButton";
	okButton.onclick = function(){
		submitChallenge();
		return false;
	}
	okButton.setAttribute("value","Enter");
	newChallengeForm.appendChild(okButton);


	return newChallengeForm;
}

function cancelEditBox()
{

	okEditBox();
}

function okEditBox()
{

	removeEditBox();
	clearSelectedToken();
}

function clearSelectedToken(){
	var oldSelectedToken = GWWCurrentTokenElement;
	GWWCurrentTokenElement = null;
	GWWCurrentTokenInfo = null;
	
	if (oldSelectedToken)
	{

		updateTokenAppearance(  oldSelectedToken );
	}

}

function stringDescribingChallengeNeeded( t ){

	if (t === null){
		return "NO KEY";
	}

	var result = "{";
	result = result + t[ GWWKEY_LINE ] + ",";
	result = result + t[ GWWKEY_WORD ] + ",";
	result = result + t[ GWWKEY_TOKEN ] + ",";
	result = result + t[ GWWKEY_CHALLENGEINDEX ] + "}";
	return result;

}

function submitChallenge( event ){

		var challengeWord = "";
		var challengeType = "";
		var challengeKey = "?";
		var challengeIndex = 0;
		var challengeNeededKey = []; //check value of property GWWKEY_LINE
		var challengeNeededKeyDescription = "";
		var challengeDepElements = [];


		var keyLine = "";
		var keyWord = "";
		var keyToken = "";
		var keyChallenge = "";
	

		var tokenDiv = document.getElementById("tokens");

		//Get the value submitted
		var editBoxInput = document.getElementById("editBoxInput");
		if (editBoxInput){
			challengeWord = editBoxInput.value;

			var originalWord = GWWCurrentTokenInfo[0][ GWWCHALLENGE_WORD ];

			//If the box was blank OR value was the same as the original word, skip the rest of the function.
			if (challengeWord === "" || challengeWord === originalWord){
				editBoxInput.focus();
				editBoxInput.value = "";
				return;
			}

			//Clear the text entry box and return focus there
			editBoxInput.value = "";
			editBoxInput.focus();
		}

		//Get the type and clear the selector
		var editBoxSelect = document.getElementById("editBoxSelect");
		if (editBoxSelect)
		{
			challengeType = editBoxSelect.value;

			GWWCurrentChallengeDefault = challengeType;

			//var options = editBoxSelect.options;
			//editBoxSelect.value = options[0].text;
		}

		//determine whether this CAN be selected as a key for challenges to be added subsequently
		//downstream (after this token)
		var editBoxKeyCheckbox = document.getElementById("editBoxKeyCheckbox")
		if (editBoxKeyCheckbox)
		{
			var challengeKeyChecked = false;
			challengeKeyChecked = editBoxKeyCheckbox.checked;
			challengeKey = challengeKeyChecked;

			//set to false
			editBoxKeyCheckbox.checked = false;
		}

		if (GWWCurrentKeyTokenElement != null){

			var lineOfTokenOfTheSubmittedChallenge = modelLineIndexFromTokenElementId( GWWCurrentTokenElement.id );
			var tokenIndexOfTokenOfSubmittedChallenge = modelTokenIndexFromElementId( GWWCurrentTokenElement.id );

			console.log( lineOfTokenOfTheSubmittedChallenge, GWWCurrentKeyLineNumber,
				tokenIndexOfTokenOfSubmittedChallenge, GWWCurrentKeyWordIndex);


			if ( lineOfTokenOfTheSubmittedChallenge < GWWCurrentKeyLineNumber ||
				( lineOfTokenOfTheSubmittedChallenge === GWWCurrentKeyLineNumber && 
					tokenIndexOfTokenOfSubmittedChallenge <= GWWCurrentKeyWordIndex )
				)
			{
				alert("challenges cannot depend on downstream challenges; key ignored");

			} else {

				// The selected KEY must have been selected by the player for this
				// new challenge (the one that has been submitted) to be offered as
				// a choice.

				challengeNeededKey = [];

				challengeNeededKey[ GWWKEY_LINE ] = GWWCurrentKeyLineNumber;
				challengeNeededKey[ GWWKEY_WORD ] = GWWCurrentKeyWordIndex;
				challengeNeededKey[ GWWKEY_TOKEN ] = GWWCurrentKeyTokenIndex;
				challengeNeededKey[ GWWKEY_CHALLENGEINDEX ] = GWWCurrentKeyChallengeIndex;

				challengeNeededKeyDescription = stringDescribingChallengeNeeded( challengeNeededKey );

			}
		}



		// -----------------------------------
		// IS IDENTICAL TO EXISTING CHALLENGE?
		// -----------------------------------

		//Compare challenge to any existing challenges to prevent duplicates
		//Determine highest index value for existing challenges so new challenge
		//  can be indexed to this value plus 1


		var highestExistingChallengeIndex = 0;
		var wordsForToken = GWWCurrentTokenInfo.length;
		if (wordsForToken > 1){

			//This word has existing challenges
			for (var i=1; i<wordsForToken; i++){
				var challenge = GWWCurrentTokenInfo[i];

				var existingChallengeWord = challenge[ GWWCHALLENGE_WORD ];
				var existingChallengeType = challenge[ GWWCHALLENGE_TYPE ];
				var existingChallengeKey = challenge[ GWWCHALLENGE_KEY ];
				var existingChallengeIndex = challenge[ GWWCHALLENGE_INDEX ];
				var existingChallengeNeededKey = challenge[ GWWCHALLENGE_NEEDEDKEY ];
				var existingChallengeDepElements = challenge[ GWWCHALLENGE_DEPELEMENTS ];


				if ( typeof existingChallengeIndex != "undefined" &&
				 existingChallengeIndex > highestExistingChallengeIndex ){
					highestExistingChallengeIndex = existingChallengeIndex;
				}

				// Compare all features of challenge	

				var keyStatusSame = false; //can be a key?

				if (typeof existingChallengeKey != "undefined" &&
					existingChallengeKey === challengeKey){
					keyStatusSame = true;
				}


				var keyDependanceSame = false;
				//var keyDependanceSame = true;
				//console.log("challengeNeededKey "+challengeNeededKey+" existingChallengeNeededKey "+existingChallengeNeededKey);
				if ( isNotAnEmptyKey( challengeNeededKey )  && isNotAnEmptyKey( existingChallengeNeededKey) )
				{
					if ( challengeNeededKey[GWWKEY_WORD] === existingChallengeNeededKey[GWWKEY_WORD] &&
						challengeNeededKey[GWWKEY_LINE] === existingChallengeNeededKey[GWWKEY_LINE] &&
						challengeNeededKey[GWWKEY_TOKEN] === existingChallengeNeededKey[GWWKEY_TOKEN] &&
						challengeNeededKey[GWWKEY_CHALLENGEINDEX] === existingChallengeNeededKey[GWWKEY_CHALLENGEINDEX] 
						)
					{
						keyDependanceSame = true;
					}		
				}
				if ( isNotAnEmptyKey( challengeNeededKey ) === false  && isNotAnEmptyKey( existingChallengeNeededKey) === false ){
					keyDependanceSame = true;
				}



				if (existingChallengeWord === challengeWord && 
					existingChallengeType === challengeType &&
					keyStatusSame === true &&
					keyDependanceSame === true ){

					//This is an exact duplicate of an existing challenge.  Reject submission and return.

					alert("Submitted challenge identical to existing challenge. Discarding submission.");

					editBoxInput.focus();
					editBoxInput.value = "";

					editBoxKeyCheckbox.checked = false;

					return;
				}
			}

		}

		//*********************************************************
		//         If we get here, this is a new challenge.
		//*********************************************************

		challengeIndex = highestExistingChallengeIndex + 1;


		//If this new challenge depends on a key, we need to tell the key
		//about that dependency so that, if it is deleted, the deletion routine
		//cannot also delete this challenge.

		if ( isNotAnEmptyKey( challengeNeededKey ) ){

			var keyInfo = tokenForElementId( GWWCurrentKeyTokenElement.id );

			for (var j=1; j<keyInfo.length; j++){
				var challenge = keyInfo[j];

				var indexOfThisChallenge = challenge[ GWWCHALLENGE_INDEX ];		
				if ( indexOfThisChallenge === GWWCurrentKeyChallengeIndex){
					//this is the challenge we want
					console.log( "logging dependence of "+GWWCurrentTokenElement+" on challenge index "+challengeIndex);

					var dependantTokens = challenge[ GWWCHALLENGE_DEPELEMENTS ];
					dependantTokens.push( GWWCurrentTokenElement );
					console.log( challenge[ GWWCHALLENGE_DEPELEMENTS ].length );
				}
			}

		}

		if (GWWChallengeEditMode === "single")
		{

			//Add the new challenge to the model
			if (GWWCurrentTokenInfo){
				var newChallenge = [];
				newChallenge[ GWWCHALLENGE_WORD ] = challengeWord;
				newChallenge[ GWWCHALLENGE_TYPE ] = challengeType;
				newChallenge[ GWWCHALLENGE_KEY ] = challengeKey;
				newChallenge[ GWWCHALLENGE_INDEX ] = challengeIndex;
				newChallenge[ GWWCHALLENGE_NEEDEDKEY ] = challengeNeededKey;
				newChallenge[ GWWCHALLENGE_DEPELEMENTS ] = []; //it's new, so it can't have dependent challenges yet.
				GWWCurrentTokenInfo.push(newChallenge);
			}
		} else 
		{

			alert("global editing not yet implemented with proper indexing of challenges");

/*
			for (var i=0; i < GWWTokenModel.length; i++){
				var line = GWWTokenModel[i];
				for (var j = 0; j < line.length; j++){
					var token = line[j];
					var tokenWord = token[0][0];
					if (tokenWord === originalWord){

						//Need to determine highest challenge index for this token's existing challenges

						var newChallenge = [ challengeWord, challengeType, challengeKey, challengeIndex ];
						token.push( newChallenge );
					}
				}
			}
			updateAppearanceOfAllTokenElements();

			*/
		}



		//Remove the existing set of challenges
		var existingChallengesDiv = document.getElementById("existingChallengesDiv");
		if (existingChallengesDiv){
			existingChallengesDiv.remove();
		}

		//Rebuild the list of challenges to include the new one
		existingChallengesDiv = createExistingChallengeDivForToken(GWWCurrentTokenInfo);
		var editbox = document.getElementById("editbox");
		if (editbox && existingChallengesDiv){
			editbox.appendChild(existingChallengesDiv);
		}


		if (GWWChallengeEditMode === "single"){
			updateTokenAppearance(  GWWCurrentTokenElement );
		} else {
			updateAppearanceOfAllTokenElements();
		}
}

function isNotAnEmptyKey( challengeObject ){
	var result = false;
	if ( challengeObject[ GWWKEY_LINE ] != null ){
		result = true;
	} 
	return result;
}

function removeEditBox(){
	var oldBox = document.getElementById("editbox");
	var tokenDiv = document.getElementById("tokens");
	if (oldBox){
		tokenDiv.removeChild(oldBox);
	}
}


function updateTokenAppearance( tokenElement ){
	
	if (tokenElement == null){ return; }

	var tokenInfo = tokenForElementId( tokenElement.id )
	if ( tokenInfo){

		// ---------------
		// HAS CHALLENGES?
		// ---------------

		if ( tokenInfo.length > 1)
		{
			if (tokenElement.className.match("tokenHasChallenges") === null ){
				tokenElement.className = tokenElement.className + " tokenHasChallenges";
			}

			//Set tooltip text to list of challenges for this token
			//Speed at which tooltip appears is browser dependant and cannot
			//be set in JS
			var title = "";
			var nChallenges = tokenInfo.length - 1;
			var maxChallengeIndex = tokenInfo.length - 1;
			for (var i = 1; i <= maxChallengeIndex; i++){
				var challengeInfo = tokenInfo[i];
				var challengeWord = challengeInfo[0];
				title = title + challengeWord;
				if (nChallenges > 1 && i < maxChallengeIndex ){
					title = title + ", ";
				}
			}
			tokenElement.setAttribute("title",title);
		} else
		{

			tokenElement.className = tokenElement.className.replace(" tokenHasChallenges","");
		}

	}


	// -----------------
	// IS KEY CHALLENGE?
	// -----------------


	var thisElementIsClicked = false;
	var thisElementIsKeyChallenge = false;

	if (GWWCurrentTokenElement != null &&
		tokenElement === GWWCurrentTokenElement)
	{
		thisElementIsClicked = true;
	}

	if (GWWCurrentKeyTokenElement != null &&
		tokenElement === GWWCurrentKeyTokenElement)
	{
		thisElementIsKeyChallenge = true;
	}

	var tokenClassRegexPattern = /token_\w+/ ;

	if (thisElementIsKeyChallenge === true && thisElementIsClicked === true)
	{
		tokenElement.className = tokenElement.className.replace( tokenClassRegexPattern, "token_clickedKey" );
	}

	if (thisElementIsKeyChallenge === true && thisElementIsClicked === false)
	{
		tokenElement.className = tokenElement.className.replace( tokenClassRegexPattern, "token_unclickedKey" );
	}

	if (thisElementIsKeyChallenge === false && thisElementIsClicked === true)
	{
		tokenElement.className = tokenElement.className.replace( tokenClassRegexPattern, "token_clicked" );
	}

	if (thisElementIsKeyChallenge === false && thisElementIsClicked === false)
	{
		tokenElement.className = tokenElement.className.replace( tokenClassRegexPattern, "token_neutral" );
	}

}

function updateAppearanceOfAllTokenElements(){
	var buttonElements = document.getElementsByTagName("button");
	for (var j = 0; j < buttonElements.length; j++){
		var element = buttonElements[j];
		var id = element.id;
		if (id.includes("token")){
			updateTokenAppearance( element );
		}
	}
}



function handleNewRawText(){

	GWWTokenModel = []; //reinitialize to empty array because NEW text
	GWWWordTokenModel = [];
	GWWTitle = "";
	GWWIntroText = "";
	GWWUniqueId = null;


	var i,j,k = 0;
	var lineIndex = 0;
	var wordModelLineIndex = 0;

	var buttonElements;
	
	var newText;
	var lines;
	
	var token;
	var tokens;

	var lineDiv;
	var elem;

	var node;
	var textnode;

	//GET TITLE FROM TITLE-TEXTAREA ELEMENT AND DISPLAY
	GWWTitle = document.getElementById("title-textarea").value;
	var titleDiv = document.getElementById("textTitleDiv");
	if (titleDiv){
		titleDiv.innerHTML = GWWTitle;
		titleDiv.className = titleDiv.className.replace("hidden","visible");
	}

	//GET INTRO TEXT FROM INTRO-TEXTAREA ELEMENT AND DISPLAY
	GWWIntroText = document.getElementById("intro-textarea").value;
	var introDiv = document.getElementById("textIntroDiv");
	if (introDiv){
		introDiv.className = introDiv.className.replace("hidden","visible");
	}
	var introEmDiv = document.getElementById("textIntroEm");
	if (introEmDiv){
		introEmDiv.innerHTML = GWWIntroText;
	}


	//GET NEW TEXT FROM TEXTAREA ELEMENT
	newText = document.getElementById("textarea").value;
	if (newText === ""){
		return;
	}
	lines = newText.split("\n");

	console.log("new text contains " + lines.length + " lines");



	//Remove empty lines at **end** of text
	while( lines[ lines.length - 1 ] === "" ){
		lines.pop(); //removes last element of array
	}

	console.log("text contains " + lines.length + " lines after trimming");

	//Loop over lines to reduce blank lines to empty string
	var whitespaceOnlyRegexp = /^\s+$/  ; //matches any whitespace character
	for (lineIndex = 0; lineIndex < lines.length; lineIndex++){
		var line = lines[ lineIndex ];
		if ( whitespaceOnlyRegexp.test(line) ){
			line = "";
			lines[ lineIndex ] = line;
			console.log("whitespace only line at " + lineIndex );
		}
	}

	var tokenDiv =  prepareTokenDiv();

	for (lineIndex = 0; lineIndex < lines.length; lineIndex++) {

		tokens = tokenizeLineOfText( lines[lineIndex], lineIndex ); 

		console.log( tokens.length + " tokens in line " + lineIndex );

		//CREATE NEW DIV FOR EACH LINE 
		lineDiv = document.createElement("DIV");
		lineDiv.style.display = "block";

		//Check for blank line (single empty token).  Put a space there for display.
		if (tokens.length === 1 && tokens[0] === "" ||
			tokens.length === 0){
			console.log("build space stub for line " + lineIndex);
			node = document.createElement("BUTTON");
			node.className = "spacetoken";
			node.id = "space";
			textnode = document.createTextNode("\u00A0\u00A0");
			node.appendChild(textnode);
			lineDiv.appendChild(node);
		}

		createElementsForTokens( tokens, wordModelLineIndex, lineDiv, tokenDiv );

		for (var i=0; i < tokens.length; i++){
			if ( tokenIsAWordToken( tokens[i] ) ){
				//there is at least one word token in this line,
				//so tokenizeLineOfText added a line to the GWWWordTokenModel array
				//we need to increment the counter
				//this counter is used by createElementsForTokens() to build the
				//id string for word tokens.  This id string is used to find them 
				//when the edit cursor is being moved around.
				wordModelLineIndex++;
				//console.log("TESTING wordModelLineIndex " + wordModelLineIndex);
				break; //One is enough... 
			}
		}

		
		//Add event listener to word and punctuation tokens (not spaces)
		//We get all the BUTTON elements from the DOM, some of which are tokens.
		//filter on id
		buttonElements = document.getElementsByTagName("button");
		for (j = 0; j < buttonElements.length; j++){
			var element = buttonElements[j];
			if (element.id.includes("token") &&  
				(element.className.includes("whitespaceToken") === false) &&
				(element.className.includes("punctuationToken") === false) ){

				//whitespace and punctuation tokens cannot have challenges
				//so no clicking

				element.addEventListener("click",tokenClick);
			}
		}	
	}

	elem = document.getElementById("tokens");
	elem.className = elem.className.replace("hidden","visible");

	elem = document.getElementById("editTextDiv");
	elem.className = elem.className.replace("visible","hidden");

	enableSave();
}

function prepareTokenDiv(){
	//REMOVE EXISTING ELEMENTS FROM TOKEN DIV
	tokenDiv = document.getElementById("tokens");
	while (tokenDiv.hasChildNodes()) {   
    	tokenDiv.removeChild(tokenDiv.firstChild);
	}
	return tokenDiv;
}

function tokenizeLineOfText( line, lineIndex ){

		//Split into whitespace strings and non-whitespace strings
		var whitespaceRegexp = /\s+/;
		var testingTokens = [];
		var currentToken = "";
		for (var i =0; i < line.length ; i++){
			var thisLetter = line[i];

			if ( whitespaceRegexp.test( thisLetter )){
				if ( currentToken === "" ){
					currentToken = thisLetter;
				} else {
					if ( whitespaceRegexp.test( currentToken )){
						currentToken += thisLetter;
					} else {
						testingTokens.push( currentToken );
						currentToken = thisLetter;
					}
				}
			} else {
				if ( currentToken === "" ){
					currentToken = thisLetter;
				} else {
					if ( whitespaceRegexp.test( currentToken )){
						testingTokens.push( currentToken );
						currentToken = thisLetter;
					} else {
						currentToken += thisLetter;
					}
				}
			}
		}

		if (currentToken != ""){
			testingTokens.push(currentToken);
		}	

		var tokens = testingTokens;


		//Check each token for punctuation and further subdivide if needed.
		var workingTokens = [];
		for (var j = 0; j < tokens.length; j++) {
			var token = tokens[j];
			var result = splitOffPunctuationFromToken( token );
			if (result.length > 1) { 
				for (k = 0; k < result.length; k++){
					workingTokens.push( result[k] );
				}
			} else {
				workingTokens.push( result[0] );
			}
		}
		tokens = workingTokens;


		var tokensForModel = [];
		for (var j = 0; j < tokens.length; j++){
			var originalWord = [];
			originalWord[ GWWCHALLENGE_WORD ] = tokens[j];
			originalWord[ GWWCHALLENGE_TYPE ] = null;
			originalWord[ GWWCHALLENGE_INDEX ] = 0;
			originalWord[ GWWCHALLENGE_DEPELEMENTS ] = [];
			originalWord[ GWWCHALLENGE_NEEDEDKEY ] = [];
			originalWord[ GWWCHALLENGE_KEY ] = false;

			var token = [ originalWord ];

//			var token = [ [ tokens[j], "original" ] ]; //each token in the model 
			tokensForModel.push(token);
		}
		//console.log("tokensForModel.length = " + tokensForModel.length );
		GWWTokenModel.push( tokensForModel );




		var tokensForWordModel = []
		for (var j = 0; j < tokens.length; j++){
			var token = tokens[j];
			if ( tokenIsAWordToken( token ) ){

				var tokenModelInfo = [  lineIndex, j  ];

				//the token ID will point to this array
				
				tokensForWordModel.push( tokenModelInfo );	

				var last = tokensForWordModel[ tokensForWordModel.length - 1 ];

				//console.log(" last[0] " + last[0] + " last[1] " + last[1] + " j " + j + "lineIndex "+ lineIndex);


			}
		}
		//console.log("tokensForWordModel.length = " + tokensForWordModel.length );
		if (tokensForWordModel.length > 0){
			GWWWordTokenModel.push(tokensForWordModel);
			//console.log("GWWWordTokenModel.length " + GWWWordTokenModel.length);
		}

		return tokens;
}

function handleXMLText( xmlString ){

	var wordModelLineIndex = 0;

	//console.log( xmlString );

	//var xmlString_sanitized = xmlString.replace(/\n/g,"");
	var xmlString_sanitized = xmlString; //expect properly constructed string (no \n, \t, extra spaces, etc.)

	//console.log( xmlString_sanitized );


	var parser = new DOMParser();
	xmlDoc = parser.parseFromString( xmlString, "text/xml" );


	GWWTitle = "";
	GWWTitle = xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;
	var titleDiv = document.getElementById("textTitleDiv");
	if (titleDiv){
		titleDiv.innerHTML = GWWTitle;
		titleDiv.className = titleDiv.className.replace("hidden","visible");
	}


	GWWIntroText = "";

	var introNodeList = xmlDoc.getElementsByTagName("intro");

	//console.log("introNodeList.length " + introNodeList.length);

	if (introNodeList.length > 0){
		if (introNodeList[0].childNodes.length > 0){
			GWWIntroText = introNodeList[0].childNodes[0].nodeValue;				
		}
	}

	var introDiv = document.getElementById("textIntroDiv");
	if (introDiv ){
		introDiv.className = introDiv.className.replace("hidden","visible");
	}
	var introEmDiv = document.getElementById("textIntroEm");
	if (introEmDiv ){
		introEmDiv.innerHTML = GWWIntroText;
	}

	//The function tokenizeLineOfText() adds to these
	GWWTokenModel = [];
	GWWWordTokenModel = [];


	var lines = xmlDoc.getElementsByTagName("line");

	//console.log("lines.length = " + lines.length );

	if (lines){

		var tokenDiv =  prepareTokenDiv();

		for (var lineIndex=0; lineIndex < lines.length; lineIndex++){
			var lineNode = lines[ lineIndex ];

			var completeNode = lineNode.getElementsByTagName("complete");
			//console.log("completeNode.length = " + completeNode.length);
			//console.log("completeNode[0].childNodes.length = " + completeNode[0].childNodes.length);
			
			var lineText = "";

			if ( completeNode[0].childNodes.length === 0 ){
				//console.log("WARNING blank line ");

				lineText = "";

				
			} else {

				lineText = lineNode.getElementsByTagName("complete")[0].childNodes[0].nodeValue;
				
			}

			var tokens = tokenizeLineOfText( lineText, lineIndex ); //adds line to GWWTextModel;
			//adds words to GWWWordTokenModel

			//CREATE NEW DIV FOR EACH LINE 
			lineDiv = document.createElement("DIV");
			lineDiv.style.display = "block";

			//Check for blank line (single empty token).  Put a space there for display.
			if (tokens.length === 1 && tokens[0] === "" ||
				tokens.length === 0){
				node = document.createElement("BUTTON");
				node.className = "spacetoken";
				node.id = "space";
				textnode = document.createTextNode("\u00A0\u00A0");
				node.appendChild(textnode);
				lineDiv.appendChild(node);
			}

			createElementsForTokens( tokens, wordModelLineIndex, lineDiv, tokenDiv );

			for (var i=0; i < tokens.length; i++){
			if ( tokenIsAWordToken( tokens[i] ) ){
				//there is at least one word token in this line,
				//so tokenizeLineOfText added a line to the GWWWordTokenModel array
				//we need to increment the counter
				//this counter is used by createElementsForTokens() to build the
				//id string for word tokens.  This id string is used to find them 
				//when the edit cursor is being moved around.
				wordModelLineIndex++;
				//console.log("TESTING wordModelLineIndex " + wordModelLineIndex);
				break; //One is enough... 
			}
		}
	
			//Add event listener to word and punctuation tokens (not spaces)
			//We get all the BUTTON elements from the DOM, some of which are tokens.
			//filter on id
			buttonElements = document.getElementsByTagName("button");
			for (j = 0; j < buttonElements.length; j++){
				if (buttonElements[j].id.includes("token")){
					buttonElements[j].addEventListener("click",tokenClick);
				}
			}

			//**********************************************
			//Add challenges to model
			//**********************************************

			var modelLine = GWWTokenModel[ lineIndex ];

			var wordNodes = lineNode.getElementsByTagName("word");
			//console.log("In handleXMLText() --- N wordNodes: " + wordNodes.length );


			//Loop over word nodes.  
			for (var j=0; j < wordNodes.length; j++ ){
				var wordNode = wordNodes[j];
				var originalNode = wordNode.getElementsByTagName("original")[0];
				var indexNode = wordNode.getElementsByTagName("index")[0];

				//At the lowest level, every element has one child node
				//which is a TEXT NODE (#text) and contains the text found
				//between the opening and closing tags for that node in the 
				//XML document

				var originalNodeValue = originalNode.childNodes[0].nodeValue;
				var indexValue = indexNode.childNodes[0].nodeValue;


				var token = modelLine[ indexValue ];
				var originalElement = token[0];
				var originalWordForToken = originalElement[0];


				if ( originalNodeValue === originalWordForToken){
					//console.log("Match for "+originalWordForToken+" "+indexValue);
						
					
					for (var k=0; k < wordNode.childNodes.length; k++){
						var wordChildNode = wordNode.childNodes[k];
						if (wordChildNode.nodeName != "original" && wordChildNode.nodeName != "index" ){
							//This is a challenge node: add it the token
							var challenge = [ wordChildNode.childNodes[0].nodeValue, wordChildNode.nodeName ];
							token.push( challenge );
						}
					}
					
				}
			}



			//Loop over tokens in line.  Check each against word nodes and
			//add any challenges that match.
			/*
			for (var i=0; i < modelLine.length; i++){
				var token = modelLine[i];
				var originalElement = token[0];
				var originalWordForToken = originalElement[0];
				//console.log("Token: "+originalWordForToken);

				for (var j=0; j < wordNodes.length; j++ ){
						var wordNode = wordNodes[j];
						var originalNode = wordNode.getElementsByTagName("original")[0];

						//At the lowest level, every element has one child node
						//which is a TEXT NODE (#text) and contains the text found
						//between the opening and closing tags for that node in the 
						//XML document

						var originalNodeValue = originalNode.childNodes[0].nodeValue;

						//console.log("originalNode.nodeValue: " + originalNodeValue );

						if ( originalNodeValue === originalWordForToken){
							//console.log("Match!");
						
							for (var k=0; k < wordNode.childNodes.length; k++){
								var wordChildNode = wordNode.childNodes[k];
								//console.log("nodeName: "+wordChildNode.nodeName);
								if (wordChildNode.nodeName != "original" && wordChildNode.nodeName != "index" ){
									//This is a challenge node: add it the token
									var challenge = [ wordChildNode.childNodes[0].nodeValue, wordChildNode.nodeName ];
									token.push( challenge );
								}
							}	
						}
				}	
			}
			*/

		}//end of loop over lines
	} //end if (lines)

	updateAppearanceOfAllTokenElements();

	elem = document.getElementById("tokens");
	elem.className = elem.className.replace("hidden","visible");

	elem = document.getElementById("editTextDiv");
	elem.className = elem.className.replace("visible","hidden");

	enableSave();
}

function escapeQuotesForBuildXML( text ){
	if (GWWOfflineTesting ){
		var result = text.replace(/\'/g,"\\\'");
		result = result.replace(/\"/g, "\\\"");
		return result;

	} else {
		return text;
	}
}

function buildXML(){

	//no \n, \t or extra spaces between tags, only in content of tag

	alert("xml does not include key challege info yet");

	var xmlModel = "";

	xmlModel = "\<?xml version=\"1.0\"?\>";
	xmlModel += "<text>";

	xmlModel += "<title>"+ escapeQuotesForBuildXML( GWWTitle )+"</title>";

	xmlModel += "<intro>"+ escapeQuotesForBuildXML( GWWIntroText )+"</intro>";

	//Loop over lines of text
	for ( var i = 0; i < GWWTokenModel.length; i++) {
		
		var line = GWWTokenModel[i];
		var lineText = "";

		xmlModel += "<line>";
		
		//console.log("BUILDXML tokens in line = " + line.length );

		//Loop over tokens in each line
		for (var j = 0; j < line.length; j++) {

			var thisTokenInfo = line[ j ];
			var thisTokenOriginalInfo = thisTokenInfo[0];
			var thisTokenText = thisTokenOriginalInfo[ GWWCHALLENGE_WORD ];

			lineText = lineText + escapeQuotesForBuildXML( thisTokenText );
		
		}

		xmlModel += "<complete>" + lineText + "</complete>";


		for (var j = 0; j < line.length; j++){
			var thisTokenInfo = line[ j ];
			//Every token has ONE item of info, i.e. the original text of the token.
			//If there are more info items, need to build a <word> tag for this token
			//This is why blank lines appear as <line><complete></complete></line>
			//(no text and no word tags).
			if (thisTokenInfo.length > 1){
				var thisTokenOriginalInfo = thisTokenInfo[0];
				var thisTokenText = escapeQuotesForBuildXML(  thisTokenOriginalInfo[ GWWCHALLENGE_WORD ] );
				xmlModel += "<word>";
				//xmlModel += "<token>";
				xmlModel += "<index>" + j + "</index>";
				xmlModel += "<original>" + thisTokenText + "</original>";
				for (var k = 1; k < thisTokenInfo.length; k++){
					var thisTokenChallengeInfo = thisTokenInfo[k];
					
					var thisTokenChallengeText = escapeQuotesForBuildXML( thisTokenChallengeInfo[ GWWCHALLENGE_WORD ] );
					var thisTokenChallengeType = thisTokenChallengeInfo[ GWWCHALLENGE_TYPE ];
					var thisTokenChallengeKey = thisTokenChallengeInfo[ GWWCHALLENGE_KEY ];
					var thisTokenChallengeIndex = thisTokenChallengeInfo[ GWWCHALLENGE_INDEX ];

					console.log( "thisTokenChallengeIndex "+thisTokenChallengeIndex);

					if (typeof thisTokenChallengeIndex === "undefined"){
						thisTokenChallengeIndex = 0;
					}

					xmlModel += "<"+thisTokenChallengeType+" index=\""+ thisTokenChallengeIndex.toString()+"\">"+thisTokenChallengeText+"</"+thisTokenChallengeType+">";			
				}
				xmlModel += "</word>";
				//xmlModel += "</token>";

			}
		}



		xmlModel += "</line>";
	}
	xmlModel += "</text>";

	return xmlModel;
}

function createElementsForTokens( tokens, wordTokenModelLineNumber, lineDiv, tokenDiv ){
	var j = 0;
	var tokensCounter = 0;
	var wordTokenCounter = 0;
	var node;
	var textnode;
	var nextToken;
	var currentToken;

	for (j = 0; j < tokens.length; j++) {

		currentToken = tokens[ j ];

			
		node = document.createElement("BUTTON");
		node.className = "token token_neutral ";


		node.setAttribute('data-goojaji-tokenindex', j.toString() ); //keep track of token index
		
		if ( tokenIsAWordToken( currentToken ) ){

			node.id = tokenId( wordTokenModelLineNumber, wordTokenCounter );
			wordTokenCounter++;

		} else {

			if ( punctuationInToken(currentToken) ){

				node.id = "punctuation";
				node.className += "punctuationToken";

			} else if ( /\s+/.test(currentToken) ){

				node.id = "whitespace";
				node.className += "whitespaceToken";

			}
		}
		tokensCounter++;


		textnode = document.createTextNode( currentToken );
		textnode.id = "text";
		node.appendChild(textnode);

		lineDiv.appendChild(node);

	}
	tokenDiv.appendChild( lineDiv );	
}
function setTextDisplayedByElement( text, element ){
	var children = element.childNodes;
	var textnode = null;
	for (var i=0; i < children.length; i++){
		var child = children[i];
		if (child.id == "text"){
			textnode = child;
			break;
		}
	}

	if (textnode != null){
		textnode.nodeValue = text;
	}
}

function tokenIsAWordToken( token ){
	return /[a-zA-Z]+/.test(token);
}

function tokenId( lineIndex, tokenIndex ){

	//The tokenIndex is indexing EDITABLE WORDS on the line.
	//It is used to navigate the editable words with the
	//arrow keys

	return "token_" + lineIndex + "_" + tokenIndex;
}

function punctuationInToken( token ){
	var punctuationPatt = /[,.:;!?\"]|--+/;
	return punctuationPatt.test(token);
}

function whitespaceInToken( token ){
	var whitespaceRegexp = /\s+/;
	return whitespaceRegexp.test(token);
}

function splitOffPunctuationFromToken( token ){
	//console.log("SPLITOFF   " + token );

	var result = [];
	result[0] = token;

	var workingArray = [];
	var recursiveResult = [];

	var punctuationPatt = /([,.:;!?\"]+|--+)/; //square brackets make it match one occurence of any char
	var nonPunctuationPatt = /^[,.:;!?\"]+/;
	var punctuationSeqPatt = /([,.:;!?\"]+|--+)/;
	var temp;
	var i;

	if ( punctuationPatt.test(token) === true ){
		//This token contains punctuations.
		//So we need to further break it up.

		
		match = token.match(punctuationSeqPatt); //regexp does not include g modifier
													//so method will only return first match 
													//method returns an ARRAY, in this case of one element


		index = token.search( punctuationSeqPatt );


		if (index > 0){
			result[0] = token.substr(0,index);
			result[1] = token.substr(index, match[0].length);

			var temp = index + match[0].length;
			if ( temp < (token.length) ){
				//result[2] = token.substring(temp, token.length);
				result[2] = token.substring(temp); //without second arg, extracts from temp to end of string
			}

		} else {
			
			if (match[0].length === token.length){
				//don't do anything: whole token is punctuation
			} else {
				result[0] = token.substr(0,match[0].length);
				//result[1] = token.substring(match[0].length, token.length  );
				result[1] = token.substring(match[0].length);
			}
		}
	}

	for (var i = 0; i < result.length; i++){
		if (punctuationPatt.test( result[i] ) === true ){
			match = result[i].match(punctuationSeqPatt);
			if (match[0].length != result[i].length){

				recursiveResult = splitOffPunctuationFromToken( result[i] );

				for (var j = 0; j < recursiveResult.length; j++ ){
					workingArray.push( recursiveResult[j]);
				}

			} else {
				workingArray.push( result[i] );
			}
		} else {
			workingArray.push( result[i] );
		}
	}



	if (workingArray.length > result.length ){
		result = workingArray;
	}

	
	return result;		
}

function hideEditText(){
		var div = document.getElementById("tokens");
		div.className = div.className.replace("visible","hidden");
		div = document.getElementById("textTitleDiv");
		div.className = div.className.replace("visible","hidden");
		div = document.getElementById("textIntroDiv");
		div.className = div.className.replace("visible","hidden");
}

function showEditText(){
	var div = document.getElementById("tokens");
	div.className = div.className.replace("hidden","visible");
}

function hideEnterText(){
	var div = document.getElementById("editTextDiv");
	div.className = div.className.replace("visible","hidden");
}

function showEnterText(){
	var div = document.getElementById("editTextDiv");
	div.className = div.className.replace("hidden","visible");
}

function hideFileHandling(){
	var div = document.getElementById("fileHandling");
	div.className = div.className.replace("visible","hidden");
}

function showFileHandling(){
	//var div = document.getElementById("fileHandling");
	//div.className = div.className.replace("hidden","visible");
}

function hideHTTPResponse(){
	var div = document.getElementById("httpResponse");
	div.className = div.className.replace("visible","hidden");
}

function showHTTPResponse(){
	var div = document.getElementById("httpResponse");
	div.className = div.className.replace("hidden","visible");
}

function submitFileToOpen(){

	var textSelect = document.getElementById("textSelect");
	if (textSelect){
		GWWUniqueId = textSelect.value;
		//console.log("value = " + GWWUniqueId );

		var httpResponseDiv= document.getElementById("httpResponse");
		if (httpResponseDiv) {
			httpResponseDiv.innerHTML = "Fetching text";
		}



		var xmlhttp;
		if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        var url = "fetch.php";

		var params = "id=" + GWWUniqueId;
	
        xmlhttp.open("POST",url,true);

        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            	var div = document.getElementById("httpResponse");
            	if (div){
            		//div.className = div.className.replace("hidden","visible");
            		//div.innerHTML = xmlhttp.responseText;

            		hideHTTPResponse();
            		handleXMLText( xmlhttp.responseText );

            	}
            }
        };

        xmlhttp.send( params );





		//var testText = "<?xml version=\"1.0\"?><text style=\"poetry\" language=\"EN\"><title>Mary Had A Little Lamb</title>	<line><complete>Mary had a little lamb.</complete><word><original>little</original><alt>tiny</alt></word><word><original>lamb</original><rhyme>ham</rhyme></word></line><line><complete>Its fleece was white as snow.</complete><word><original>fleece</original><alt>face</alt></word>	</line>	<line><complete>And everywhere that Mary went,</complete><word><original>everywhere</original><alt>anywhere</alt></word></line><line><complete>The lamb was sure to go.</complete><word><original>sure</original><alt>likely</alt><alt>certain</alt></word>	</line></text>";
	}
}

function navBarButtonClick(event){
	//console.log(event.target.id + " clicked");

	var id = event.target.id;
	var div, elem;

	if (id === "navBar_New"){


		var textareaElement =  document.getElementById("textarea");
		var titleElement = document.getElementById("title-textarea");
		var introElement = document.getElementById("intro-textarea");


		if (GWWTokenModel.length > 0 ||
			textareaElement.value.length > 0 ||
			titleElement.value.length > 0 ||
			introElement.value.length > 0 ){
			var r = false;
			if (GWWUniqueId){
				r = confirm("Discard changes to text?");
			} else {
				r = confirm("Discard current text?");
			}

			if (r === true){
				hideEditText();
				hideFileHandling();
				//showFileHandling();
				showEnterText();

				textareaElement.value = "";
				titleElement.value = "";
				introElement.value = "";


				adjustEditTextOKButton();

				disableSave();
				//enableSave();

			} 

			var div = document.getElementById("httpResponse");
			if (div){
				div.className = div.className.replace("visible","hidden");
			}

		} else {
			hideEditText();
				hideFileHandling();
				//showFileHandling();
				showEnterText();

				
				textareaElement.value = "";
				titleElement.value = "";

				adjustEditTextOKButton();

				disableSave();
				//enableSave();

				var div = document.getElementById("httpResponse");
				if (div){
					div.className = div.className.replace("visible","hidden");
				}

		}
		
	

	} else if ( id === "navBar_Open") {
		//console.log(id);

		hideEnterText();
		//hideEditText();
		//showFileHandling();


		if (GWWOfflineTesting){

			var testXML = '<?xml version="1.0"?><text><title>The \"Fish\"</title><line><complete>\"Hello,\" he said timidly.</complete><word><index>1</index><original>Hello</original><alt>Hi</alt></word><word><index>9</index><original>timidly</original><alt>shyly</alt></word></line><line><complete>Fish!</complete><word><index>0</index><original>Fish</original><alt>Cat</alt></word></line></text>';
			handleXMLText( testXML );

		} else {

			showHTTPResponse();


			var xmlhttp;
			if (window.XMLHttpRequest) {
            	// code for IE7+, Firefox, Chrome, Opera, Safari
	            xmlhttp = new XMLHttpRequest();
    	    } else {
        	    // code for IE6, IE5
            	xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	        }

    	    var url = "open.php";

	        //these would eventually be for private text editing or groups
    	    //sanitized by using encodeURIComponent 
        	var sanitized_author = "Greg";
	        var sanitized_group = "Public";

			var params = "author=" + sanitized_author + "&group=" + sanitized_group;
	
        	xmlhttp.open("POST",url,true);

	        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    	    xmlhttp.onreadystatechange = function() {
            	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            		var div = document.getElementById("httpResponse");
            		if (div){
            			div.className = div.className.replace("hidden","visible");
	            		div.innerHTML = xmlhttp.responseText;
    	        	}
        	    }
        	};

        	xmlhttp.send( params );
		}

	} else if ( id === "navBar_Save") {
		//console.log(id);

		hideEnterText();
		//hideEditText();
		//showFileHandling();


		var xmlModelOfText = buildXML(); 

		if ( GWWOfflineTesting ){

			console.log("GWWOfflineTesting === true ");
			console.log(xmlModelOfText);

		} else {

			var title;
			if (GWWTitle){
				title = GWWTitle;
			} else {
				title = "A Text";
			}

			if (GWWUniqueId){
				var r = confirm("Overwrite existing text?");
				if (r === false) return;
			}

			//encodeURIComponent escapes all characters except the following: alphabetic, decimal digits, - _ . ! ~ * ' ( )
			var sanitized_title = encodeURIComponent( title );	
    	   	var sanitized_xmlModelOfText = encodeURIComponent(xmlModelOfText);

	       	var xmlhttp;
			if (window.XMLHttpRequest) {
        	    // code for IE7+, Firefox, Chrome, Opera, Safari
            	xmlhttp = new XMLHttpRequest();
	        } else {
    	        // code for IE6, IE5
        	    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        	}

        	var url = "save.php";
			var params = "title=" + sanitized_title + "&xmlmodel=" + sanitized_xmlModelOfText;
			if (GWWUniqueId){
				params = params + "&id=" + GWWUniqueId;
			}
	
    	    xmlhttp.open("POST",url,true);

        	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        	xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            	var div = document.getElementById("httpResponse");
            	if (div){
            		div.className = div.className.replace("hidden","visible");
            		div.innerHTML = xmlhttp.responseText;
            	}
            }
        	};

       		xmlhttp.send( params );





		}



	/*
	// Create a new FormData object.
	// This can be used to hold, blobs, files or strings
	var formData = new FormData(); //same encoding as if using multipart/form-data in form

	//new Blob(blobParts : Array, [blobPropertyBag : Object]) : Blob
	// 	blobPropertyBag : {
	//		type	    String	A valid mime type such as 'text/plain'
	//		endings	String	Must be either 'transparent' or 'native'
	//			}
	//The elements of blobParts must be of the types ArrayBuffer, ArrayBufferView, Blob, or String. 

	// Like a file, but you make it yourself.
	var blob = new Blob([ '<a id="a"><b id="b">hey!</b></a>' ], { type: 'text/xml' });

	//formData.append(name, value);
	//formData.append(name, value, filename);
	//filename: default for blobs is "blob", for file objects it is the filename


	formData.append('wordWhileData',blob,"skinamarink.txt");

	// Set up the request.
	var xhr = new XMLHttpRequest();

	// Open the connection.
	xhr.open('POST', 'handler.php', true);

	// Set up a handler for when the request finishes.
	xhr.onload = function () {
  			if (xhr.status === 200) {
    			// File(s) uploaded.
    			alert("file uploaded");
  			} else {
    			alert('An error occurred!');
  			}
		};

	//this method sends the request
	//can send blob, FormData,Document object, ArrayBufferView

	xhr.send(formData);


	*/






	} else if ( id === "navBar_Global") {
		GWWChallengeEditMode = "global";





		div = document.getElementById("navBar_Single");
		div.className = div.className.replace("buttonSelected","buttonNotSelected");

		event.target.className = event.target.className.replace("buttonNotSelected","buttonSelected");

		updateEditBox();


		//console.log("edit mode " + GWWChallengeEditMode);

	} else if (id === "navBar_Single") {
		GWWChallengeEditMode = "single";

		div = document.getElementById("navBar_Global");
		div.className = div.className.replace("buttonSelected","buttonNotSelected");

		event.target.className = event.target.className.replace("buttonNotSelected","buttonSelected");

		updateEditBox();

		//console.log("edit mode " + GWWChallengeEditMode);
	}
}
function updateEditBox(){
	var box = document.getElementById("editbox");
	if (box){
		var label = document.getElementById("editModeLabel");
		if (GWWChallengeEditMode === "single"){
			//console.log("updateEditBox box.className = "+box.className);
			box.className = box.className.replace("globalEditMode","singleEditMode");
			label.innerHTML = "Single Mode<br>";
		} else {
			//console.log("updateEditBox box.className = "+box.className);
			box.className = box.className.replace("singleEditMode","globalEditMode");
			label.innerHTML = "Global Mode<br>";
		}
	}
}		