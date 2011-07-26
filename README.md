# demogram

### Description:

Simple Instagram client build with SproutCore 2.0 and the Browser Package Manager (BPM) tools.

### Features / Problems:
Touch gesture support on iOS.

* Tap an image to view details.
* Pinch and pan to zoon on the image in the details view.

### Synopsis:

FIX (code sample of usage)

### Requirements:

* BPM - http://bpmjs.org or http://sproutcutter.heroku.com

	$ gem install bpm

### Configure:

Obtain a Client ID from http://instagram.com/developer and add the Client ID to app/main.js
	App.INSTAGRAM_CLIENT_ID="CLIENT ID GOES HERE"

### run:	
From your project directory run:
	
	$ bpm preview
	
Open http://localhost:4020 in your browser.
