<?php
$home = $_SERVER['DOCUMENT_ROOT'] . '/..';
$ipfile = fopen("$home/data/ip","r") or die("Unable to open file!");
$ip = trim(fread($ipfile,200));
fclose($ipfile);
$portfile = fopen("$home/data/port","r") or die("Unable to open file!");
$port = trim(fread($portfile,200));
fclose($portfile);
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Sketch</title>
		<meta charset="UTF-8" />
		<style>
			body,canvas {padding: 0px; margin: 0px;}
			#reconnect {
				margin: 100px auto 0px auto;
				padding: 20px;
				font-size: 14pt;
				font-weight: bold;
			}
		</style>
		<script>
			var ip = "<?php echo $ip ?>";
			var port = "<?php echo $port ?>";
		</script>
    </head>
    <body onresize="myresize()">
		<input type="button" id="reconnect" value="Try to reconnect" style="display: none" onclick="connect()" />
		<p id="connecting" style="font-size: 14pt;">Connecting...</p>
		<div style="position: relative;">
        <canvas id="sketch" style="position: absolute; left: 0; top: 0; z-index: 0;">
            This text is displayed if your browser does not support HTML5 Canvas.
        </canvas>
        <canvas id="overlay" style="display: none; position: absolute; left: 0; top: 0; z-index: 1;"></canvas>
		</div>
        <script type='text/javascript' src='script.js'></script>
    </body>
</html>
