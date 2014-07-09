---
title: Enabling Groovy's "invokedynamic" support in Gradle
date: 2014-06-24
tags: groovy, invokedynamic, gradle
---

I posted [previously](/post/89759686171/gradle-and-groovys-invoke-dynamic-support) about configuring a Gradle project to ensure that only the _indy_ version of Groovy (that is the variant that supports Java 7's _invokedynamic_ bytecode instruction) is included in the dependency graph. However, just including that version of the Groovy jar is **not** enough to make your Groovy code compile in such a way that it uses _invokedynamic_.

In addition to including the right version of the jar you need to configure Gradle's `GroovyCompile` task like this:

    tasks.withType(GroovyCompile) {
      groovyOptions.optimizationOptions.indy = true
    }

If you want to check the code is being compiled correctly the easiest way I've found to do so is to use `javap` to read the bytecode form a class file and see if there are any _invokedynamic_ instructions. Here's an example:

    javap -v -cp build/classes/test co.freeside.jdbi.time.LocalDateSpec | grep invokedynamic

If the class is compiled with the _indy_ option set you'll see some output. Here's what I get from that class:

     3: invokedynamic #46,  0             // InvokeDynamic #0:init:(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Object;
     8: invokedynamic #52,  0             // InvokeDynamic #1:cast:(Ljava/lang/Object;)Lorg/skife/jdbi/v2/tweak/ResultSetMapper;
     2: invokedynamic #62,  0             // InvokeDynamic #2:getProperty:(Ljava/lang/Class;)Ljava/lang/Object;
     7: invokedynamic #52,  0             // InvokeDynamic #1:cast:(Ljava/lang/Object;)Lorg/skife/jdbi/v2/tweak/ResultSetMapper;
     3: invokedynamic #70,  0             // InvokeDynamic #3:getProperty:(Lco/freeside/jdbi/time/LocalDateSpec;)Ljava/lang/Object;
     8: invokedynamic #76,  0             // InvokeDynamic #4:invoke:(Ljava/lang/Class;Ljava/lang/Object;)Ljava/lang/Object;
    13: invokedynamic #79,  0             // InvokeDynamic #1:cast:(Ljava/lang/Object;)Ljava/time/LocalDate;
    32: invokedynamic #95,  0             // InvokeDynamic #1:cast:(Lgroovy/lang/GString;)Ljava/lang/String;
    35: invokedynamic #95,  0             // InvokeDynamic #1:cast:(Lgroovy/lang/GString;)Ljava/lang/String;
    32: invokedynamic #95,  0             // InvokeDynamic #1:cast:(Lgroovy/lang/GString;)Ljava/lang/String;

Of course, bear in mind that not all classes will contain any _invokedynamic_ instructions. If you've used `@CompileStatic` for example method calls are not dispatched dynamically.

**Edit:** [Cédric Champeau pointed out](https://twitter.com/CedricChampeau/status/481451226790645760) that you should use JDK 7u60 or above to avoid any potential _invokedynamic_ related bugs.
