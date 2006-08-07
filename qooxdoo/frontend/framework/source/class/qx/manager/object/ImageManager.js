/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(image)
#require(qx.manager.object.SingletonManager)
#require(qx.constant.Type)
#optional(qx.ui.form.Button)

************************************************************************ */

/*!
  This singleton manage the global image path (prefix) and allowes themed icons.
*/
qx.OO.defineClass("qx.manager.object.ImageManager", qx.manager.object.ObjectManager,
function()
{
  qx.manager.object.ObjectManager.call(this);

  // Contains available icon themes
  this._iconThemes = {};

  // Contains available widget themes
  this._widgetThemes = {};

  // Contains known image sources (all of them, if loaded or not)
  // The value is a number which represents the number of image
  // instances which use this source
  this._sources = {};

  // Full image URIs (working as a cache to reduce the _buildUri executions)
  this._uris = {};

  // Contains defined aliases (like icons/, widgets/, application/, ...)
  this._aliases = {};

  // Define static alias from setting
  this.defineAlias("static", this.getSetting("staticUri"));
});




/*
---------------------------------------------------------------------------
  DEFAULT SETTINGS
---------------------------------------------------------------------------
*/

qx.Settings.setDefault("staticUri", "../../resources/static");
qx.Settings.setDefault("iconTheme", "qx.theme.icon.CrystalSvgIconTheme");
qx.Settings.setDefault("widgetTheme", "qx.theme.widget.WindowsWidgetTheme");






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "iconTheme", type : qx.constant.Type.OBJECT, instance : "qx.renderer.theme.IconTheme" });
qx.OO.addProperty({ name : "widgetTheme", type : qx.constant.Type.OBJECT, instance : "qx.renderer.theme.WidgetTheme" });







/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

qx.Proto._modifyIconTheme = function(propValue, propOldValue, propData)
{
  propValue ? this.defineAlias("icon", propValue.getSetting("imageUri")) : this.removeAlias("icon");
  return true;
}

qx.Proto._modifyWidgetTheme = function(propValue, propOldValue, propData)
{
  propValue ? this.defineAlias("widget", propValue.getSetting("imageUri")) : this.removeAlias("widget");
  return true;
}






/*
---------------------------------------------------------------------------
  THEMES
---------------------------------------------------------------------------
*/

qx.Proto.registerIconTheme = function(vTheme)
{
  var vId = vTheme.classname;

  this._iconThemes[vId] = vTheme;

  if (vId === this.getSetting("iconTheme") && this.getIconTheme() === null) {
    this.setIconTheme(vTheme);
  }
}

qx.Proto.registerWidgetTheme = function(vTheme)
{
  var vId = vTheme.classname;

  this._widgetThemes[vId] = vTheme;

  if (vId === this.getSetting("widgetTheme") && this.getWidgetTheme() === null) {
    this.setWidgetTheme(vTheme);
  }
}

qx.Proto.setIconThemeById = function(vId) {
  return this.setIconTheme(this._iconThemes[vId]);
}

qx.Proto.setWidgetThemeById = function(vId) {
  return this.setWidgetTheme(this._widgetThemes[vId]);
}






/*
---------------------------------------------------------------------------
  PRELOAD API
---------------------------------------------------------------------------
*/

qx.Proto.getPreloadImageList = function()
{
  var vPreload = {};

  for (var vSource in this._sources)
  {
    if (this._sources[vSource]) {
      vPreload[vSource] = true;
    }
  }

  return vPreload;
}

qx.Proto.getPostPreloadImageList = function()
{
  var vPreload = {};

  for (var vSource in this._sources)
  {
    if (!this._sources[vSource]) {
      vPreload[vSource] = true;
    }
  }

  return vPreload;
}





/*
---------------------------------------------------------------------------
  URI/ALIAS HANDLING
---------------------------------------------------------------------------
*/

qx.Proto.buildUri = function(vPath, vForceUpdate)
{
  var vUri = this._uris[vPath];

  if (vForceUpdate || typeof vUri === qx.constant.Type.UNDEFINED) {
    vUri = this._uris[vPath] = this._buildUri(vPath);
    // this.debug("URI: " + vPath + " => " + vUri);
  }

  return vUri;
}

qx.Proto.defineAlias = function(vPrefix, vPath)
{
  //  this.debug("defineAlias: " + vPrefix + " => " + vPath);

  this._aliases[vPrefix] = vPath;
  this._updateImages();
}

qx.Proto.removeAlias = function(vPrefix) {
  delete this._aliases[vPrefix];
}





/*
---------------------------------------------------------------------------
  INTERNAL HELPER
---------------------------------------------------------------------------
*/

qx.Proto._buildUri = function(vPath, vForce)
{
  switch(vPath.charAt(0))
  {
    case qx.constant.Core.SLASH:
    case qx.constant.Core.DOT:
      return vPath;

    default:
      if (qx.lang.String.startsWith(vPath, qx.constant.Net.URI_HTTP) || qx.lang.String.startsWith(vPath, qx.constant.Net.URI_HTTPS) || qx.lang.String.startsWith(vPath, qx.constant.Net.URI_FILE)) {
        return vPath;
      }

      var vAlias = vPath.substring(0, vPath.indexOf(qx.constant.Core.SLASH));
      var vResolved = this._aliases[vAlias];

      if (qx.util.Validation.isValidString(vResolved)) {
        return vResolved + vPath.substring(vAlias.length);
      }

      return vPath;
  }
}

qx.Proto._updateImages = function()
{
  var vAll = this.getAll();
  var vObject;

  // Recreate preloader of affected images
  for (var vHashCode in vAll)
  {
    vObject = vAll[vHashCode];
    vObject.setPreloader(qx.manager.object.ImagePreloaderManager.create(this.buildUri(vObject.getSource(), true)));
  }

  return true;
}







/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

// TODO: rename to createIconThemeList
qx.Proto.createThemeList = function(vParent, xCor, yCor)
{
  var vButton;
  var vThemes = this._iconThemes;
  var vIcon = "icon/16/icons.png";
  var vPrefix = "Icon Theme: ";
  var vEvent = qx.constant.Event.EXECUTE;

  for (var vTheme in vThemes)
  {
    var vButton = new qx.ui.form.Button(vPrefix + vThemes[vTheme].getTitle(), vIcon);

    vButton.setLocation(xCor, yCor);
    vButton.addEventListener(vEvent, new Function("qx.manager.object.ImageManager.setIconThemeById('" + vTheme + "')"));

    vParent.add(vButton);

    yCor += 30;
  }
}








/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  if (this._iconThemes)
  {
    for (var vTheme in this._iconThemes)
    {
      this._iconThemes[vTheme].dispose();
      this._iconThemes[vTheme] = null;
    }

    this._iconThemes = null;
  }

  if (this._widgetThemes)
  {
    for (var vTheme in this._widgetThemes)
    {
      this._widgetThemes[vTheme].dispose();
      this._widgetThemes[vTheme] = null;
    }

    this._widgetThemes = null;
  }

  this._sources = null;
  this._uris = null;
  this._aliases = null;

  return qx.manager.object.ObjectManager.prototype.dispose.call(this);
}









/*
---------------------------------------------------------------------------
  DEFER SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.SingletonManager.add(qx.manager.object.ImageManager);

