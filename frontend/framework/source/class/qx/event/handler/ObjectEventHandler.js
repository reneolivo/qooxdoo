/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(event2)

************************************************************************ */

qx.Class.define("qx.event.handler.ObjectEventHandler",
{
  extend : qx.event.handler.AbstractEventHandler,

  members :
  {
    // overridden
    canHandleEvent : function(target, type) {
      return target instanceof qx.core.Object && qx.Class.supportsEvent(target.constructor, type);
    },

    // overridden
    registerEvent : function(element, type) {
      // no registration at the browser is required
    },

    // overridden
    unregisterEvent : function(element, type) {},

    // overridden
    removeAllListeners : function() {}
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    var manager = qx.event.Manager;
    manager.registerEventHandler(statics, manager.PRIORITY_NORMAL);
  }
});