/**
 */
window.addEventListener("DOMContentLoaded", function(){		
	new Canvas();
});

/** Canvas constructor
 *
 *	function Canvas
 *	@constructor
 */
function Canvas(arg) { 
	this._uid = 0;
	this._id = this.UID();
	this._components = []; // components to render
	this._services = []; // services to run
	this._arg = arg;

	// 	create canvas object to body
	if( arg && arg.id ) {
		this._id = arg.id;
		this._canvas = document.getElementById(arg.id);
	}
	else {
		this._canvas = document.createElement('canvas');
		if( !(arg && arg.hidden) ) document.body.appendChild(this._canvas); 	
	}

	// event when the browser is resized
	var self = this;
	this.resize = function() {
		self._layout = { height:window.innerHeight, width:window.innerWidth }; //  opacity:100 
		if( self._layout.height > self._layout.width && self._layout.height >= (self._layout.width*1.5)  ) {
			self._canvas.height = self._layout.width*1.5;
			self._canvas.width = self._layout.width;	
			self._canvas.style['margin-top'] = ( (self._layout.height - self._canvas.height)/2 ) + 'px';	
		}
		else { 
			self._canvas.height = self._layout.height;
			self._canvas.width = self._layout.height/1.5;	
			
		}
		self._canvas.style.left = ((self._layout.width/2)-(self._canvas.width/2))+'px';
		self._layout.height = self._canvas.height;
		self._layout.width = self._canvas.width;	
		self._scale = self._canvas.width/480;
		self._flag.redraw=1;
	}
	window.addEventListener('resize', this.resize, true);	

	// canvas context
	this._ctx = this._canvas.getContext('2d');
	this._flag = { redraw:1, redrawcount:0 };	
	this.resize();
	this.update();

}


/** 
 *   
 *	function saveComponent
 *	@see 
 *	@param {...*} args
 */	
Canvas.prototype.saveComponent = function(args) {

	for(var j=0;j<arguments.length;j++) {
		var component = arguments[j];

		if(component instanceof Array) { for(var i=0;i<component.length;i++) this.saveComponent(component[i]); continue; }

		if( !component.id ) component.id = this.UID(); // assign an auto-generated unique id
		
		component._canvas = this;
		component._ctx = this._ctx;
		component.init();

		component.z = component.z ? component.z : this._components.length; // update z index based on component length

		var ws = this._canvas.width/this._scale, hs = this._canvas.height/this._scale;
		switch(component.alignment) {
			case 2: component.x = ws - component.x; break; // topright
			case 3: component.x = ws/2 + component.x; break; // topmid
			case 4: component.y = hs - component.y; break; // bottomleft
			case 5: component.y = hs - component.y; component.x = ws - component.x; break; // bottomright
			case 6: component.y = hs - component.y; component.x = ws/2 + component.x; break; // bottommid
			case 7: component.y = hs/2 + component.y; component.x = ws/2 + component.x; break; // centermid
		}

		for(var i=0;i<component.traits.length;i++) { 
			component.traits[i].init(); 
		}		

		if( !this.updateComponentById(component) ) { // if it is not an update, push it as a new component
			this._components.push(component);
			component.onCreate();			
		}

	}

	this._flag.redraw=1;
	
	return this._components[this._components.length-1];
}

/** 
 *   
 *	function removeComponent
 *	@see 
 *	@param {string|number} id
 */	
Canvas.prototype.destroyComponent = function(id) {	
	for(var i=0;i<this._components.length;i++) 
		if(this._components[i].id===id) {   
			var component = this._components[i];
			this._components.splice(i,1);
			component.onDestroy();
			this._flag.redraw=1;
			return;
		};
}

/** Get target component based on id
 *   
 *	function getComponentById
 *	@see 
 *	@param {string|number} id
 */	
Canvas.prototype.getComponentById = function(id) {
	for(var i=0;i<this._components.length;i++) if(id===this._components[i].id) return this._components[i];
}

Canvas.prototype.getComponentsByCoordinate = function(x,y) {
	var components = [];
	for(var i=0;i<this._components.length;i++) 
		if( this._components[i].isCollision(x,y) ) 
			components.push(this._components[i]);	
	return components;
}

/** Update target component based on id
 *   
 *	function updateComponentById
 *	@see 
 *	@param {Object=} component
 */	
Canvas.prototype.updateComponentById = function(component) {
	for(var i=0;i<this._components.length;i++) if(component.id===this._components[i].id) { this._components[i] = component; return true; }
}

/** 
 *   
 *	function saveService
 *	@see 
 *	@param {Object=} service
 */	
Canvas.prototype.saveService = function(service) {
	service._ctx = this._ctx;
	service.init();
	for(var i=0;i<service.traits.length;i++) service.traits[i].init();	
	for(var i=0;i<this._services.length;i++) 
		if(this._services[i].id===service.id) { 
			this._services[i]=service; 
			return; 
		};
	this._services.push(service);
}	

