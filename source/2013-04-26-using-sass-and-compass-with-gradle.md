---
title: 'Using SASS and Compass with Gradle'
date: 2013-04-26T13:58:00+0100
tags: gradle, sass
alias: post/48926142330/using-sass-and-compass-with-gradle
---

I recently started helping with the [Ratpack][13] website. It is (or will be) a Ratpack app & built with Gradle. I started prototyping with a simple webapp created with [Yeoman][4] and using [SASS][7] and [Compass][8] for authoring CSS. When I migrated the work-in-progress into the [*ratpack-site* application][5] I initially used [Ted Naleid's method][6] of calling Yeoman's [Grunt][14] tasks from Gradle. Unfortunately this meant there were rather a lot of build dependencies. In order to build the app you would need Node.js, Ruby and the Compass gem installed. Peter Ledbrook pointed out this could frustrate potential contributors & Marcin Erdmann [proved an example][1] of what he meant. Clearly I needed to simplify.

<!-- more -->

SASS, particularly with Compass, is great for CSS authoring. Mixins & functions like [`contrasted`][9] or [`image-height`][10] and the [vertical rhythm][11] support have become invaluable to me. However, they are Ruby gems with no ports to other languages.

I wanted to at least try to get it working before giving up and using LESS. I found a few posts where people had done something similar but mostly they were either half-complete, using older Gradle syntax or exhibiting the same dependency problems I already had. They did give me the idea to use JRuby to run SASS, though.

I came across several solutions that advised either packaging desired gems in a jar file or actually re-packing the JRuby jar with additional gems installed. Neither of these appealed to me. I didn't want to publish new binary artifacts or untangle any potential licensing issues. It seemed to me that I should be able to use JRuby to install the gems I needed somewhere local to the build and then refer to them.

## Installing Ruby gems

First I created a Gradle task called *installGems* to install the *compass* gem. This uses the Gradle *JavaExec* task to run `gem install` using JRuby and specifies the path to install the gems as `.jruby/gems`. That directory is also the task's *output* so that further tasks can depend on it as part of the incremental build.

JRuby itself is added to a new dependency scope since I'm only using it for running build tasks, not as part of the application itself.

	configurations {
	    jruby
	}

	dependencies {
	    jruby 'org.jruby:jruby-complete:1.7.3'
	}

	ext {
		gemsDir = file('.jruby/gems')
	}

	task installGems(type: JavaExec) {
		outputs.dir gemsDir

		classpath = configurations.jruby
		main = "org.jruby.Main"
		args "-S gem install -i $gemsDir --no-rdoc --no-ri compass".tokenize()

		doFirst {
			gemsDir.mkdirs()
		}
	}

Initially I installed the gems under `build` but that would mean any time `gradle clean` is run they will be deleted. Since they are not particularly fast to install and shouldn't change I moved them elsewhere.

## Compiling SASS

Next I created a *compileSass* task. The trick is to supply two environment variables; *GEM_PATH* which tells JRuby where to look for installed gems and *PATH* pointing to the `.jruby/gems/bin` directory where the *compass* executable is installed.

The *compileSass* task's *inputs* are the *outputs* of *installGems* – meaning *installGems* is run automatically if necessary – along with the directories containing my *.scss* files, images and JavaScript. The task's *output* is the directory with the compiled CSS.

	ext {
		cssDir = file(/* output dir where CSS should go */)
		sassDir = file(/* location of .sass / .scss files */)
		imagesDir = file(/* location of images */)
		javascriptsDir = file(/* location of javascripts */)
	}

	task compileSass(type: JavaExec) {
		outputs.dir cssDir
		inputs.files installGems
		inputs.dir sassDir
		inputs.dir imagesDir
		inputs.dir javascriptsDir

		classpath = configurations.jruby
		main = "org.jruby.Main"
		args "-S compass compile --sass-dir $sassDir --css-dir $cssDir --images-dir $imagesDir --javascripts-dir $javascriptsDir --relative-assets"
		environment 'GEM_PATH', gemsDir
		environment 'PATH', "$gemsDir/bin"

		doFirst {
			cssDir.mkdirs()
		}
	}

I also added *compileSass* into the task dependency chain so it would automatically run when needed:

	processResources.inputs.files compileSass
	clean.dependsOn cleanCompileSass

I then created my own *JRubyExec* task type that extends *JavaExec* to bundle together some of the commonalities between *installGems* and *compileSass*.

## Watching for changes

The next step was to use the `compass watch` command to automatically recompile SASS changes while the application is running. The *ratpack-site* app uses the [Gradle application plugin][12] to provide a *run* task. I needed to create a background thread that runs `compass watch`. I couldn't figure out how to re-use my *JRubyExec* task here as I needed to use the imperative style of calling `project.javaexec` so I've ended up with some duplication. It does work, though, which is the main thing.

	task watchSass {
		doFirst {
			cssDir.mkdirs()

			Thread.start {
				project.javaexec {
					classpath = configurations.jruby
					main = 'org.jruby.Main'
					args "-X-C -S compass watch --sass-dir $sassDir --css-dir $cssDir --images-dir $imagesDir --javascripts-dir $javascriptsDir --relative-assets".tokenize()
					environment 'GEM_PATH', gemsDir
					environment 'PATH', "$gemsDir/bin"
				}
			}
		}
	}
	run.dependsOn watchSass

## Performance tuning

Once everything was working I spent a little time performance tuning. The JRuby wiki has [some tips about JVM flags][2] useful for JRuby execution & I added `-client -XX:+TieredCompilation -XX:TieredStopAtLevel=1` which improved things a little. Following [a tip found on Charles Nutter's blog][3] I also added `-X-C` to the JRuby command itself which disables the JRuby JIT compiler which also seemed to help a little.

Compiling SASS this way is still slower than using native Ruby – either standalone or via Grunt – but it's not painfully slow and the tradeoff in terms of build simplicity is worth it.

## Next steps

This is not a perfect or finished solution. It contains some duplication, a mixture of declarative and imperative task styles, no proper *sourceSet* for SASS. When time permits I'd like to get this bundled up as a proper Gradle plugin or possibly two – one for generic JRuby execution and another specifically for SASS.

I should also point out that Marcin Erdmann and Luke Daley were a big help in getting this soluton working. My Gradle-fu is shaky at best and they helped me a lot with declaring the incremental build properly and getting the background thread for the *watchSass* task working.

[1]:https://twitter.com/marcinerdmann/status/325675229454155776
[2]:https://github.com/jruby/jruby/wiki/PerformanceTuning#java-virtual-machine-jvm-settings
[3]:http://blog.headius.com/2010/03/jruby-startup-time-tips.html
[4]:http://yeoman.io/
[5]:https://github.com/ratpack/ratpack-site
[6]:http://naleid.com/blog/2013/01/24/calling-gruntjs-tasks-from-gradle/
[7]:http://sass-lang.com/
[8]:http://compass-style.org/
[9]:http://compass-style.org/reference/compass/utilities/color/contrast/
[10]:http://compass-style.org/reference/compass/helpers/image-dimensions/
[11]:http://compass-style.org/reference/compass/typography/vertical_rhythm/
[12]:http://www.gradle.org/docs/current/userguide/application_plugin.html
[13]:https://github.com/ratpack
[14]:http://gruntjs.com/

