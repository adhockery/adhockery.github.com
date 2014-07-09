---
title: 'Grails and REST URL mappings'
date: 2013-04-15T14:12:00+0100
tags: grails, rest
alias: post/48038157692/grails-and-rest-url-mappings/
---

When building a REST-style API with Grails there's [a very handy way of configuring URL mappings][1]. For example:

	"/person/$id?"(resource: "person")

will map requests to `/myApp/person` to the different actions of `PersonController` according to the HTTP request method. The mappings are `GET`->*show*, `PUT`->*save*, `POST`->*update*, `DELETE`->*delete*.

<!-- more -->

The astute amongst you may notice that the *list* action isn't mapped. Ideally I'd want a request to `/myApp/person` with no *id* parameter to be mapped to the *list* action and `/myApp/person/1` to be mapped to *show*. The resource mapping doesn't handle this automatically, though. A request to `/myApp/person` will get forwarded to the *show* action with an *id* parameter of the empty string (or zero if the *id* parameter is typed on the *show* action's prototype).

It would be possible to detect this in the *show* action itself and forward to *list* if the *id* parameter is empty. However, that's an inappropriate coupling between the two actions.

A cleaner way would be to do this in the URL mappings:

	"/person"(controller: "person", action: "list")
	"/person/$id?"(resource: "person")

The mapping for the *list* action will only trigger if there is no *id* on the end of the URL, otherwise the standard resource URL mapping is used (note: the order of declaration is important).

Unfortunately there's a problem here – *list* isn't the only action that doesn't take an *id* parameter. This URL scheme will break the *save* action as a `PUT` request to `/myApp/person` will now go to the *list* action instead. It's possible to restrict the HTTP method for the *list* action using `allowedMethods` but that will just mean that the `PUT` request will be blocked and return a [*405*][2] HTTP status.

It's possible to get things to work by mapping the *save* action explicitly like this:

	"/person"(controller: "person", parseRequest: true) {
		action = [GET: "list", PUT: "save"]
	}
	"/person/$id"(resource: "person")

But I'm not very happy about explicitly mapping something the resource URL mapping could handle for me.

Alternatively a *Rails* style plural form like this will work:

	"/people"(controller: "person", action: "list")
	"/person/$id?"(resource: "person")

I find that gets confusing, though: Do you use "people" or "persons"? How do you handle non-standard plurals when automatically crawling REST endpoints?

[1]:http://grails.org/doc/1.3.7/guide/13.%20Web%20Services.html#13.1%20REST
[2]:http://httpstatus.es/405
