---
title: 'CSS box model hacking'
date: 2011-03-26T16:25:00+0000
tags: css
alias: post/42903212159/css-box-model-hacking/
---

Want to make an HTML element fill 100% of its parent's width but also give it a border and/or some padding? Since the width of an element is _exclusive_ of its border and padding this can be a pain. However there's a fairly simple CSS solution that works cross-browser.

<!-- more -->

Here's an example. Both input boxes are set to `width: 100%` and have `padding: 5px`. The first input shows the problem. Because the padding and border are added to the width of the element it overflows its container. The box model of the second input has been modified so that the padding and border are _inside_ the declared width.

<style>
    #example {
		border-style: dotted;
		background: #ccc;
		margin: 0 auto;
		padding: 5px;
		width: 300px;
 	}
 	#example, #example input {
 		border-color: #444;
 		border-width: 1px;
 	}
 	#example input {
 		border-style: solid;
 	}
 	#example label {
 		cursor: pointer;
 		display: block;
 	}
 	#example input {
 		padding: 5px;
 		width: 100%;
 	}
 	#example #example-1 {
 		   -moz-box-sizing: content-box;
 		-webkit-box-sizing: content-box;
 		    -ms-box-sizing: content-box;
 		        box-sizing: content-box;
	}
 	#example #example-2 {
 		   -moz-box-sizing: border-box;
 		-webkit-box-sizing: border-box;
 		    -ms-box-sizing: border-box;
 		        box-sizing: border-box;
	}
</style>
<fieldset id="example">
	<label for="example-1">Field 1</label>
	<input id="example-1">
	<label for="example-2">Field 2</label>
	<input id="example-2">
</fieldset>

The trick to modifying the box model is to set `box-sizing: border-box`. Unfortunately that's not a cross-browser property, only Opera supports it at the moment. To get the same effect in other browsers you will also need to set browser-specific versions as well:

       -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
        -ms-box-sizing: border-box;
            box-sizing: border-box;

Note that Internet Explorer only supports the `-ms-box-sizing` property from version 8 upwards so you should probably be judicious with this technique or use an alternative method to get a similar effect in IE7 and below.

