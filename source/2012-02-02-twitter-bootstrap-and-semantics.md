---
title: 'Twitter Bootstrap & Semantics'
date: 2012-02-02T11:07:00+0000
tags: html, semantics, bootstrap, css
alias: post/41774610097/twitter-bootstrap-and-semantics/
---

There's a lot to like about [Twitter Bootstrap][twbootstrap]; it's a fantastic resource for getting off the ground, particularly for getting a slick-looking admin interface up and running quickly. The recent changes to accommodate responsive layouts are really impressive. I'm particularly impressed with the way [horizontal forms][hforms] stack on smaller screens (failure to accommodate small screens in form design is something I've [complained about before][tweet]). However, there are some things I'm less keen on…

<!-- more -->

Looking at the markup it seems heavy and overly concerned with presentation. In [this example layout][example] links in the top navbar have no less than 4 _divs_ between them and the top of the document. There are a lot of classes everywhere and almost all of them are concerned with presentation rather than semantics; _how_ a _div_ should look rather than what it represents. Classes like `row-fluid`, `span9` even the ubiquitous `btn` are slightly troubling as they're bleeding presentation details into the markup.

I get that these are to some extent practical considerations. Restyling all `button` elements would be disruptive for people who wanted to drop Bootstrap in to an existing site, for example. Maybe I'm being pedantic but I've worked on sites with severe div-itis and it makes things difficult both for maintenance and accommodating changes.

I can't help thinking that this…

	#!html
	      </div><!--/span-->
	    </div><!--/row-->
	  </div><!--/span-->
	</div><!--/row-->

…is a code smell.

Bootstrap is built with _[LESS][less]_ but (by default) compiles it down to CSS before any of your site's code starts interacting with the Bootstrap framework.

_LESS_ is great for structuring CSS better but I think its strengths go further.

I recently came across _[The Semantic Grid System][semanticgs]_ which really leverages the power of _LESS_ (or _[SASS][sass]_ or _[Stylus][stylus]_ if you prefer) . The _semantic.gs_ provides mixins that you use on the components of your pages. It's a full-blown responsive grid system with not a `column-container`, `row` or `grid-8` class anywhere in your markup. In fact, looking at the markup you wouldn't know the content was being laid out on a grid. It's all handled in your _LESS_ file. Want your _services_ and _clients_ sections laid out as &#8532; width blocks with your _about me_ section as a sidebar? Just declare:

	#!less
	section#services, section#clients {
	    .column(9);
	}

	aside#about-me {
	    .column(3);
	}

Instead of adding a presentational class to elements in the markup you add a mixin to the element in the _LESS_ file.

Wait a minute… Isn't that dangerously close to the separation of semantics and presentation that the invention of CSS promised us all those years ago?

[twbootstrap]:http://twitter.github.com/bootstrap/
[hforms]:http://twitter.github.com/bootstrap/base-css.html#forms
[tweet]:https://twitter.com/#!/rfletcherEW/status/161718223207804928
[example]:http://twitter.github.com/bootstrap/examples/fluid.html
[less]:http://lesscss.org/
[sass]:http://sass-lang.com/
[stylus]:http://learnboost.github.com/stylus/
[semanticgs]:http://semantic.gs/

