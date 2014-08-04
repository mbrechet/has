var Player = function(videoNode){
	
	// initialize controllers
	this.videoController = null;
	this.audioController = null;
	this.manifestLoader = null;

	this.videoModel = videoNode;
	this.manifestModel = null;
	this.mediasource = this.getMediaSource();

	// ici on attache la mediaSource à la balise video
	this.videoModel.src = window.URL.createObjectURL(this.mediasource);

};

Player.prototype.getMediaSource = function() {

	var MediaSource = window.MediaSource || window.WebKitMediaSource || null;
	if(MediaSource){
 		return new MediaSource();
	}else{
		return null;
	}
};


Player.prototype.load = function(url) {
	this.manifestLoader = new ManifestLoader();
	var deferred = Q.defer();
	this.manifestLoader.load(url).then((function(manifest){
		this.manifestModel = manifest;
		deferred.resolve(manifest);
	}).bind(this));
	return deferred.promise;
};

Player.prototype.setSource= function(type, representationSet) {
	if(type === "video"){
		this.videoController = new BufferController(type,representationSet);
	}

	if(type === "audio"){
		this.audioController = new BufferController(type,representationSet);
	}

	// here put text
};
