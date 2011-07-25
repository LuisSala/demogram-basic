// ==========================================================================
// Project:   demogram
// Copyright: ©2011 My Company Inc. All rights reserved.
// ==========================================================================

spade.require("sproutcore");
spade.require("sproutcore-touch");

// Declare application namespace
var App = SC.Application.create({
    store: SC.Store.create({commitRecordsAutomatically: YES}).from('App.MediaDataSource')
});

App.INSTAGRAM_CLIENT_ID="CLIENT_ID_REQUIRED";
App.INSTAGRAM_API_VERSION="v1";

App.User = SC.Record.extend({
    primaryKey: 'id',
    username: SC.Record.attr(String)
});

App.Image = SC.Record.extend({
    url: SC.Record.attr(String)
});

App.ImageCollection = SC.Record.extend({
     standard_resolution: SC.Record.toOne('App.Image', {nested: true})
});

App.MediaRecord = SC.Record.extend({
    // Mostly empty for now as we'll treat most of the data opaquely.
    primaryKey: 'id',
    user: SC.Record.toOne('App.User', {nested: true}),
    images: SC.Record.toOne('App.ImageCollection', {nested: true}),
    createDateTime: function() {
        return SC.DateTime.create(this.get("create_time"));
    }.property("create_time").cacheable()

}); // end MediaRecord

App.POPULAR_QUERY = SC.Query.remote(App.MediaRecord, {query: {
        endpoint: "media",
        media_id: "popular"
    }
}); // end POPULAR_QUERY

App.MediaDataSource = SC.DataSource.extend(
/** @scope News.FeedDataSource.prototype */ {

  fetch: function(store, query) {

      var version = App.INSTAGRAM_API_VERSION;
      var auth_token="client_id="+App.INSTAGRAM_CLIENT_ID;

      var q = query.query;
      var endpoint = q.endpoint;
      var media_id = q.media_id;

      var jsonpCallback="callback=?";

      var url = "https://api.instagram.com/"+version+"/"+endpoint+"/"+ media_id+"?"+auth_token+"&"+jsonpCallback;

      SC.Logger.log("fetch() - Fetching content at: "+ url);

      var _self = this;
      $.ajax({
          url: url,
          dataType: 'jsonp',
          success: function(data) {
              SC.run(function(){
                  _self.didFetchMedia(data, store, query);
              })
          },
        error: function() {SC.run(function(){store.dataSourceDidErrorQuery(query)})}
      }); // end ajax call

      return YES ; // return YES if you handled the query
  },

    didFetchMedia: function(data, store, query) {
      SC.Logger.log("didFetchMedia called");

      var code = data.meta.code;
      SC.Logger.log("didFetchMedia: code = "+ code);
      var items = data.data;

      var storeKeys = store.loadRecords(App.MediaRecord, items);

      // This is required for remote queries but not local.
      store.loadQueryResults(query, storeKeys);

      store.dataSourceDidFetchQuery(query);
  } // end didFetchFeed()

}) ;

App.mediaController = SC.ArrayProxy.create({
    content: [],
    comments: [],

    loadPopular: function() {
        this.set("content",App.store.find(App.POPULAR_QUERY));
    },
	
	openDetails: function(item) {
		SC.Logger.log("Opening: "+item.get("id"));
		
		var view = App.MediaDetailsView.create({
			content: item
		});
		
		this.set("comments", item.getPath("comments.data"));
		
		view.append();
		
		this.set("detailsView", view);
	},
	
	closeDetails: function() {
		var view = this.get("detailsView");
		view.destroy();		
	}
});

App.MainView = SC.View.extend({

  init: function() {
      this._super();
      SC.Logger.log("Initializing MainView");
      App.mediaController.loadPopular();
  }
});

App.MediaItemView = SC.View.extend({
	
	click: function(evt) {
		return this.tapEnd();
	},
	tapEnd: function() {
		SC.Logger.log("Tap/Click Detected: "+ this.getPath("content.id"));
		
		App.mediaController.openDetails(this.get("content"));
		
		return true;		
	}
	
});

App.MediaDetailsView = SC.View.extend({
	templateName: "photo-details",
	classNames: ["photo-details"]	
});

App.CloseDetailsButton = SC.View.extend({
	classNames: ["app-button"],
	
	tapEnd: function() {
		App.mediaController.closeDetails();
	}
});

App.PinchableView = SC.View.extend({
	pinchChange: function(recognizer, scale) {
        this.$().css("-webkit-transform", "scale3d("+scale+","+scale+", 1010)");
	} /*,
	panChange: function(recognizer, current) {
		this.$().css("-webkit-transform", "translate3d("+current.x+"px,"+ current.y+"px, 1010)");
	}
	*/
});