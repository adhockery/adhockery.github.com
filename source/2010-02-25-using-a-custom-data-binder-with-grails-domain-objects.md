---
title: 'Using a custom data binder with Grails domain objects'
date: 2010-02-25T13:04:00+0000
tags: data binding, spring, gorm
alias: post/42902830038/using-a-custom-data-binder-with-grails-domain-objects
---

Yesterday I read a [post by Stefan Armbruster][1] on how to register a custom data binder to lookup Grails domain objects by any arbitrary property. I wanted to go a little further so that I could not only bind existing domain instances but create new ones as well.

<!-- more -->

For example, let's say I have _Artist_ and _Album_ domain classes where _Artist hasMany Albums_ and _Album belongsTo Artist_. _Artist_ has a _name_ property that is unique. On my _create album_ page I want to be able to type in the artist name and have the _save_ action in the controller automatically lookup an existing _Artist_ instance or create a new one if it doesn't exist. Doing this I don't want to have to add or change anything in the _save_ action itself - I could theoretically use dynamic scaffolding.

Adapting Stefan's _PropertyEditor_ implementation I created this: <script src="http://gist.github.com/315705.js?file=DomainClassLookupPropertyEditor.groovy"></script><noscript>

    import java.beans.PropertyEditorSupport
    import org.apache.commons.lang.StringUtils

    class DomainClassLookupPropertyEditor extends PropertyEditorSupport {

        Class domainClass
        String property

        String getAsText() {
            value."$property"
        }

        void setAsText(String text) {
            value = domainClass."findBy${StringUtils.capitalize(property)}"(text)
            if (!value) {
                value = domainClass.newInstance((property): text)
            }
        }
    }

</noscript>
The crucial change is the `if (!value)` block which creates the new instance and populates the relevant property.

To make everything work I just need to:

1. Add the _PropertyEditorRegistrar_ and place it in `resources.groovy` as per Stefan's post.
2. Have a text input or autocompleter with the name _"artist"_ in my _create album_ form.
3. Add `artist cascade: "save-update"` to the _mapping_ block in _Album_ so that when the _Album_ is saved the new _Album_ will get saved as well.

[1]: http://blog.armbruster-it.de/2010/01/customizing-grails-data-binding-with-a-groovy-propertyeditor/

