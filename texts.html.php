<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"  

    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">  

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">  
  <head>  
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>  
  </head>  

  <body>    

      <form onSubmit="submitFileToOpen(); return false;">
        <select class="textSelect" id="textSelect">

    <?php 

        /*  the value of $titles, $id, $dates is set in open.php from the 
            results of the DB query.
        */
 
       //PHP supports two types of syntax for for loops:
            // for ( ; ; ){
            //     statements;
            //  }
          
            //  AND

            // for ( ; ; ):   <-------- NOTICE THE COLON!!!
            //     statements;
            // endfor;

            // foreach ($somearray as $somevar):
            //    statements;
            // endforeach;

        for ($i=0, $max_count = count($titles); $i < $max_count; ++$i):

          $id = $ids[$i];
          $title = $titles[$i];
          $date = $dates[$i];

    ?>  
                    <?php 
                          $value = "<option value=\"".htmlspecialchars($id, ENT_QUOTES, 'UTF-8')."\">";
                          echo $value.htmlspecialchars($title, ENT_QUOTES, 'UTF-8')."</option>"; 
                    ?>
                    <?php //echo "<script>console.log(\"".$value."\");</script>" ?>
        <?php endfor; ?>  
      </select>
      <input id="textareaButton" type="submit" value="Open">

    </form>
  </body>  
</html>