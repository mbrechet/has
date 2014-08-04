var BufferController = function(type, adaptationSet){
	 this.type = type;
	 this.adaptationSet = adaptationSet;


	 this.initialized = false; //true quand le segment d'initialization est chargée
	 this.started = false; //ture quand la lecture a démarée

	 this.buffer = null;
};

BufferController.prototype.start = function() {
	// body...

	if(!this.initialized){
		this.started = true;
		this.initialize();
	}else{
		this.getNextFragment();
	}
};

BufferController.prototype.initialize = function(buffer) {
	this.buffer = buffer;
	this.initialized = true;
};

BufferController.prototype.prepareRequest = function(){

};

BufferController.prototype.setBuffer = function(buffer) {
	
};

BufferController.prototype.appendToMediaSource = function(data) {
	// body...
};

BufferController.prototype.getNextFragment = function() {
	// body...
};