---
title: 'Derived values in Spock where tables'
date: 2012-08-29T17:29:00+0100
tags: spock, groovy, testing
alias: post/41774699277/derived-values-in-spock-where-tables/
---

When using `where` blocks in Spock there are two forms; assigning iterable values to a variable, e.g. `crew << ['Mal', 'Kaylee', 'Jayne']` or using a datatable. In the first form I always knew you could use assigned values, for example:

	#!groovy
	where:
	crew << ['Mal', 'Kaylee', 'Jayne']
	nameLength = crew.length()

Note the assignment operator used rather than the left shift on the second line there.

I had always assumed that this option went out of the window when using a data table. Values in the columns can't reference other columns after all. <!-- more --> But [Marcin Erdmann](http://blog.proxerd.pl/) pointed out to me that it is in fact possible to still used derived values with data tables, like this:

	#!groovy
	where:
	name     | position
	'Mal'    | 'captain'
	'Kaylee' | 'mechanic'
	'Jayne'  | 'PR officer'

	nameLength = crew.length()

You just add additional variables after the data table. This doesn't seem to be documented anywhere but works just fine.

One way in which I find this particularly useful is in composing good text for `@Unroll` expressions. For example:

	#!groovy
	@Unroll
	void '#name is the #status #position on the ship'() {
		expect:
		// something interesting

		where:
		name     | position     | deceased
		'Mal'    | 'captain'    | false
		'Kaylee' | 'mechanic'   | false
		'Jayne'  | 'PR officer' | false
		'Wash'   | 'pilot'      | true

		status = deceased ? 'former' : 'current'
	}

Here the `where` block variable _status_ is probably not used in the body of the spec itself but just helps to make the unrolled description in the test report more readable. When the test runs the test names in the report will be:

* `Mal is the current Captain on the ship`
* `Kaylee is the current Mechanic on the ship`
* `Jayne is the current PR officer on the ship`
* `Wash is the former pilot on the ship`

