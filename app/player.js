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
		this.setSource("video",this.manifestModel.videoSet);
		this.setSource("audio",this.manifestModel.audioSet);
		deferred.resolve(manifest);
	}).bind(this));
	return deferred.promise;
};


Player.prototype.play = function(videoQualityId, audioQualityId) {
	// si les 2 objet existent, on peut créer les différents sourcebuffer
	if(this.manifestModel && this.mediasource){
		var videoRepresentation = this.manifestModel.getRepresentation("video",videoQualityId);
		var audioRepresentation = this.manifestModel.getRepresentation("audio",audioQualityId);

		var videoCodec = this.manifestModel.videoSet.mimeType + ';codecs="'+ videoRepresentation.codecs+'"';
		var audioCodec = this.manifestModel.audioSet.mimeType + ';codecs="'+ audioRepresentation.codecs+'"';
		
		//test du support avant l'initialization
		if(this.videoModel.canPlayType(videoCodec) === "probably"){
			this.videoController.initialize(this.mediasource.addSourceBuffer(videoCodec));
		}else{
			alert("impossible de lire le codec suivant "+ videoCodec);
		}
		if(this.videoModel.canPlayType(audioCodec) === "probably"){
			this.audioController.initialize(this.mediasource.addSourceBuffer(audioCodec));
		}else{
			alert("impossible de lire le codec suivant "+ audioCodec);
		}

	}

};

Player.prototype.setSource= function(type, adaptationSet) {
	
	if(type === "video"){
		this.videoController = new BufferController(type,adaptationSet);
		//this.videoController.setBuffer(this.mediasource.addSourceBuffer(codec));

	}

	if(type === "audio"){
		this.audioController = new BufferController(type,adaptationSet);
		//this.audioController.setBuffer(this.mediasource.addSourceBuffer(codec));
	}

	// here put text
};
