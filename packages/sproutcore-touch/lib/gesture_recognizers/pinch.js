// ==========================================================================
// Project:  SproutCore Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var get = SC.get;
var set = SC.set;

var sigFigs = 100;

/** 
  @class
 
  Recognizes a multi-touch pinch gesture. Pinch gestures require two fingers
  to move closer to each other or further apart.

  For pinchChange events, the pinch gesture recognizer passes in a scale value
  which can be applied as a CSS transform directly.  

    var myview = SC.View.create({
      elementId: 'gestureTest',
      pinchChange: function(recognizer, scale) {
        this.$().css('-webkit-transform','scale3d('+scale+','+scale+',1)');
      }
    })

  @extends SC.Gesture
*/
SC.PinchGestureRecognizer = SC.Gesture.extend({
  numberOfTouches: 2,

  // Initial is global, starting is per-gesture event
  _initialDistanceBetweenTouches: null,
  _startingDistanceBetweenTouches: null,

  _initialDistanceBetweenTouches: null,
  _deltaThreshold: 0,
  _multiplier: 1,

  _initialScale: 1,
  scale: 1,

  touchStart: function(evt, view, manager) {
    var touches = evt.originalEvent.targetTouches;
    var len = touches.length;

    if (len === 1) {
      this.state = SC.Gesture.WAITING_FOR_TOUCHES;
    }
    else {
      this.state = SC.Gesture.POSSIBLE;

      this._startingDistanceBetweenTouches = this.distance(touches[0],touches[1]);

      if (!this._initialDistanceBetweenTouches) {
        this._initialDistanceBetweenTouches = this._startingDistanceBetweenTouches
      }

      this._initialScale = this.scale;

    }
    
    manager.redispatchEventToView(view,'touchstart', evt);
  },

  touchMove: function(evt, view, manager) {
    var state = this._state;
    var touches = evt.originalEvent.targetTouches;
    if(touches.length !== get(this, 'numberOfTouches')) { return; }

    var currentDistanceBetweenTouches = this.distance(touches[0],touches[1]) 

    var nominator = currentDistanceBetweenTouches;
    var denominator = this._startingDistanceBetweenTouches;
    this.scale = this._initialScale * Math.round((nominator/denominator)*sigFigs)/sigFigs;

    var differenceInDistance = currentDistanceBetweenTouches - this._startingDistanceBetweenTouches;

    if (this.state === SC.Gesture.POSSIBLE && Math.abs(differenceInDistance) >= this._deltaThreshold) {
      this.state = SC.Gesture.BEGAN;
      this.notifyViewOfGestureEvent(view,'pinchStart', this.scale);

      evt.preventDefault();
    }
    else if (this.state === SC.Gesture.BEGAN || this.state === SC.Gesture.CHANGED) {
      this.state = SC.Gesture.CHANGED;
      this.notifyViewOfGestureEvent(view,'pinchChange', this.scale);

      evt.preventDefault();
    }
    else {
      manager.redispatchEventToView(view,'touchmove', evt);
    }
  },

  touchEnd: function(evt, view, manager) {
    if (this.state !== SC.Gesture.ENDED) {
      this.state = SC.Gesture.ENDED;
      this.notifyViewOfGestureEvent(view,'pinchEnd');
    }
    else {
      manager.redispatchEventToView(view,'touchmove', evt);
    }
  },

  touchCancel: function(evt, view, manager) {
    if (this.state !== SC.Gesture.CANCELLED) {
      this.state = SC.Gesture.CANCELLED;
      this.notifyViewOfGestureEvent(view,'pinchCancel');
    }
    else {
      manager.redispatchEventToView(view,'touchcancel', evt);
    }
  }
});

SC.Gestures.register('pinch', SC.PinchGestureRecognizer);