---
title: 'Hacking on Grails scaffolding templates'
date: 2009-06-13T05:51:00+0100
tags: css, scaffolding
alias: post/42902452839/hacking-on-grails-scaffolding-templates/
---

Grails scaffolding is a fantastic mechanism for getting you up and running quickly. I love the fact that you can provide your own implementation of _some_ controller actions or views and scaffolding will just fill in the gaps. That way you can start hand-crafting things when complexity increases past a certain point but still have Grails do a bunch of work for you.

I'd done some customising of scaffolding templates before for the [Joda Time plugin][2] but recently started playing with them again with a view to creating some I could re-use for future projects. Because scaffolding templates are not only used for dynamic views but also provide the basis of generated views that you go on to customise it's worth having a solid baseline. A couple of things I wanted to do were:

1. Mark up create and edit forms without using tables
2. Provide automatic indication of mandatory fields

<!-- more -->

![image][1]
I'm pretty happy with the result. This is how a standard create form now appears. The grab is from Safari 4 but the rendering is all but consistent across Firefox 3 on my Ubuntu box, Safari 4 on my Mac and even IE6, IE7, Google Chrome and Opera 9 on the Windows XP [VirtualBox][3] instances I use for cross-browser testing.

## Forms Without Tables

Each form element is simply:

        <label for="${p.name}">Property Name</label>
        ${renderEditor(p)}

Which is reasonable semantic markup. Styling it cross-browser took me a while (I know just enough CSS to make me dangerous) but with a few helpful pointers from our resident front-end guru [Jeff][4] I was able to achieve that with a lot less browser-specific tweaking than I would have thought would be necessary.

The necessary CSS is just:

    .prop {
        margin: 1em 0;
    }
    label {
        display: inline-block;
        margin-right: 1.5em;
        text-align: right;
        width: 8em;
    }
    input, select {
        vertical-align: middle;
    }
    textarea {
        vertical-align: top;
    }

Making the label `inline-block` meant I can apply a width to it so all the fields will line up nicely but also keeps the label inline so I can then use `vertical-align` on the input to centre it on the text line of the label. The results are consistent cross-browser. Most solutions I've seen around the internet are horribly inconsistent between browsers (and operating systems with different font rendering) and often rely on nasty pixel-perfect margin and padding tweaks to try to align things nicely. That approach rapidly becomes a game of whack-a-mole as a tweak that fixes some alignment on IE will screw it up on Opera, fixing that will make Firefox do something odd, etc.

## Automatically Indicating Mandatory Fields

A polite form should really indicate to the user what fields are mandatory and it turns out this isn't hard to achieve automatically in Grails scaffolded views. The scaffolding templates already use the [constrained properties][5] of the domain class to determine whether to display a form field for each property. It's a very small step to use the _isNullable()_ and in the case of String properties _isBlank()_ methods to decide whether to render a mandatory indicator.

I simply output a span with an asterisk inside the label then styled it with:

    label {
        /* other label properties as above */
        position: relative;
    }
    label .mandatory {
        color: #c00;
        position: absolute;
        right: -1.25em;
    }

The absolute positioning takes the asterisk out of the flow of the page so the labels and inputs line up neatly regardless of whether there's an asterisk or not and the `right: -1.25em` shoves it over into the space of the label's right margin. Positioning the asterisk perfectly in between the label and the input is tricky and not reliable cross browser. On IE the asterisk is too far to the right.

I tried other techniques such as disabling the label's right margin when the asterisk is present and setting the asterisk's span to the exact same size the margin would have been. Unfortunately it seems 1.5em as an element width is not _quite_ the same thing as 1.5em as a right margin so the alignment of the labels and inputs was thrown off. Absolute positioning is necessary to maintain that alignment which is far more important to the eye than pixel-perfect placement of the asterisk itself.

## Source Code

Here's the source code. Any suggestions for improvements would be very welcome. I based the templates on [Marcel Overdijk][6]'s excellent [i18n-templates][7], the only differences are in the rendering of the form fields and the surrounding _fieldset_.

* [web-app/css/forms.css][8] (needs to be added to grails-app/views/layouts/main.gsp)
* [src/templates/scaffolding/create.gsp][9]
* [src/templates/scaffolding/edit.gsp][10]

Something this exercise has driven home for me is that when it comes to cross-browser styling less is definitely more. Taking away _everything_, [setting the font size consistently cross-browser][11], then gradually building up with the simplest markup and styling possible yields the best results.

[1]: http://4.bp.blogspot.com/_fh9xwLFYBUw/SjMixEDGEpI/AAAAAAAACVg/wcr4gaTX2zc/s320/createpirate.png
[2]: http://grails.org/plugin/joda-time
[3]: http://www.virtualbox.org/
[4]: http://www.codecouch.com/author/jeff/
[5]: http://grails.org/doc/1.1.x/api/org/codehaus/groovy/grails/validation/ConstrainedProperty.html
[6]: http://marceloverdijk.blogspot.com/
[7]: http://grails.org/plugin/i18n-templates
[8]: http://snipt.org/kTp
[9]: http://snipt.org/kUj
[10]: http://snipt.org/kUm
[11]: http://www.codecouch.com/2007/04/how-to-get-consistent-font-sizes-across-all-browsers/

