# websketch
Online whiteboard program (using websockets) for maths tutoring etc.

I tried out one or two online whiteboard websites and there were some things I didn't like about them:
* Uploading an image takes too many clicks.
* All messages go through a server, possibly on the other side of the world, instead of more directly from my computer to my student's computer, so it's quite slow.
* There's no way of knowing if a message has been received, so when I draw something I don't know when they can see it.
* There's no indication of the size of their screen, so I was accidentally writing outside of their viewing window a lot.
* I prefer a "lasso"-style erase, so that erasing large areas is quick and easy.
* There's no way to point to or highlight a particular thing temporarily (e.g. when you want to say '*this* side of the triangle' or '*this* coefficient'), so I'd end up drawing arrows to things and then having to erase them later, which was annoying.

So I decided to write my own whiteboard program with the following features:
* Middle-click pastes in the last png file created from my home directory (which is where screenshots go on my computer).
* Communication is peer-to-peer, through websockets, so that lag is minimised. On my end, the whiteboard is a python script, and on their end it's through their browser.
* Any lines drawn on my end are grey until acknowledged by the student's computer, then turn black. Erasures are partially transparent until acknowledged (same with clearing the whiteboard). Images have a dashed outline until acknowledged.
* A dashed line indicates the edges of their viewing window.
* Lasso-style erase, i.e. draw around the thing you want erased.
* Pressing 'h' starts highlight mode, where anything drawn will flash on the student's screen, and disappear when 'h' is pressed again, or a different thing is drawn. Useful for circling things or drawing arrows to things.

## Requirements and Installation
I wrote this for linux, so I used GTK, which can be a bit of a pain to get working on Windows, but it can be done. Follow the instructions at https://pygobject.readthedocs.io/en/latest/getting_started.html (also has instructions for mac, etc.)

You'll need python3 and may need to install some packages with pip, e.g. `pip3 install websockets`.

You'll also need a website. The student visits a web page which tells their browser the ip address and port to use for the websockets connection to your computer. Since I don't have a static ip address, I decided to make a little script which can be launched from the websketch program to save my current ip address on the server ([storeip.sh](https://github.com/jennigorham/websketch/blob/master/storeip.sh)), and then that address is retrieved by [index.php](https://github.com/jennigorham/websketch/blob/master/index.php). If you don't have any experience with web development and all this is confusing (or you don't have SSH access to the web server), you might find it easier to just upload the static version, [index.html](https://github.com/jennigorham/websketch/blob/master/index.html) to your web server, and edit it if your ip address changes.

The setup on my web server goes something like this:
* [storeip.sh](https://github.com/jennigorham/websketch/blob/master/storeip.sh) goes in ~/bin/ (you may need to make it executable with `chmod a+x ~/bin/storeip.sh`).
* Create the directory ~/data/ - this is where storeip.sh stores the ip address and port.
* [index.php](https://github.com/jennigorham/websketch/blob/master/index.php) and [script.js](https://github.com/jennigorham/websketch/blob/master/script.js) go in ~/html/websketch/

If you'd rather use the static version, then you just edit [index.html](https://github.com/jennigorham/websketch/blob/master/index.html) and replace `<put your ip address here>` with your actual [ip address](https://whatsmyip.org), and put index.html and script.js into a directory on your web server.

Then your students can access the whiteboard through yourserver.com/websketch (or whatever directory name you chose).

Optional: I also use [SSH public key authentication](https://kb.iu.edu/d/aews) so that websketch can run the storeip.sh script on the server without me having to type my password in each time.

You'll need to set up [port forwarding](https://www.noip.com/support/knowledgebase/general-port-forwarding-guide/) (aka virtual server) on your home router, so that it knows to send that incoming websockets connection to your computer. I've used port 8765; you can change that if you like by editing [websketch](https://github.com/jennigorham/websketch/blob/master/websketch) (and index.html if you use it rather than index.php).

On the rare occasions when my home internet goes down, I use mobile internet with a VPN that provides port forwarding. This kind of defeats the purpose of the whole websockets thing, but I'd rather not have to write a whole nother program just for those rare occasions.

You might want to edit [websketch](https://github.com/jennigorham/websketch/blob/master/websketch) and change the get_image_filename_command. I've set it to `ls -c ~/*.png | head -n 1` which on my computer returns the file path of the last screenshot I took. I don't know what you'd use on mac or windows.

If you want to use the storeip.sh script you'll also have to edit the update_server_command.

## Usage
You'll probably want to run websketch from a terminal at least for the first time, so you can see any error messages. If it's working you should get a blank window. Then you can go to the web page to see if it's working as an online whiteboard.

* Left mouse button (or stylus, etc) will draw lines.
* Middle mouse button pastes an image, specified by get_image_filename_command.
* Right mouse button erases (this works like the lasso tool in photoshop - draw around whatever you want erased).

Keys:
* 'e' also erases. This is useful if you're using a stylus without a right-click. Just press 'e' then draw around whatever you want erased.
* 'c' clears the screen.
* PgUp and PgDn scroll, or you can use your scroll wheel.
* 's' triggers the storeip.sh script.
* 'h' enters highlight mode. Anything drawn in highlight mode is temporary and will flash on the student's screen. Use this mode to circle things or draw arrows to things.
* 'z' will undo. I haven't programmed in a way to redo. After you've undone everything you want to undo, press 'r' to refresh the student's screen. 'r' can also be used if you think a drawing message hasn't reached them and you want to resend it. It just takes a picture of your whiteboard and sends it to them to ensure everything's synced.
* 'l' toggles the appearance of faint blue lines on your screen, like in notebooks, so you can keep your writing straight. The lines don't appear on your student's screen.

Your student can also draw on the whiteboard, but I haven't programmed any way for them to erase, clear, insert an image, or highlight. I should, I just haven't gotten around to it.
