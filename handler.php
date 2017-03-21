<?php

//$_FILES is a "superglobal", or automatic global, variable.  Available in all
//scopes throughout a script.

/*  

$_FILES['userfile']['name']
The original name of the file on the client machine.

$_FILES['userfile']['type']
The mime type of the file, if the browser provided this information. An example would be "image/gif". This mime type is however not checked on the PHP side and therefore don't take its value for granted.

$_FILES['userfile']['size']
The size, in bytes, of the uploaded file.

$_FILES['userfile']['tmp_name']
The temporary filename of the file in which the uploaded file was stored on the server.

$_FILES['userfile']['error']
The error code associated with this file upload.




*/


/* 

The client creates a FormData object and appends a key:value pair to it.  In this case,
it's wordWhileData:(blob with the text/xml data).  Can also specify a filename in 
formData.append(key,value,filename), so
formData.append("wordWhileData",blob,"something.xml");

In which case
$_FILES[key][name] returns filename:
$_FILES["wordWhileData"]["name"] == "something.xml"



*/



$target_dir = "uploads/";
$target_file = $target_dir . basename($_FILES["wordWhileData"]["name"]);

$uploadOk = 1;

// Check if file already exists
if (file_exists($target_file)) {
    echo "Sorry, file already exists.";
    $uploadOk = 0;
}


 // Check file size
if ($_FILES["wordWhileFile"]["size"] > 500000) {
    echo "Sorry, your file is too large.";
    $uploadOk = 0;
}


// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
    echo "Sorry, your file was not uploaded.";
// if everything is ok, try to upload file
} else {
    if (move_uploaded_file($_FILES["wordWhileFile"]["tmp_name"], $target_file)) {
        echo "The file ". basename( $_FILES["wordWhileFile"]["name"]). " has been uploaded.";
    } else {
        echo "Sorry, there was an error uploading your file.";
    }
}

?>