---
title: 'Date and time inputs vs. usability'
date: 2011-03-06T20:08:00+0000
tags: ux, html5, forms
alias: post/42903176615/date-and-time-inputs-vs-usability/
---

Form input controls for date/time values have always been problematic. The more I experiment with different options, the more I think there is no one-size-fits-all solution.

<!-- more -->

## Calendar widgets

Calendar widgets such as the [Opera HTML5 date input][1] are very popular and can be a slick looking addition to a form. I don't think they're entirely positive though and certainly don't work in all situations. They're great when you don't know exactly the date you want (_I want to book a flight around Easter time_) or you need to have an overview of the calendar (_I need to set a reminder for [GGUG][2] on the third Tuesday of every month_). However, when trying to enter your date of birth the widget is just in the way. Even if the widget is keyboard accessible and doesn't force you to page month-by-month to the correct year you can almost certainly type the date quicker than you can find and select it in a calendar widget.

## Multi-field inputs

A multi-field input works well for entering familiar dates such as your date of birth or for transcribing data. They're not so good when you need the context a calendar widget affords (please don't force your users to mentally calculate what date the 3rd Tuesday of next month is).

With a multi-field input it's vital to remember that users in different places will expect to enter dates in a different order. For example, here in the UK we use the completely logical _dd mm yyyy_ order whilst an American will, bizarrely, want to put the month before the day. It's not particularly difficult to build a tag that renders the fields in a different order according to the request locale. Using [the HTML5 _placeholder_ attribute][3] (or a suitable fallback for older browsers) is invaluable to ensure that users know which field is which.

A possible optimisation is to auto-tab between fields after the user has typed the requisite number of digits. In that case you should allow for the user to correct mistakes, so backspacing or using the cursor keys should also automatically jump between fields otherwise the auto-tabbing behaviour becomes more a hinderance than a help for fat-fingered typists like me.

## Selects in a multi-field input

It's very common to use a `select` input for some or all portions of the date. Personally, I pretty much detest this practice as it combines all the inconvenience of a calendar widget with none of the contextual information. [Grails' &lt;g:datePicker&gt; tag][4] does exactly this. Not only are `select` elements like this bulking out the page with huge option lists (Grails' datePicker dumps 8.6Kb of markup in your page _without_ time fields!) but they are cumbersome to input values into with the keyboard because so many values start with the same character. An arguable exception is a `select` for the month field as presenting textual values rather than numbers is a little friendlier and the option list is short enough and the values distinct enough to allow for reasonably quick keyboard selection.

I suspect the rationale for using `select` elements is often that it all but ensures the user can't enter an invalid value (I've even seen significant hoop-jumping done in Javascript to ensure values such as _30th February_ can't be entered). I think it's preferable to give the user a clear input and trust them to do the right thing with it rather than forcing them to use an awkward input so that they _can't_ get it wrong.

## Simple textual inputs

You shouldn't rule out using just a basic text input. In fact for monotonous data entry purposes it is probably optimal. The keystrokes to enter a date become muscle memory and there's no fiddling about tabbing between day, month and year fields or grabbing the mouse to pick options from a select element. Obviously the down-side is that a plain text input is error-prone and very liable to confuse users unless the expected format is made clear.

## HTML5

HTML5 specifies [various new date and time input types][5] which seems like good news but has some significant drawbacks at the moment. I can only imagine the new input types are designed to be rendered as native browser widgets (currently only Opera actually does so) as the required format is just about the most inconvenient imaginable for text entry. Sure, as a developer it's appealing to require that dates have to be entered as `yyyy-mm-dd` as you no longer have to support varied input formats but no user in the world would naturally type a date that way. Therefore, to make such inputs usable you really need to use Javascript to proxy them with a widget or a set of multi-field inputs. Fine, but what about users who disable Javascript or use mobile or assistive devices that might not cope particularly well with the widgets? The fallback - a text input into which the user must type a [machine-readable RFC3339 date][6] - is pretty unfriendly.

What's worse is that Webkit based browsers such as Chrome and Safari will render the new input types as regular text inputs but refuse to submit a form containing incorrectly formatted values and unbelievably provide no user feedback whatsoever when they do so.

I'm inclined to think that the useful support for the new input types is so minimal and the actively user-hostile handling of them so much more widespread that they're best avoided altogether.

So, to sum up:

* Think about who your users are and what they are trying to accomplish with _this particular_ input field and give them the right input for the job at hand.
* If they need to type some or all of the value make sure it's clear what format is expected or which field is which.
* Allow for people to enter values in the order they are comfortable with and above all _don't_ force them to type it in a machine-readable format.
* Don't strand Chrome and Safari users with broken HTML5 input types.

[1]: http://jqueryui.com/demos/datepicker/ "&lt;input type=&quot;date&quot;&gt; and other date/time controls at Dev.Opera"
[2]: http://twitter.com/#!/LondonGGUG "London Groovy &amp; Grails User Group on Twitter"
[3]: http://diveintohtml5.org/forms.html#placeholder "Placeholder Text at Dive Into HTML5"
[4]: http://grails.org/doc/latest/ref/Tags/datePicker.html "datePicker tag in the Grails user guide"
[5]: http://diveintohtml5.org/forms.html#type-date "Date Pickers at Dive Into HTML5"
[6]: http://tools.ietf.org/html/rfc3339#section-5.8 "Examples of RFC3339 date values"

