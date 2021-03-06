<html>
<head>

	<link rel="stylesheet" type="text/css" href="main.css">
	<link rel="stylesheet" type="text/css" href="token.css">

</head>

<?php /* phpinfo() */ ?>

<body >

<div id="navbar" class="navbar">
	<button id="navBar_New" class="navBarButton buttonEnabled" onClick="navBarButtonClick(event)" >New</button>
	<button id="navBar_Open" class="navBarButton buttonEnabled" onClick="navBarButtonClick(event)">Open</button>
	<button id="navBar_Save" class="navBarButton buttonEnabled" onClick="navBarButtonClick(event)">Save</button>

	<button id="navBar_Global" class="navBarButton buttonEnabled buttonNotSelected" onClick="navBarButtonClick(event)" style="float:right;" title="Challenges added to any selected word will be added to all matching words in the text.">Global</button> 
	
	<button id="navBar_Single" class="navBarButton buttonEnabled buttonSelected" onClick="navBarButtonClick(event)" style="float:right; margin-right: 0px;" title="Challenges are added only to the selected word.">Single</button>
</div>


<div id="fileHandling" class="fileHandlingDiv hidden">
	<input type="file" 	id="fileinput" style="margin-left:5em;margin-top:1.5em;margin-bottom:1.5em;"></input> 
</div>

<div  id="httpResponse" class="httpResponseDiv hidden">
	<br>
	<p>
		<em class="font-size:1.5em;">Fetching titles</em>
	</p>
	<br>
</div>

<div id="editTextDiv" class="editTextDiv visible">

<input type="text" id="title-textarea" class="textarea" rows="1" form="textform" placeholder="Enter title.  No challenges can be added to this title." onInput="adjustEditTextOKButton();" autofocus></input>	
<br><br>
<textarea id="intro-textarea" class="textarea" name="intro" rows="5" form="textform" placeholder="Enter optional introductory text.  This will be displayed when browsing the text (not when playing games based on it). No challenges can be added to this introductory text." onInput="adjustEditTextOKButton();">
</textarea><br><br>
<textarea id="textarea" class="textarea" name="message" rows="12" form="textform" placeholder='Enter text.  If poetry, press enter after each line.  If prose, press enter only after each paragraph. Press "Done" to commit to original form of text and add challenges to words in text.' onInput="adjustEditTextOKButton();">
</textarea><br>
<form id="textform" onSubmit="handleNewRawText(); return false;" >
	<input id="textareaButton" class="operationButton operationButtonDisabled" disabled="true" type="submit" value="Done">
</form>
</div> <!-- end editTextDiv -->

<div id="textTitleDiv" class="textTitleDiv hidden">
</div>
<div id="textIntroDiv" class="textIntroDiv hidden"><em id="textIntroEm"></em>
</div>
<div>
	<pre id="tokens" class="tokens hidden">
	</pre>
</div>
<br>
<!--
<form id="textform" onSubmit="handleEditText(); return false;" >
	<input class="operationButton" type="submit" value="Edit Text">
</form> -->

<script src="composer.js"></script>


</body>
</html>