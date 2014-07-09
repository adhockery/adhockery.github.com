---
title: 'Decoupling from the DOM with Angular'
date: 2013-09-12T01:13:00+0100
tags: angular, angularjs
alias: post/60977491011/decoupling-from-the-dom-with-angular/
---

One piece of advice you'll run into pretty soon when working with Angular is that you should never touch the DOM outside of a directive. Especially when test-driving your components this is pretty wise. The great strength of Angular is the declarative way in which the view (HTML) works with the view model (Angular controllers). It's almost absurd how easy it is to unit test Angular controllers. Controller functions tend to act on `$scope` properties, trigger or respond to events and all those things are straightforward to replicate in unit tests.

However, since Angular directives can *contain* controllers the temptation can be to write some pretty non-idiomatic Angular code by writing *view logic* that really belongs in a "pure" controller in a bloated directive that happily interacts with the DOM via the [`$element`][ng-element] injected into its controller in much the way a Backbone view might.

<!-- more -->

I was recently building some fairly simple CRUD functionality for my current client. There's a list of *products* and each has an *edit* button that pops up a [Bootstrap modal][bs-modal] containing a form with the *product* data.

I initially built this using:

* a controller that is triggered by the URL route and displays the *product* list.
* a directive for the form with its own controller exporting scope properties representing the selected *product* and scope functions that handle things like clicking the *save* or *cancel* buttons.

The *product* list is displayed in a table and the form is declared after it:

    #!markup
    <table>
      <tr ng-repeat="product in products">
        <!-- you get the idea -->
      </tr>
    </table>

    <div class="modal" edit-product-form>
      <!-- a form that contains things like... -->
      <input ng-model="product.title">
      <!-- and other inputs and buttons -->
    </div>

Each element in the *product* list contains an *edit* button:

    #!markup
    <button type="button" ng-click="edit(product)">Edit</button>

Clicking the button triggers an event using [`$scope.$broadcast`][broadcast]:

    #!javascript
    $scope.edit = function(product) {
      $scope.$broadcast('product:edit', product);
    }

