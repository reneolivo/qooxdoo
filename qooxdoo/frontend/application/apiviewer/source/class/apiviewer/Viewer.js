/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The GUI definition of the API viewer.
 *
 * The connections between the GUI components are established in
 * the {@link Controller}.
 */
qx.Class.define("apiviewer.Viewer",
{
  extend : qx.legacy.ui.layout.DockLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.base(arguments);

    this.setEdge(0);

    this.addTop(this.__createHeader());
    var tree = new apiviewer.ui.PackageTree();
    tree.setId("tree");

    var buttonView = this.__createButtonView(
      tree,
      new apiviewer.ui.SearchView(),
      new apiviewer.ui.LegendView()
    );

    var mainFrame = this.__createMainFrame(
      this.__createToolbar(),
      this.__createDetailFrame()
    );

    this.add(this.__createVerticalSplitter(
      buttonView, mainFrame));
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Create the header widget
     *
     * @return {qx.legacy.ui.embed.HtmlEmbed} The header widget
     */
    __createHeader : function()
    {
      var header = new qx.legacy.ui.embed.HtmlEmbed(
        "<h1>" +
        "<span>" + qx.core.Setting.get("apiviewer.title") + "</span>" +
        " API Documentation" +
        "</h1>" +
        "<div class='version'>qooxdoo " + qx.core.Setting.get("qx.version") + "</div>"
      );
      header.setHtmlProperty("id", "header");
      header.setStyleProperty(
        "background",
        "#134275 url(" +
        qx.util.ResourceManager.toUri("apiviewer/image/colorstrip.gif") +
        ") top left repeat-x"
      );
      header.setHeight(70);
      return header;
    },


    /**
     * Creates the button view widget on the left
     *
     * @param treeWidget {qx.legacy.ui.core.Widget} The widget for the "tree" pane
     * @param infoWidget {qx.legacy.ui.core.Widget} The widget for the "legend" pane
     * @return {qx.legacy.ui.pageview.buttonview.ButtonView} The configured button view widget
     */
    __createButtonView : function(treeWidget, searchWidget, infoWidget)
    {
      var buttonView = new qx.legacy.ui.pageview.buttonview.ButtonView();
      buttonView.set({
        width : "100%",
        height : "100%",
        border : "line-right"
      });

      var treeButton = new qx.legacy.ui.pageview.buttonview.Button("Packages", apiviewer.TreeUtil.ICON_PACKAGE);
      treeButton.setShow("icon");
      treeButton.setToolTip( new qx.legacy.ui.popup.ToolTip("Packages"));
      var searchButton = new qx.legacy.ui.pageview.buttonview.Button("Search", apiviewer.TreeUtil.ICON_SEARCH);
      searchButton.setShow("icon");
      searchButton.setToolTip( new qx.legacy.ui.popup.ToolTip("Search"));
      var infoButton = new qx.legacy.ui.pageview.buttonview.Button("Legend", apiviewer.TreeUtil.ICON_INFO);
      infoButton.setShow("icon");
      infoButton.setToolTip( new qx.legacy.ui.popup.ToolTip("Information"));

      treeButton.setChecked(true);
      buttonView.getBar().add(treeButton, searchButton, infoButton);

      var treePane = new qx.legacy.ui.pageview.buttonview.Page(treeButton);
      var searchPane = new qx.legacy.ui.pageview.buttonview.Page(searchButton);
      var infoPane = new qx.legacy.ui.pageview.buttonview.Page(infoButton);

      var pane = buttonView.getPane();
      pane.add(treePane, searchPane, infoPane);
      pane.setPadding(0);

      treePane.add(treeWidget);
      searchPane.add(searchWidget);
      infoPane.add(infoWidget);

      return buttonView;
    },


   /**
     * Creates the tool bar
     *
     * @return {qx.legacy.ui.toolbar.ToolBar} The configured tool bar
     */
    __createToolbar : function()
    {
      function createButton(text, clazz, icon, tooltip, checked, id)
      {
        if (!clazz) {
          clazz = qx.legacy.ui.toolbar.Button;
        }
        var button = new clazz(text, icon);
        if (checked) {
          button.setChecked(true);
        }

        if (tooltip) {
          button.setToolTip( new qx.legacy.ui.popup.ToolTip(tooltip));
        }

        button.setId(id);
        return button;
      }

      var toolbar = new qx.legacy.ui.toolbar.ToolBar;
      toolbar.set({
        horizontalChildrenAlign : "right",
        backgroundColor : "background",
        height : 29,
        border : "line-bottom"
      });

      var part = new qx.legacy.ui.toolbar.Part;
      toolbar.add(part);

      part.add(createButton(
        "Expand",
        qx.legacy.ui.toolbar.CheckBox,
        "apiviewer/image/property18.gif",
        "Expand properties",
        false,
        "btn_expand"
      ));
      part.add(createButton(
        "Inherited",
        qx.legacy.ui.toolbar.CheckBox,
        "apiviewer/image/method_public_inherited18.gif",
        "Show inherited items",
        false,
        "btn_inherited"
      ));
      part.add(createButton(
        "Protected",
        qx.legacy.ui.toolbar.CheckBox,
        "apiviewer/image/method_protected18.gif",
        "Show protected items",
        false,
        "btn_protected"
      ));
      part.add(createButton(
        "Private",
        qx.legacy.ui.toolbar.CheckBox,
        "apiviewer/image/method_private18.gif",
        "Show private/internal items",
        false,
        "btn_private"
      ));

      return toolbar;
    },


    /**
     * Create the detail Frame and adds the Class-, Package and Loader-views to it.
     *
     * @return {qx.legacy.ui.layout.CanvasLayout} The detail Frame
     */
    __createDetailFrame : function()
    {
      var detailFrame = new qx.legacy.ui.layout.CanvasLayout;
      detailFrame.set(
      {
        width           : "100%",
        height          : "1*",
        backgroundColor : "white",
        id              : "content"
      });

      detailFrame.setHtmlProperty("id", "content");

      this._detailLoader = new qx.legacy.ui.embed.HtmlEmbed('<h1><small>please wait</small>Loading data...</h1>');
      this._detailLoader.setHtmlProperty("id", "SplashScreen");
      this._detailLoader.setMarginLeft(20);
      this._detailLoader.setMarginTop(20);
      this._detailLoader.setId("detail_loader");
      detailFrame.add(this._detailLoader);

      this._classViewer = new apiviewer.ui.ClassViewer;
      this._classViewer.setId("class_viewer");
      detailFrame.add(this._classViewer);

      this._packageViewer = new apiviewer.ui.PackageViewer;
      this._packageViewer.setId("package_viewer");
      detailFrame.add(this._packageViewer);

      return detailFrame;
    },


    /**
     * Creates the main frame at the right
     *
     * @param toolbar {qx.legacy.ui.toolbar.ToolBar} Toolbar of the main frame
     * @param detailFrame {qx.legacy.ui.core.Widget} the detail widget
     * @return {qx.legacy.ui.layout.VerticalBoxLayout} the main frame
     */
    __createMainFrame : function(toolbar, detailFrame)
    {
      var mainFrame = new qx.legacy.ui.layout.VerticalBoxLayout();
      mainFrame.set({
        width  : "100%",
        height : "100%",
        border : "line-left"
      });

      mainFrame.add(toolbar, detailFrame);
      return mainFrame;
    },


    /**
     * Creates the vertival splitter and populates the split panes
     *
     * @param leftWidget {qx.legacy.ui.core.Widget} the widget on the left of the splitter
     * @param rightWidget {qx.legacy.ui.core.Widget} the widget on the right of the splitter
     * @return {qx.legacy.ui.splitpane.HorizontalSplitPane} the split pane
     */
    __createVerticalSplitter : function(leftWidget, rightWidget)
    {
      var mainSplitPane = new qx.legacy.ui.splitpane.HorizontalSplitPane("1*", "4*");
      mainSplitPane.setLiveResize(false);
      mainSplitPane.addLeft(leftWidget);
      mainSplitPane.addRight(rightWidget);
      return mainSplitPane;
    }

  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings :
  {
    "apiviewer.title"            : "qooxdoo",
    "apiviewer.initialTreeDepth" : 1
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("_classTreeNodeHash");
    this._disposeObjects("_tree", "_detailLoader", "_classViewer", "_packageViewer");
  }
});
