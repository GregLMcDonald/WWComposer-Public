<?php 

	//See implementation notes at the bottom.
	$title = $_POST['title'];
	$xmlmodel = $_POST['xmlmodel'];
  $id = $_POST['id'];

  //if ($id) {
  //  $output = "ID ".$id;
   // include 'output.html.php';
   // exit();
 // }


	//To escape reserved characters in the POST data, encodeURIComponent() was
	//used in the JS.  The PHP function urldecode() reverses this.
	$title = urldecode($title);
	$xmlmodel = urldecode($xmlmodel);

	//Args are hostname, uid, pwd
	$link = mysqli_connect( ##### REDACTED ##### );

	if (!$link){
    	$output = "Unable to connect to the database server.";
    	include 'output.html.php'; 
      	exit(); 
	} else {

		if (!mysqli_set_charset($link, "utf8")) { 
      		$output = 'Unable to set database connection encoding.'; 
      		include 'output.html.php'; 
      		exit(); 
    	}

    	if (!mysqli_select_db($link, ##### REDACTED ##### )) { 
      		$output = 'Unable to locate the WW database.'; 
      		include 'output.html.php'; 
      		exit(); 
    	}

 
      	//In mysqli_real_escape_string(), MUST include link as arg!!!
		//Note, that if no connection is open, mysqli_real_escape_string() will return an empty string!
   		$title_esc = mysqli_real_escape_string( $link, $title );
		$xmlmodel_esc = mysqli_real_escape_string( $link, $xmlmodel );

  		//Must provide a value for every field that cannot be NULL.
  		//See below for inserting variables.
      	


      if ($id){
          $sql = "UPDATE wwtexts SET wwtitle = '$title_esc', wwtext = '$xmlmodel_esc' WHERE text_id = '$id'";
      } else {
          $sql = "INSERT INTO wwtexts (wwtitle, wwtext) VALUES ('$title_esc', '$xmlmodel_esc')";
      }


    	$result = mysqli_query($link, $sql);

    	//For successful INSERT queries, mysqli_query will return TRUE. FALSE on failure.

    	if (!$result){
      		$output = 'Error fetching texts.'; 
      		include 'output.html.php'; 
      		exit();  
    	} else {

    		$output = "Text saved to database.";
    		include 'output.html.php'; 
    		exit();

    	}

    	

    }


/*

$_POST is superglobal variable in PHP that holds the form data in an associative 
array.  For a POST parameter like "var1=blah&var2=bloo", you get the values with
$foo = $_POST['var1'], etc.


The rules of adding strings into a query are plain and simple:

The string should be enclosed in quotes.
Therefore, these quotes should be escaped in the data, 
as well as some other characters, using mysqli_real_escape_string( pointer to link, string )

$type     = 'testing';
$type     = mysql_real_escape_string($type);
$reporter = "John O'Hara";
$reporter = mysql_real_escape_string($reporter);

$query    = "INSERT INTO contents (type, reporter, description) 
             VALUES('$type', '$reporter', 'whatever')";

	*/


?>


