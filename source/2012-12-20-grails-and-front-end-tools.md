---
title: 'Grails & front end tools'
date: 2012-12-20T21:23:00+0000
tags: grails, css, javascript, grunt, codekit, handlebars
alias: post/41774804245/grails-and-front-end-tools
---

Last week was the London Groovy & Grails Exchange 2012 where I gave a talk called [Grails for hipsters][grailsforhipsters] about integrating Grails apps with some of the buzziest current tools & techniques. Part of what I talked about was my approach to handling pre-processed front-end resources in Grails apps. In [the demo app][hipsteroid] for my talk I used [LESS][less] & [CoffeeScript][coffeescript] but everything I discusses applies equally to [SASS][sass], [Stylus][stylus], [TypeScript][typescript], etc.

I've been using external tools - specifically [Grunt][grunt] or [CodeKit][codekit] - to pre-process resources during development rather than using extensions of the [Grails Resources plugin][resources]. In my setup Resources is only aware of the final JavaScript & CSS files.

<!-- more -->

## Handling resource graphs

The Resources plugin is very effective when handling individual JavaScript or CSS files but LESS confuses things with its ability to import other files. For example you can import a file containing common variables & mixins into several different page specific LESS files. CoffeeScript has an import syntax too although it's less frequently used.

When using the [LESS CSS Resources plugin][lesscssresources] you only declare the *importing* LESS file as a resource not the one being imported (or you would end up with duplicate sections in the resulting CSS resource bundle).

If `page.less` contains `@import "common.less";` you want the CSS resource to be regenerated when *either* file changes during development. However, since the Resources plugin is only aware of `page.less` - the leaf node in the resource graph. It won't respond to changes made in `common.less`.

Pre-processing tools like CodeKit or Grunt *can* be aware of imports (or can just rapidly regenerate files when *anything* in the source path changes). The Resources plugin then spots that the compiled `.css` / `.js` file has changed and refreshes. I'm still using the plugin to handle bundling, concatenation & minification which it does very well.

I always set the Resources plugin to run in debug mode when running Grails apps in development mode. To do that you simply add this to `Config.groovy`:

	#!groovy
	environments {
		development {
			grails.resources.debug = true
		}
	}

In debug mode Resources doesn't bundle, concatenate or minify files & reloading of changed resources is seamless.

Could the Resources plugin do all this for us in the future? I guess it's possible. It would need to understand dependencies for resource files so that changes in imported files were detected. The problem is that LESS, SASS, Stylus, CoffeeScript, etc. all have their own import mechanisms so they would need to be handled differently.

## Speed

Grunt and most other command-line pre-processors use the V8 JavaScript engine. It's fast. Extensions to the Resources plugin mostly either use Java ports of the original tools or run the JavaScript in a Rhino container. I've certainly experienced lag between saving files and resources updating which is not the case when using external tools to watch and pre-process files.

## Enhanced workflow

CodeKit is particularly nice for developing CSS as it will apply changes with a CSS transition. I find this a great way to work on visual changes & it's finally enabled me to move beyond the "try stuff out in the browser dev tools panel then copy & paste back to CSS" workflow that I've been using. On a big monitor I vertically split the screen between my editor & the browser, as soon as I hit save in the editor CodeKit refreshes the browser & I can see the changes transition into place. Sounds like a small thing but I've found it pretty revelatory.

## Why deploy source code?

Only the generated CSS and JavaScript files are actually required for deployment. There's really no need to bundle the original LESS or CoffeeScript in the application WAR file. These are purely development-time artefacts, equivalent to the Groovy & Java source files in a Grails application. Why compile them each time during application startup?

## Tool options

Grunt & CodeKit are just two options for automatically processing files. There are a bunch of others; [Guard][guard], [LiveReload][livereload] or [Brunch][brunch] would all work well, for example.

## Downsides

In my demo app I'm using [Handlebars][handlebars] templates and they need to be compiled to JavaScript. Unfortunately CodeKit doesn't currently do that which is why I added a Grunt build. There is a [handlebars-resources][handlebarsresources] Grails plugin but I haven't tried using it yet.

## Feedback

I'd love to hear any differing experiences. Are there people successfully Resources extensions to pre-process everything? Am I missing something with the way I've tried to do it in the past?

[brunch]:http://brunch.io/
[cachedresources]:http://grails.org/plugin/cached-resources
[codekit]:http://incident57.com/codekit/
[coffeescript]:http://coffeescript.org/
[commonjs]:http://www.commonjs.org/
[es6modules]:http://addyosmani.com/blog/ecmascript-6-resources-for-the-curious-javascripter/
[grailsforhipsters]:http://skillsmatter.com/podcast/groovy-grails/grails-for-hipsters
[grunt]:http://gruntjs.com/
[guard]:http://rubydoc.info/gems/guard/frames
[handlebars]:http://handlebarsjs.com/
[handlebarsresources]:http://grails.org/plugin/handlebars-resources
[hipsteroid]:http://git.io/hipsteroid
[less]:http://lesscss.org/
[lesscssresources]:http://grails.org/plugin/lesscss-resources
[livereload]:http://livereload.com/
[requirejs]:http://requirejs.org/
[resources]:http://grails.org/plugin/resources
[sass]:http://sass-lang.com/
[stylus]:http://learnboost.github.com/stylus/
[typescript]:http://www.typescriptlang.org/

