---
title: 'LESS with Modernizr and media queries'
date: 2012-10-15T12:56:00+0100
tags: less, modernizr, responsive
alias: post/41774765950/less-with-modernizr-and-media-queries/
---

One of the main advantages of [LESS][less] is [nesting](http://lesscss.org/#-nested-rules) rules for components in a structure that mirrors the DOM. However, when using [Modernizr][modernizr] you create override rules based on classes present on the root `html` tag. It would be nice to declare those override rules alongside the other rules for the same components. The same concern applies when using media queries. Luckily, there _is_ a way to do this.

<!-- more -->

[Modernizr][modernizr] is rapidly becoming ubiquitous for feature-based CSS rules. It attaches classes to the `html` element that your CSS rules can reference. For example, on the [Betamax documentation page][betamax] I have a rule to add some padding above `h2` elements in the main content when the browser supports `@fontface` (due to the rendering of the web font I'm using). In CSS the rule is:

	#!css
	#doc-content h2 {
		font-family: Kameron, Georgia, serif;
	}

    .fontface #doc-content h2 {
    	padding-top: 5px;
    }

That is; if the browser supports `@fontface` and will therefore be rendering the `h2` using _Kameron_ the padding gets added. If it is falling back to _Georgia_ then it does not.

I don't want to have the `.fontface` support rule separate from the other rules for the `#doc-content` section but since the class is on the root `html` tag it's not immediately obvious how I can continue to use nesting.

It turns out there _is_ a syntax that will let me do this, although it doesn't seem to have made it to the LESS documentation yet. Here's how you do it:

	#!less
	#doc-content {
		h2 {
			font-family: Kameron, Georgia, serif;
			.fontface & {
				padding-top: 5px;
			}
		}
	}

Note the `&` operator there. This will compile into exactly the CSS above but allow you to neatly nest your modernizr tweaks alongside the rules they augment.

You can do something similar with media queries as well. Instead of having separate sections of your LESS file for the overrides for different breakpoints you can just nest them inside other rules. In this case you don't need the `&` operator at all. For example I want to increase the font-size of that same `h2` element when the viewport is above a certain size. The CSS I want is this:

	#!css
	#doc-content h2 {
		font-size: 28px;
	}

    @media (min-width: 768px) {
      	#doc-content h2 {
	        font-size: 48px;
	    }
	}

In my LESS file I can declare the rules in a nested fashion so that the screen size specific rule appears alongside the default:

	#!less
	#doc-content h2 {
		font-size: 28px;
	    @media (min-width: 768px) {
	        font-size: 48px;
		}
	}

Again, this doesn't seem to have made it into the LESS documentation but works fine with _less.js_, _[LESS.app](http://incident57.com/less/)_ and the Ruby Gem.

[betamax]:http://freeside.co/betamax
[less]:http://lesscss.org/
[modernizr]:http://modernizr.com/