/** Get target service based on id
 *   
 *	function getServiceById
 *	@see 
 *	@param {string|number} id
 */	
Canvas.prototype.getServiceById = function(id) {
	for(var i=0;i<this._services.length;i++) if(id===this._services[i].id) return this._services[i];
}	

/** Update the canvas screen with the new content
 *   
 *	function update
 */	
Canvas.prototype.update = function() {		
	var self = this;

	// var t = Commons.timer('Canvas.update'); t.stop();

	if( this._flag.redraw === 1 ) {		
		// clear canvas
		this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height); 

		if(this.bggrad) this.backgroundColorGradient(this.bggrad.colorstop1,this.bggrad.colorstop2);		

		// sort the z-index
		this._components.sort(function(a,b){
			if (a.z < b.z) return -1;
			if (a.z > b.z) return 1;
			return 0;
		});

		// update all the components
		for(var i=0;i<this._components.length;i++) { 
			this._components[i].onBeforeUpdate();
			for(var j=0;j<this._components[i].traits.length;j++) this._components[i].traits[j].onBeforeUpdate();											
		}

		for(var i=0;i<this._components.length;i++) { 
			if( this._components[i].updatePre() )
				this._components[i].update();
			this._components[i].updatePost();
		}

		for(var i=0;i<this._components.length;i++) {
			for(var j=0;j<this._components[i].traits.length;j++) this._components[i].traits[j].onAfterUpdate();	
			this._components[i].onAfterUpdate();
		}

		this._flag.redraw = 0;
		this._flag.redrawcount++;
		
	}

	for(var i=0;i<this._components.length;i++) { 
		this._components[i].onAfterPassive( this );
		for(var j=0;j<this._components[i].traits.length;j++) this._components[i].traits[j].onAfterPassive( this );
	}


	if( this._flag.drawonce ) {
		return;
	}


	window.requestAnimationFrame(function(){
		try { self.update(); } catch(e) { log(e); self.update();  }
	});
}


/** Increment the unique id
 *   
 *	function UID
 *	@see 
 */	
Canvas.prototype.UID = function() {	
	return this._uid++;
}


/** Remove the canvas
 *   
 *	function remove
 *	@see 
 */	
Canvas.prototype.remove = function() {	
	this._canvas.remove();
}

/** Get the image of the canvas
 *   
 *	function toImage
 *	@see 
 */	
Canvas.prototype.toImage = function() {	
	var image = new Image();
	this._flag.redraw = 1;
	this._flag.drawonce = 1;
	this._scale = 1; // no scaling for toimage
	this.update();	
	image.src = this._canvas.toDataURL(); 	
	return image;
}

Canvas.prototype.saveBackgroundColorGradient = function(s0,s1) {
	this.bggrad = {colorstop1:s0,colorstop2:s1};
	this._flag.redraw = 1;
}

Canvas.prototype.backgroundColorGradient = function(s0,s1) {
	this._ctx.fillStyle = Commons.color.gradientc(this._canvas.width/2,this._canvas.height/1.3,this._canvas.width/2,0,s0,s1,this._ctx);
	this._ctx.fillRect(0,0,this._canvas.width,this._canvas.height);
}

/** Commons constructor
 *
 *	function Commons
 *	@constructor
 */
function Commons() { }


/** Extend the base 
 *	
 *	function static extend
 *	@return 
 */
Commons.extend = function(self, base) {
	for(var name in base) if(self[name]===undefined || (typeof base[name]!=='function')) self[name]=base[name];	
	return self;
}

/** Extend the clone 
 *	
 *	function static clone
 *	@return 
 */
Commons.clone = function(self) {
	var p = {}, c = [];
	try {
		p = JSON.parse(JSON.stringify(self, function(key, value) {
				if ( (typeof value === 'object') && value !== null) {
					if (c.indexOf(value) !== -1) return;
        			c.push(value);
				}
    			return value;
			}));	
	} catch(e){ console.debug( e ); }
	return p;	
}


/** Cache all data values
 *	
 *	object static cache
 */
Commons.cache = function(id, data) {
	if( data ) Commons._cache[id] = data;
	return Commons._cache[id];	
}

/** Cache all png data values
 *	
 *	object static pngcache
 */
Commons.pngcache = function(id, data) {
	return Commons.cache('png-'+id, data);
}

/** Cache container of all data values
 *	
 *	Object static cache
 *	@private {Object}
 */
Commons._cache = {	};

/** Benchmark timer
 *	
 *	function static timer
 *	@return 
 */
