---
title: 'On organizing files and directories in Angular apps'
date: 2013-09-02T10:07:00+0100
tags: angular, js
alias: ["post/60062381788/on-organizing-files-and-directories-in-angular-apps/"]
---

I've been working on an [Angular JS][3] project for the past few weeks. It's not the first time I've used Angular but it is the first time I've used the [*generator-angular*][1] package for [Yeoman][2]. Having the ability to quickly generate skeletons for new components is really nice but there's one thing that rubs me up the wrong way – the way the genenerated code is organized on the file system.

<!-- more -->

When I use a commands like

    yo angular:controller cocktail
    yo angular:service cocktail
    yo angular:directive cocktail

the generator will create the following files:

    .
    ├── app
    |   └── scripts
    |       └── controllers
    |       |   └── cocktail.coffee
    |       └── directives
    |       |   └── cocktail.coffee
    |       └── services
    |           └── cocktail.coffee
    └── test
        └── spec
            └── controllers
            |   └── cocktail.coffee
            └── directives
            |   └── cocktail.coffee
            └── services
                └── cocktail.coffee

The commands group the generated components into subdirectories based on what *type of* component they are. So far I've gone along with it because – like any good programmer – I'm lazy. But as the project has grown (currently 6 controllers, 2 directives, 2 filters & 7 services) it's started to bother me more & more. I've decided to spend an hour or so re-arranging things.

Why? Well for a start the fact that if I have a controller a service and a set of directives for a logical domain concept – let's stick with *cocktail* for now – they, and their tests will *all* be called `cocktail.coffee`. That makes for a lot of screwing around in Sublime Text trying to figure out which tab is which.

That's easy to deal with, though – I can specify a different name on the command line or rename the files. What I really don't like is that those files which all deal with the same domain concept are scattered across 3 different sub-directories just because they are different artifact types. That to me is not a useful way to organize things. It doesn't ease the task of the programmer trying to understand how the awesome *cocktail* functionality I've written works.

Code should be organized by the domain concepts it deals with. That *does* aid comprehension. It's indicative of what components are likely to be most (appropriately) coupled with one another. It helps you see inappropriate coupling when writing code. It allows you to use the spatial relationships between files to intuit something about the likely releationships between them. Directory depth becomes meaningful – it conveys a separation of abstraction (shallower) from detail (deeper).

I'd far rather have a layout like

    .
    ├── app
    |   └── scripts
    |       └── cocktail
    |           └── cocktail-controller.coffee
    |           └── cocktail-directives.coffee
    |           └── cocktail-resource.coffee
    └── test
        └── spec
            └── cocktail
                └── cocktail-controller.spec.coffee
                └── cocktail-directives.spec.coffee
                └── cocktail-resource.spec.coffee

Not perfect by any means – [Smurf naming][4] is ugly and class names that start with the last component of the package name get picked up by certain Java static analysis tools and with good reason. At least everything to do with *cocktails* is in one place and I can tell by looking at the file name what components are in what files.

I should point out that I don't lay the blame for this at the door of the *generator-angular* developers. They're following the convention laid out in the Angular documentation and countless examples such as [Brian Ford's very popular post on best practices for large Angular apps][5]. The blame is really mine for being too lazy to not move & rename the files the generator creates, just create them manually or better yet patch the generator.

The first time I recall seeing the "directory per artifact type" pattern for arranging files was around 2005 when I first did some work with Rails. A very similar layout was adopted by Grails which I've worked with a lot over the past 6 years. In early Grails releases the documentation tended to gloss over the possibility of using standard Java packages for Grails artifacts & even now I often see package names such as *com.company.project.domain* containing all the domain classes and *com.company.project.controllers* containing all the controllers. No. Stop it.

With Rails & Grails you have to use the directory structure – controllers won't behave like controllers if declared anywhere else, for example. In Grails you can overcome it by using sensible package names and an IDE that organizes your code by package rather than by directory. In an Angular JS project there are no restrictions, though. You can organize the code in any way that suits you.

[1]:https://github.com/yeoman/generator-angular
[2]:http://yeoman.io/
[3]:http://angularjs.org/
[4]:http://www.codinghorror.com/blog/2012/07/new-programming-jargon.html
[5]:http://briantford.com/blog/huuuuuge-angular-apps.html

