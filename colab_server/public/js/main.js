/** Main AngularJS Web Application */ 
var app = angular.module('colabVideoServerWebApp', [ 'ngRoute', 'colabConfig', 'angularFileUpload']); 

/** Configuration **/

// Configure the Routes  
app.config(['$routeProvider', function ($routeProvider) { 
	$routeProvider 
		// Home 
		.when("/", {templateUrl: "partials/video_list.html", controller: "PageCtrl"}) 
		
		// Pages 
		.when("/about", {templateUrl: "partials/about.html", controller: "PageCtrl"})
		.when("/video_list", {templateUrl: "partials/video_list.html", controller: "PageCtrl"})
		.when("/play_test_video", {templateUrl: "partials/play_test_video.html", controller: "PageCtrl"})
		.when("/web_video_upload", {templateUrl: "partials/web_video_upload.html", controller: "WebUploadCtrl"})
		
		// else 404 
		.otherwise("/404", {templateUrl: "partials/404.html", controller: "PageCtrl"}); 
}]);

// configure trusted source URL's
app.config(['$sceDelegateProvider', function($sceDelegateProvider) {
 $sceDelegateProvider.resourceUrlWhitelist([
   // Allow same origin resource loads.
   'self',
   // Allow loading from all domains for now - not secure in production env.
   '**']);
 }]);


/** Controllers */

// Controls Pages
app.controller('PageCtrl', function (/*$scope, colabConfig*/) { 
	console.log("Page Controller reporting for duty."); 

	// Activates the Carousel 
	$('.carousel').carousel({
		 interval: 5000 }); 

});

// Controls video list page
app.controller('VideoListCtrl', ['$scope', '$http', 'GetUploadedVideosFactory', 'colabConfig', function ($scope, $http, GetUploadedVideosFactory, colabConfig)  { 
	console.log("VideoList controller"); 
	
	$scope.videoList = [];
	
	// Get the video list from the Colab Server
	GetUploadedVideosFactory.getVideoList().then(function(data) {

		// Should really do some type checking etc here on the returned value
	   	console.dir(data.data);
		
		$scope.videoList = data.data;
	});
	
	// Set the video player window to blank by default
	$scope.playerWindowURL = './templates/empty_player_window.html';
	
	// function called when user clicks the play button for a particular video
	function playVideo(video) {
		console.log("playVideo button clicked"); 
		// set the video player window to the player window instead of blank
		$scope.playerWindowURL = './templates/video_player_window.html';
		$scope.collabServerPlayVideoURL = colabConfig.colabServerBaseURL + "/uploaded_videos/" + video.file_name;
	};
	
	// function called when user clicks the delet button for a particular video
	function deleteVideo(video) {
		console.log("deleteVideo button clicked");
		// Send message to the server to delete the video
		$http.delete(colabConfig.colabServerBaseURL + "/uploaded_videos/" + video.file_name);
		
		// Remove the video from the list being displayed
		$scope.videoList.splice( $scope.videoList.indexOf(video), 1 );
	};
	
	//Tell the scope about the functions in this controller
	$scope.playVideo = playVideo;
	$scope.deleteVideo = deleteVideo;

}]);

// Controls video test play div
app.controller('VideoPlayTestCtrl', ['$scope', 'colabConfig', function ($scope, colabConfig)  { 
	console.log("VideoList controller"); 
	
	//Set the base URL for the server
	$scope.collabServerBaseURL = colabConfig.colabServerBaseURL;
	$scope.collabServerTestVideoURL = colabConfig.colabServerBaseURL + "/videos/BigBuckBunny_320x180.mp4";

}]);

// Controls video upload from web (i.e. not from a mobile app) - uses module and apraoch at: https://github.com/danialfarid/angular-file-upload
app.controller('WebUploadCtrl',[ '$scope', '$upload','colabConfig', function($scope, $upload, colabConfig) {
	console.log("WebUploadCtrl controller");
	$scope.progressPerCent = 0;
	$scope.onFileSelect = function($files) {
		console.log("file selected for upload...");
		//$files: an array of files selected, each file has name, size, and type.
		for (var i = 0; i < $files.length; i++) {
		  var file = $files[i];
		  $scope.upload = $upload.upload({
		    url: colabConfig.colabServerBaseURL + "/web_video_upload",
		    method: 'POST',
		    //headers: {'header-key': 'header-value'},
		    //withCredentials: true,
		    data: {myObj: $scope.myModelObj},
		    file: file,
		  }).progress(function(evt) {
			  console.log("progress: " + (evt.position/evt.totalSize)*100);
			  //$scope.$apply(function() {
			      $scope.progressPerCent = (evt.position/evt.totalSize)*100;
			  //});
		  }).success(function(data, status, headers, config) {
		    // file is uploaded successfully
		    console.log(data);
		  }).error(function() {
		    console.log("Error on web video upload");
		  });
	  	}
	}
}]);

/** Factories **/

/* factory to get the video list from the server */
(function() {
  'use strict';
 
  app.factory('GetUploadedVideosFactory', ['$http', 'colabConfig',
    function($http, colabConfig) {
      var _factory = {};
 
      _factory.getVideoList = function() {
        return $http.get(colabConfig.colabServerBaseURL + '/video_list');
      };
 
      return _factory;
    }
  ]);
 
}());


/** Modules **/

/* module for general app config that can be injected as a dependency where needed */
var colabConfigModule = angular.module('colabConfig', []);	  
  //var hosturl = $location.host();
  /*.value('colabConfig', {
	  // Set the base URL for the colab server to be the host URL for the server hosting
	  // Angular in this case. If you wanted to host the Angular and the node.js ColabSrever on
	  //different server, to allow them scale separatly for example, his can simply be changed.
	  //colabServerBaseURL: $location.host(),
	  colabServerBaseURL: 'http://localhost:3000'	  
	})*/

	colabConfigModule.factory('colabConfig', ['$location', function ($location) {
		//var hosturl = $location.host();
		var configReturnObject = new Object();
		configReturnObject.colabServerBaseURL = $location.host();
		return configReturnObject;
}]);