Commons.timer = function(name) {
    var start = new Date();
    return {
        stop: function() {
            var end  = new Date();
            var time = end.getTime() - start.getTime();
            console.log('Timer:', name, 'finished in', time, 'ms');
        }
    }
};


/** Generate guid
 *	
 *	function static guid
 *	@return 
 */
Commons.guid = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

/** Get the distance of 2 points
 *	
 *	function static hypot
 *	@return 
 */
Commons.hypot = function(x1,x2,y1,y2){
	var a = x1 - x2,  b = y1 - y2;
	return Math.sqrt( a*a + b*b );
}


Commons.pointLinear = function(x, y, dx, dy, pct) {
	return [ x + (dx - x) * pct, 
		y + (dy - y) * pct ];
}

/** 
 *	
 *	function static rotate
 *	@param {number} x
 *	@param {number} y
 *	@param {number} cx1
 *	@param {number} cy1
 *	@param {number} cx2
 *	@param {number} cy2
 *	@param {number} dx
 *	@param {number} dy
 *	@param {number} pct
 */
Commons.pointBezierCurve = function(x, y, cx1, cy1, cx2, cy2, dx, dy, pct) {
    return [ Commons.cubicN(pct, x, cx1, cx2, dx),
		Commons.cubicN(pct, y, cy1, cy2, dy) ];
}

Commons.cubicN = function(T, a, b, c, d) {
    var t2 = T * T;
    var t3 = t2 * T;
    return a + (-a * 3 + T * (3 * a - a * T)) * T + (3 * b + T * (-6 * b + b * 3 * T)) * T + (c * 3 - c * 3 * T) * t2 + d * t3;
}

// console.debug( Commons.pointLinear(0,0,15,15,0.5) );
// console.debug( Commons.pointBezierCurve( {x:301,y:90}, {x:240,y:103}, {x:89,y:121}, {x:149,y:279}, 0.1) );
// can be used in frame/time with 100x100 dimension

/** Rotate the given coordinates agains an orgin mid point
 *	
 *	function static rotate
 *	@return 
 */
Commons.rotate = function(x, y, xm, ym, a){
	// rotate the points
	var cos = Math.cos, sin = Math.sin,
	r = a * Math.PI / 180, // Convert to radians 	
	// Subtract midpoints, so that midpoint is translated to origin and add it in the end again				
	xr = (x - xm) * cos(r) - (y - ym) * sin(r)   + xm,
	yr = (x - xm) * sin(r) + (y - ym) * cos(r)   + ym;

	return [xr, yr];	
} 

/**	Convert value with base1 to base2
 *	
 *	static function Commons.convertBase
 *  @return
 */
Commons.convertBase = function(value, base1, base2) {
	if (typeof(value) == "number") {
		return parseInt(String(value),10).toString(base2);
	} else {
		var d = parseInt(value.toString(), base1).toString(base2);
		return base2==10 ? parseInt(d,10) : d;
	};
}

/**	Zero left padding
 *	
 *	static function Commons.pad
 *	@param {number} width
 *	@param {string} string
 */
Commons.pad = function(width, string) {
	return (width <= string.length) ? string : Commons.pad(width, '0'+string )
}

Commons.padr = function(width, string) {
	return (width <= string.length) ? string : Commons.padr(width, string+'0' )
}


/** Contains 122 color palette
 *  
 *  @private {Array}
 */
Commons._color = [];

/** Color extraction 636056 color set. From 0 - 636055. 
 *	Color extraction 122 palette. Linear or Bezier color set.
 *
 *	static function Commons.color
 *	@param {number} p array color index
  *	@param {object|undefined} c context
 *	@return 
 */
Commons.color = function(p,c){			
	if( !Commons._color.length ) {
		var h=[10,30,50,70,90,100,120,160,200,215,240,280,310,360]; // 7x2x8 -- 16*7

		for(var i=-1;i<9;i++) // initial 3 extreme values 0:alpha,1:gray(11),9:whitewash(96),2-8:gradient colorset
			Commons._color.push('hsl(0,0%,'+i*12+'%)');			
		
		for(var i=0;i<2;i++) // initial black and white shades
			for(var j=0;j<7;j++)
				Commons._color.push('hsl(0,0%,'+((j*7)+(i*58))+'%)'); 

		for(var i=0;i<h.length;i++) { // 8 level of defined hue 			
			for(var j=1;j<5;j++) // 4 levels of lightness 
				Commons._color.push('hsl('+h[i]+',85%,'+(j*4+60)+'%)');			
			for(var j=1;j<4;j++) // 3 levels of saturation 
				Commons._color.push('hsl('+h[i]+','+(j*15+30)+'%,50%)');
		}
				
	}	

	return (c && p>1 && p<9) ? Commons.color.gradient(p-2,c) : Commons._color[p];
}




/** Linear gradient of the 7 presets
 *  
 *  static function Commons.color.gradient
 */
