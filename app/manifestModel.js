var ManifestModel = function(){
	this.type = null;
	this.minBufferTime=null;
	this.mediaPresentationDuration= null;
	this.maxSegmentDuration= null;
	this.baseUrl=null;
	this.videoSet = null;
	this.videoSet = null;
};

ManifestModel.prototype.setType = function(type) {
	this.type = type;
};

ManifestModel.prototype.setMinBufferTime = function(minBufferTime) {
	this.minBufferTime = minBufferTime;
};

ManifestModel.prototype.setMediaPresentationduration = function(mediaPresentationDuration) {
	this.mediaPresentationDuration = mediaPresentationDuration;
};

ManifestModel.prototype.setMaxSegmentDuration = function(maxSegmentDuration) {
	this.maxSegmentDuration = maxSegmentDuration;
};

ManifestModel.prototype.setBaseUrl = function(baseUrl) {
	this.baseUrl = baseUrl;
};


ManifestModel.prototype.setVideoSet = function(adaptationSet) {
	this.videoSet = adaptationSet;
};

ManifestModel.prototype.setAudioSet = function(adaptationSet) {
	this.audioSet = adaptationSet;
};

ManifestModel.prototype.getRepresentation = function(type,id){
	if(type ==="video"){
		var videoRepresentation = Array.isArray(this.videoSet.Representation) ? this.videoSet.Representation : [this.videoSet.Representation];

		if(id){
			for (var i = 0; i <videoRepresentation.length; i++) {
				if(videoRepresentation[i].id === id){
					return videoRepresentation[i];
				}
			}
			return null;
		}else{
			return videoRepresentation[0] || null;
		}
	}

	if(type ==="audio"){
		var audioRepresentation = Array.isArray(this.audioSet.Representation) ? this.audioSet.Representation : [this.audioSet.Representation];
		if(id){
			for (var j = 0; j <audioRepresentation.length; j++) {
				if(audioRepresentation[j].id === id){
					return audioRepresentation[j];
				}
			}
			return null;
		}else{
			return audioRepresentation[0] || null;
		}
	}
};