That event is picked up by the *edit-product-form* directive. It places the *product* in its isolate scope – which automatically populates the form with the *product's* properties – and pops up the modal:

    #!javascript
    angular.module('myApp').directive('edit-product-form', function() {
      return {
        restrict: 'A',
        controller: ['$scope', '$element', function($scope, $element) {
          $scope.$on('product:edit', function(event, product) {
            $scope.product = product;
            $element.modal('show');

            //...

The *save* button handler in the directive sends another event back up the scope heirarchy using [`$scope.$emit`][emit] and hides the modal again.

    #!javascript
          $scope.save = function() {
            $scope.product.$save(function() {
              $scope.$emit('product:updated', $scope.product);
              $element.modal('hide');
            },
            function() {
              // display an error message
            });
          };

Fine, this works **but** it's interacting with the Bootstrap modal jQuery plugin in an imperative way. When I want the modal to appear I *tell* it to appear explicitly. When I want it to disappear I *tell* it to hide. This is mixing up the logical action of placing the form data in the scope, saving changes and updating the list view with the specifics of *how* the form is displayed – with a Bootstrap modal dialog. The logic governing view state would be the same if showing and hiding the form were handled in a different way. I've violated the [*separation of concerns*][soc].

To summarize the problems:

* Unit testing the code requires at least a minimal DOM even for assertions purely concerned with the scope properties.
* If I want to use a similar modal elsewhere in the app I can't re-use anything here unless you consider copy 'n paste to be reuse.
* If I want to use a different widget like [Foundation's *Reveal*][reveal] to show and hide the form I need to pick through – and be careful not to break – the code that governs the view state even though that's a separate concern.

We can do better.

Let's pare things back to the simplest state – what am I trying to do here? I want to hide the "edit product" form until I have selected a product to edit, show the form while I'm working on that product then hide it again once I'm finished. The view state of *"user has selected a product"* is represented by the existence of a property called `$scope.product`. With no fancy presentation or slide in/out effects I could do this by just adding and removing that scope property at the appropriate time:

    #!javascript
    $scope.edit = function(product) {
      $scope.product = product;
    };

    $scope.save = function() {
      $scope.product.$save(function() {
        delete($scope.product);
      }, function() {
        # display an error message
      });
    };

Then in the view I can *declaratively* react to the presence or absence of the `product` property:

    #!markup
    <div ng-show="product">

The [`ng-show`][ng-show] directive hides the element unless there is a non-`null`, non-`undefined` property in the scope that matches its value.

Simple. Now the view does the right thing based on state of the view model. You may or may not have noticed but I've done away with the directive for the edit form now – the `edit` and `save` functions can just appear as part of the controller that manages the *product* list. Arguably the directive is still useful for modulatity – especially if the form is complex – but crucially I don't *need* it because I don't *need* to imperatively interact with the DOM.

I should be able to use a Bootstrap modal to hide and show the form instead of the basic `ng-show` directive **without changing any of the controller code**. The mechanism for showing and hiding the form is an implementation detail of the view that's nothing to do with the view model. Managing that kind of separation of concerns is the promise of Angular in a nutshell.

To do this I'll add the Boostrap modal class to my view:

    #!markup
    <div class="modal fade" trigger="product">

Don't worry about the `trigger` attribute – I'll get to that.

Then I'll create a new directive that is activated simply by the presence of the `modal` class on the element.

    #!javascript
    angular.module('myApp').directive('modal', function() {
      return {
        restrict: 'C',
        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
          $scope.$watch($attrs.trigger, function(newValue, oldValue) {
            if (!!newValue && !oldValue) {
              $element.modal('show');
            }
            if (!!oldValue && !newValue) {
              $element.modal('hide');
            }
          });
        }]
      };
    });

The `restrict: 'C'` means the directive is activated by a class name that is the same as the directive name. In other words any element that has `class="modal"` will have this directive applied.

The directive uses the `$scope.$watch` function to respond to changes in a scope property defined by the `trigger` attribute on the directive's element. Note that `$scope.trigger` still works as is if, like me, you're fussy about validity and declare the attribute as `data-trigger="product"`.

The `$watch` callback is invoked every time the named scope property changes and is passed the previous and new values of that property. In this example I only care whether the property has changed from `null`/`undefined` to an object or vice-versa. I don't want to call `$element.modal 'show'` again if the modal is already visible but `$scope.property` has just changed to point to a *different* object. (If you haven't seen the `!!` operator in JavaScript before it's simply a way of coercing any type to boolean).

I've now got two components – a controller that purely interacts with scope properties and a directive that responds to scope changes and calls a jQuery plugin method.

* Both those are very simple to unit test.
* Neither is coupled to the other except via the `trigger` attribute in the view.
* I can re-use the *modal* directive in similar scenarios elsewhere in the system by just adding `class="modal"` and an appropriate `trigger` attribute.
* If I want to use a different UI widget I only have to change the directive.

Learning to think about separation of concerns in this way is key to getting the most out of Angular. Remember controllers are for managing view *state* and directives are for managing the view *implementation*. If you find yourself mixing those concerns step back and think about how you can separate them. The resulting code will be easier to follow, easier to change and easier to test.

[ng-element]:http://docs.angularjs.org/api/angular.element
[ng-show]:http://docs.angularjs.org/api/ng.directive:ngShow
[bs-modal]:http://getbootstrap.com/javascript/#modals
[reveal]:http://foundation.zurb.com/docs/components/reveal.html
[broadcast]:http://docs.angularjs.org/api/ng.$rootScope.Scope#$broadcast
[emit]:http://docs.angularjs.org/api/ng.$rootScope.Scope#$emit
[soc]:http://en.wikipedia.org/wiki/Separation_of_concerns

