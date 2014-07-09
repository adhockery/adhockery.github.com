---
title: 'Rendering Grails Joda-Time date inputs cross browser with HTML5, jQuery and Modernizr'
date: 2010-07-10T14:30:00+0100
tags: html5, joda time, jquery
alias: post/42903051745/rendering-grails-joda-time-date-inputs-cross-browser
---

Yesterday I released a new version of the Grails [Joda Time plugin][3]  that includes support for the various new [date and time input types](http://diveintohtml5.org/forms.html#type-date) in the HTML5 standard. Right now only [Opera][4] supports these types with proper date-picker type controls, the other browsers just render them as text inputs. However this doesn't mean you can't or shouldn't start using them right away. There's a very handy JavaScript library called [Modernizr][5] that you can use to detect the features supported by the client's browser and render alternatives using script. In this post I'm going to walk through how to combine the Joda-Time plugin, Modernizr and the [jQuery datepicker][6] to render an HTML5 _date_ input field that will bind to a _LocalDate_ property on a domain object.

<!-- more -->

## Install the Joda-Time plugin

If you don't currently have version 1.1+ of the Joda-Time plugin installed, run `grails install-plugin joda-time`.

Once the plugin is installed you will need to enable HTML5 support so that data binding will use the HTML5 date/time formats. Simply add the following to your _Config.groovy_

    jodatime.format.html5 = true

## Create a domain class with a LocalDate property

For this example I'll create a simple domain class representing a person:

    import org.joda.time.*
    import org.joda.time.contrib.hibernate.*

    class Person {
        String name
        LocalDate birthdate
        static mapping = {
            birthdate type: PersistentLocalDate
        }
    }

If you have default mappings set up (which the Joda-Time plugin will attempt to do for you when it installs) then you can omit the _mapping_ block but I've included it for completeness.

Execute `grails generate-all Person` to create a controller and scaffolded views for the _Person_ class. Finally change the _create.gsp_ and _edit.gsp_ files to use an HTML5 input instead of the standard Grails date picker tag. Replace the `<g:datePicker name="birthdate"…` with this:

    <joda:dateField name="birthdate" value="${personInstance.birthdate}"/>

In the unlikely event that all your site's visitors are using Opera then your work is done at this point. However right now anyone using another browser will have to type in the _birthdate_ value in the correct format in order to get the forms to submit properly which isn't the friendliest user experience.

## Install jQuery and jQuery-UI

You can include jQuery and jQuery-UI by simply downloading the JavaScript files into your app, or linking to them on Google. Alternatively you can use the Grails plugins. If you want to go the plugin route this is what you will need to do. First install the plugins:

    grails install-plugin jquery-ui

The jQuery plugin is installed automatically by the jQuery-UI plugin.

Then you will need to add the libraries to your SiteMesh template (or you could include it just on the relevant pages, it doesn't matter). Add the following in the _head_ section:

    <g:javascript library="jquery" plugin="jquery"/>
    <jqui:resources components="datepicker" mode="normal" />

## Install Modernizr

Download Modernizr and put it in _web-app/js/modernizr_. You can link to the script direct from there or define a library by adding this to _BootStrap.groovy_:

    import org.codehaus.groovy.grails.plugins.web.taglib.JavascriptTagLib

    class BootStrap {
        def init = { servletContext ->
             JavascriptTagLib.LIBRARY_MAPPINGS.modernizr = ["modernizr/modernizr-1.5.min"]
        }

Then include Modernizr in your SiteMesh template by adding the following in the _head_ section:

    <g:javascript library="modernizr"/>

To get Modernizr to work its magic you should add a `class="no-js"` to the _html_ element at the top of your SiteMesh template. Modernizr will replace this when the document loads with a whole bunch of classes that it uses to detect the various features supported by the browser.

## Bind the jQuery-UI datepicker to the field

The last step is to ensure that any time a user hits the page with a browser that doesn't support a native widget for the _date_ input type they get a jQuery datepicker instead. To do this create a JavaScript file and link to it from your SiteMesh template or the pages using _date_ inputs. The script simply needs to contain the following code:

    $(document).ready(function() {
        if (!Modernizr.inputtypes.date) {
            $("input[type=date]").datepicker({dateFormat: $.datepicker.W3C});
        }
    });

What this does is create a function that runs on page load that uses Modernizr to determine if the _date_ input type is supported and if not initialises a jQuery-UI datepicker for _every_ `<input type="date"…` found in the page. The `dateFormat` argument ensures the jQuery widget will update the input with the correct date format when a value is selected.

It's that simple. Now the _create_ and _edit person_ pages will use the native _date_ input widget when the visitor's browser supports one and the jQuery widget when it doesn't.

So how does it look? Here's a screenshot of the page in Firefox when a visitor has focused the _date_ input:
![image][1]
Here's the same thing rendered in Opera using the native datepicker widget (yes, you could be forgiven for thinking the jQuery version is prettier):
![image][2]
With a little adaptation the same thing can be done for the other input types; _month_, _week_, _time_, _datetime_ and _datetime-local_. Of those _month_ should work perfectly by adding this to your script:

    if (!Modernizr.inputtypes.month) {
        $("input[type=month]").datepicker({dateFormat: 'yy-mm');
    }

Other types would require different widgets to enable users to input the time portion of the value. There are several jQuery based options available. Of course, instead of jQuery you could use [YUI][7], [script.aculo.us][8] or any other date/time widgets. I've gone with jQuery because I'm familiar with it and the initialisation is beautifully simple even if you've got a number of different inputs on a page.

[1]: http://3.bp.blogspot.com/_fh9xwLFYBUw/TDh2YQnv0KI/AAAAAAAACoQ/3ToRH0Ga3iI/s320/firefox.png
[2]: http://4.bp.blogspot.com/_fh9xwLFYBUw/TDh2akA7KeI/AAAAAAAACoY/73k5rC-uWww/s320/opera.png
[3]: http://grails.org/plugin/joda-time "HTML5 Date pickers"
[4]: http://opera.com "Opera web browser"
[5]: http://www.modernizr.com/
[6]: http://jqueryui.com/demos/datepicker/
[7]: http://developer.yahoo.com/yui/calendar/
[8]: http://script.aculo.us/

