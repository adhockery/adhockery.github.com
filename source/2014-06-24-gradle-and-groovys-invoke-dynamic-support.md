---
title: Gradle and Groovy's Invoke Dynamic support
date: 2014-06-24
tags: groovy, invokedynamic, gradle
---

Since version 2.0 the Groovy distribution has included an alternate artifact that enables [invoke dynamic](http://docs.oracle.com/javase/7/docs/technotes/guides/vm/multiple-language-support.html#invokedynamic) support.

You can include that in a Gradle project by specifying a dependency like this:

    compile "org.codehaus.groovy:groovy-all:2.3.3:indy"

READMORE

However if you have other libraries that depend on groovy they may pull in the regular version transitively giving you two versions of Groovy in your dependency graph. This happens to me a lot with Spock which depends on _groovy-all:2.0.5_. For example I probably have a dependency like this as well:

    testCompile "org.spockframework:spock-core:0.7-groovy-2.0"

I noticed that the _External Libraries_ section of the project tree in _IntelliJ IDEA_ contained two _groovy-all_ jars. One is _groovy-all-2.3.3_ and the other is _groovy-all-2.3.3-indy_. That's not good. I only want the _indy_ version.

To debug where the dependency is coming from you can use Gradle's `dependencyInsight` target like this:

    gradle dependencyInsight --dependency groovy-all

By default the `dependencyInsight` only searches the _compile_ configuration and you may well see nothing there. You can search other configurations by adding an argument on the command line. For example:

    gradle dependencyInsight --dependency groovy-all --configuration testCompile

The output from the command looks like this:

    :dependencyInsight
    org.codehaus.groovy:groovy-all:2.3.3 (conflict resolution)
    \--- compile

    org.codehaus.groovy:groovy-all:2.0.5 -> 2.3.3
    \--- org.spockframework:spock-core:0.7-groovy-2.0
         \--- testCompile

Here we can see _groovy-all_ version _2.3.3_ explicitly included as a _compile_ dependency **and** pulled in transitively by Spock. Gradle's conflict resolution has selected version _2.3.3_ but what the output doesn't show us is the variant. It doesn't appear to be possible to tell whether the _indy_ or regular flavor of _groovy-all_ is pulled in.

To fix this I first tried forcing the version with:

    configurations.all {
      resolutionStrategy {
        force "org.codehaus.groovy:groovy-all:2.3.3:indy"
      }
    }

The `dependencyInsight` output changed a little:

    :dependencyInsight
    org.codehaus.groovy:groovy-all:2.3.3 (forced)
    \--- compile

    org.codehaus.groovy:groovy-all:2.0.5 -> 2.3.3
    \--- org.spockframework:spock-core:0.7-groovy-2.0
         \--- testCompile

However, I could still see both versions of _groovy-all_ in IDEA's project tree. It looks like the _force_ resolution strategy doesn't take into account the variant you request.

Unfortunately the only way to get evict the regular _groovy-all_ jar from the dependency tree seems to be to explicitly exclude it from every dependency that pulls it in transitively. For example:

    testCompile("org.spockframework:spock-core:0.7-groovy-2.0") {
      exclude module: "groovy-all"
    }

Finally the extra jar is gone from IDEA.