Commons.color.gradient = function(p,c) {
	return Commons.color.gradientc(200,400,200,0,Commons._color[10+(14*p)],Commons._color[9+(14*(p+1))],c);
}

Commons.color.gradientc = function(x0,y0,x1,y1,s0,s1,c) {
	var grad = c.createLinearGradient(x0,y0,x1,y1);
	grad.addColorStop(0, s0);
	grad.addColorStop(1, s1	);
	return grad;
}

/*
var canvas = document.getElementById('canvas'); 
var context = canvas.getContext('2d'); 
var grad = context.createLinearGradient(100,200,100,0);

grad.addColorStop(0, 'rgba(0,255,0,1)');
grad.addColorStop(1, 'rgba(0,128,128,1)');

context.fillStyle = grad;
context.fillRect(0, 0, 200,200); 
*/


/** Base from the 123 bytes removing return, newline \ and "
 *  The 123th character (122) is used as control indicator. Allow number parameter is 0-122.
 *
 *  Commons._base123 = "	 !#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";
 *
 *	function base123
 *	@return 
 */
Commons.base123 = function(){
	var s = Commons.base123_(arguments[0]);
	for(var i=1;i<arguments.length;i++) s+=Commons.base123_(arguments[i]);
	return s;	
}
Commons.base123_ = function(b){
	// populate the base string
	if( !Commons._base123 ) {
		for(var i=1;i<128;i++) Commons._base123 += (i!=10&&i!=13&&i!=34&&i!=92) ? String.fromCharCode(i) : '';
		Commons._base123 = Commons._base123.slice(30) + Commons._base123.substr(0,30);	
	}

	// return the character or equivalent count
	return Commons.isNumber(b) ? Commons._base123.charAt(b) : Commons._base123.indexOf(b);	
}

Commons.base123.splitdelimeter = function(s) {	
	return s.split(Commons.base123(122));
}

Commons.base123.putdelimeter = function(s) {	
	return s+Commons.base123(122);
}	

Commons.base123.joinslice = function(ar,start,end) {	
	return ar.slice(start,end).join(Commons.base123(122));
}	


Commons.base123.charAt = function(s,i) {
	return Commons.base123(s.charAt(i));
}

Commons.base123.floor = function() {
	var s = '';
	for(var i=0;i<arguments.length;i++) s+=Commons.base123(Math.floor(arguments[i]));
	return s;
}	

Commons.base123.binary = function(c) { // 6 digit binary value
	var s = "";
	for(var i=0;i<c.length;i++)
		s += Commons.pad(8,Commons.convertBase(Commons.base123(c.charAt(i)),10,2)).substring(2);
	return s
}



/** Contains the base123 character series
 *	
 *	@private {string}
 */
Commons._base123 = '';


/** Check if number
 *	
 *	function isNumber
 *	@return 
 */
Commons.isNumber = function(b){
	return typeof b == 'number';
}


Commons.isString = function(s){
	return typeof s == 'string';
}

/** Choose random inclusive numbers from min and max
 *	
 *	function choose
 *	@return 
 */
Commons.choose = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/** Base123 and with 6 flag switch. first paramter is a character, max 6 functions
 *	
 *	function sixflagged
 *	@return  
Commons.sixflagged = function() {
    var f = Commons.base123.binary(arguments[0]);
    for(var i=0;i<f.length;i++) // maximum 6 length
    	if(f.charAt(i)=='1' && typeof arguments[i+1] === 'function') 
    		arguments[i+1]();   
}
 */

/** Convert a base123 character to a decimal value
 *	
 *	function sixtodecimal
 *	@return 
 
Commons.sixtodecimal = function(c) {
	return Commons.convertBase(Commons.base123.binary(c),2,10);
}
 */

/** Convert a decimal value to a base123 character
 *	
 *	function decimaltosix
 *	@return 
 
Commons.decimaltosix = function(n) {
	var ar = Commons.convertBase(n,10,2).replace(new RegExp("^0"),"").match(/.{1,6}/g), b = "";
	for(var i=0;i<ar.length;i++)
		b += Commons.base123(Commons.convertBase(ar[i],2,10));
	return b;
}
 */

/** timeout
 *	
 *	function timeout
 *	@return 
 
Commons.timeout = function(f,n)  {
	setTimeout(f,n==undefined?9:n);
}
*/

/** 
 *	
 *	function iftrue
 *	@return 
 */
Commons.ifanytrue = function(){
	var r = arguments[0];
	for(var i=1;i<arguments.length;i++)
		if(r==arguments[i]) return true;
	return false;
}


/** Common logger function for tap engine, it will be disabled during the release build. 
 *  
 *
 *	function log
 */	
function log() { 
//	var args = Array.prototype.slice.call(arguments);
	console.debug.apply(console, args); 
}