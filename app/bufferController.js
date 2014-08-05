var BufferController = function(type, adaptationSet, manifestModel){
	 this.type = type;
	 this.adaptationSet = adaptationSet;
	 this.duration = manifestModel.mediaPresentationDuration || Infinity;
	 this.segmentDuration = manifestModel.maxSegmentDuration;
	 this.manifestModel = manifestModel;
	 this.initialized = false; //true quand le segment d'initialization est chargée
	 this.started = false; //ture quand la lecture a démarée

	 this.buffer = null;


	 this.template = null;
	 this.currentIndex = 0;
	 this.totalFragments = 0;

	 this.currentRepresentation = null;

};

BufferController.prototype.start = function() {
	// body...

	if(this.initialized){
		this.started = true;
		this.getNextFragment();
	}
};

BufferController.prototype.stop = function() {
	this.started = false;
};



BufferController.prototype.initialize = function(buffer, currentRepresentation) {
	debugger;
	this.buffer = buffer;
	this.template = this.adaptationSet.SegmentTemplate;
	this.currentIndex = parseInt(this.template.startNumber);
	this.currentRepresentation = currentRepresentation;
	// ici on a besoin de calculer le nombre de fragment en faisant durée du fragment / temps total;
	this.totalFragments = Math.ceil(this.duration / this.segmentDuration)+1;
	// appel du segment d'initialization
	this.getInitializationFragment().then(this.appendToBuffer.bind(this)).then(this.start.bind(this));
	this.initialized = true;
};

BufferController.prototype.getInitializationFragment = function() {
	
	
	var deferred = Q.defer();
	
	var url = this.prepareRequest("initialization");
	if(url){
		var xhr = new XMLHttpRequest();
		xhr.open("GET",url,true);
		xhr.responseType =	"arraybuffer";
		xhr.onload = function(){
			deferred.resolve(xhr.response);
		};
		// todo treat onerror
		xhr.send();
	}else{
		deferred.reject("No url found");
	}

	return deferred.promise;

};

BufferController.prototype.updateRepresentation = function(representation) {
	if(this.currentRepresentation.id != representation.id){
		this.stop();
		this.currentRepresentation = representation;
		this.getInitializationFragment().then(this.appendToBuffer.bind(this)).then(this.start.bind(this));
	}
};

BufferController.prototype.getNextFragment = function() {
	if(this.started){
		if(this.currentIndex < this.totalFragments){
			console.info("currentIndex : ", this.type,this.currentIndex);
			var url = this.prepareRequest("media");
			if(url){
				var xhr = new XMLHttpRequest();
				xhr.open("GET",url,true);
				xhr.responseType =	"arraybuffer";
				xhr.onload = (function(){
					this.currentIndex +=1;
					this.appendToBuffer(xhr.response).then(this.getNextFragment.bind(this));
				}).bind(this);
				// todo treat onerror
				xhr.send();
			}
		}
	}
};

BufferController.prototype.prepareRequest = function(type){
	var url =null;
	if(type ==="initialization"){
		var initialization = this.template.initialization;
		url = initialization.replace("$RepresentationID$",this.currentRepresentation.id);
		if(url.lastIndexOf("http://")===-1){
			url = this.manifestModel.baseUrl+url;
		}
	}else{
		// its a segment generation
		var segment  = this.template.media;
		url = segment.replace("$RepresentationID$",this.currentRepresentation.id);
		url = url.replace("$Number$",this.currentIndex);
		if(url.lastIndexOf("http://")===-1){
			url = this.manifestModel.baseUrl+url;
		}
	}
	return url;
};

BufferController.prototype.appendToBuffer = function(data) {
	// body...
	var	byteArray = null;
	var deferred = Q.defer();
	if (data !== null && data !== undefined && data.byteLength > 0) {
        byteArray = new Uint8Array(data);
		if(this.buffer.append){
			this.buffer.append(data);
			this.initialized = true;
			deferred.resolve();
		}else if(this.buffer.appendBuffer){
			this.buffer.appendBuffer(data);
			this.initialized = true;
			deferred.resolve();
		}
    }else{
    	this.initialized = false;
    	deferred.reject();
    }
    return deferred.promise;
};
