<?php 

	//See implementation notes at the bottom.
	$id = $_POST['id'];

	//Args are hostname, uid, pwd
	$link = mysqli_connect(  #### REDACTED TO SECRETS ##### );

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

 
  		//Must provide a value for every field that cannot be NULL.
  		//See below for inserting variables.
      $sql = "SELECT * FROM `wwtexts` WHERE `text_id` = '$id'";

    	$result = mysqli_query($link, $sql);

    	//For successful SELECT queries, mysqli_query will return a mysqli_result object. 
    	//FALSE on failure.

    	if (!$result){
      		$output = 'Error fetching texts.'; 
      		include 'output.html.php'; 
      		exit();  
    	} else {

    		 while ($row = mysqli_fetch_array($result,MYSQLI_ASSOC)) {  
            $texts[] = $row['wwtext'];
      		}
      		echo $texts[0];
      		$result->free();
      		exit(); 
    	}
    }
?>


