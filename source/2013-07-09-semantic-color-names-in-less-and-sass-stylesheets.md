---
title: 'Semantic color names in LESS and Sass stylesheets'
date: 2013-07-09T14:28:00+0100
tags: sass, less, dry
alias: post/54998201300/semantic-color-names-in-less-and-sass-stylesheets
---

Most people using Sass or LESS will define variables for the palette of colors in their page. Something like:

	#!sass
	$blackish: #231f20;
	$purple: #561e31;
	$pink: #da2770;
	$off-white: #efefef;

	.header {
		background-color: $blackish;
		color: $off-white;
	}

	a {
		color: $purple;
		&:hover, &:active {
			color: $pink;
		}
	}

	blockquote {
		background-color: $blackish;
		color: $purple;
	}

This is good as far as it goes. Tweaking colors in the page is pretty easy as they only have to be changed in the variable definition.

That said, I think there are a couple of problems here. 

<!-- more -->

First, if we significantly change the color palette used in the design – or re-use the same components in a page with a different palette – the variable names become misleading. Either we need to change `$pink` to `$light-green` everywhere or we'll be listening to a lot of expletives from the next poor sap who tries to understand the stylesheet. Second, because we've used variable names descriptive of the colors themselves rather than the role they play it can be confusing trying to consistently apply the palette across the whole stylesheet. Imagine you're adding a `button` that you want to style with colors consistent with the links in the rest of the page; now was that `$pink` with `$purple` on hover?

A practive I've adopted is to define a palette with variables named like this but then *not reference them directly* in the actual CSS rules. Instead I create intermediate variables with names reflecting the context in which they are used then reference *those*. For example:

	#!sass
	$blackish: #231f20;
	$purple: #561e31;
	$pink: #da2770;
	$off-white: #efefef;

	$header-background: $blackish;
	$header-text: $off-white;
	$link-text: $purple;
	$link-text-active: $pink;
	$quote-background: $blackish;
	$quote-text: $purple;

	.header {
		background-color: $header-background;
		color: $header-text;
	}

	a {
		color: $link-text;
		&:hover, &:active {
			color: $link-text-active;
		}
	}

	blockquote {
		background-color: $quote-background;
		color: $quote-text;
	}

It's slightly more verbose but has a number of advantages:

* It's easier to understand the role the color plays in the design when you're writing new rules.
* It frees you to swap color combinations around to experiment with applying your palette in different ways.
* You can refer to the same color with different semantic names in different places (like `$link-text` and `$quote-text` in the example) and change easily change those colors independently in each context later.
* You can define a palette in an external file and load a different one for different pages or sites by changing an `@import` directive but still re-use common elements of your design – great if you're developing white-label sites.

Semantic color names can also be local in scope. Sections of the page that use variations on the palette – such as a sidebar that has a dark background and different link colors can have some variables defined locally (be careful you don't overwrite variables from the outer scope when doing this with Sass).

	#!sass
	$background: $off-white;
	$text: $blackish;

	.content {
		background-color: $background;
		color: $text;
	}

	.sidebar {
		$sidebar-background: $blackish;
		$sidebar-text: $pink;

		background-color: $sidebar-background;
		color: $sidebar-text;
	}

A big practical advantage is when you're defining multiple rules to support browsers with different capabilities. For example:

	#!sass
	$button-background: $blackish;
	$button-text: $pink;

	button {
		background-color: $button-background;
		color: $button-text;

		.rgba & {
			background-color: transparentize($button-background, .25);
		}
	}

Here I'm using a *Modernizr*-like rule to progressively-enhance for browsers that support RGBA colors – buttons will have a slightly transparent background. If I was referring to `$blackish` directly there and later got an updated design where buttons are now purple I'd have to fix up both variable references. Two references are manageable but those kind of changes can get pretty out-of-hand when you're dealing with a reasonably complex design. With my approach to color variables you're also much less likely to miss a reference (which would be fun to unpick 6 months later; *Why is this one different? Is that a mistake? Is there a reason this button is black when the browser supports HTML5 video but purple otherwise?*)

This approach does require some discipline but the payoff comes down the line when you have to make design changes or apply components in a different context.
