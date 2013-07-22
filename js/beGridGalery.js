/**
 * "beGridGalery"-JQuery Plugin v0.1.1 - 2013-07-22
 * Copyright 2013, Benjamin Egner
 * 
 * Released under the MIT license
 */


/**
 * @author Benjamin Egner
 * @version v0.1.1 - Fixed some performace Issues
 * @version v0.1 - Initial Code
 */


// No Conflict Container
(function( $ ) { // $ = jQuery here...


/**
 * Internal beGridImageEngine. 
 * Private prototype! Could only be used in this anonymous namespace
 *
 * usage: var myObject = new beGridImageEngine();
 *
 * @param  {object} options Options
 * gridItemSize {int}: edgelenth of gridfield (in pixel)
 * gridSize.height {int}: height of a grid (in fields)
 * gridSize.width {int}: width of a grid (in fields)
 * getFieldHTML {function}: callbackfunction to get fieldHTML
 * imageMargin: margin between an image and the fieldborders
 */
var beGridImageEngine = function(options) {
  this.data = [];
  this.images = [];
  this.gridItemSize = options.gridItemSize;
  this.gridHeight = options.gridSize.height;
  this.gridWidth = options.gridSize.width;
  this.imageMargin = options.imageMargin;

  this.getFieldHTML = options.getFieldHTML;
  if (typeof(this.getFieldHTML) != "function") {
    this.getFieldHTML = this.getImageContainerHTMLDefault;
  }
  this.dom = $("<div class='mydom' />");
  this.dom.width(this.gridWidth*this.gridItemSize)
    .height(this.gridHeight*this.gridItemSize)
    .css("overflow", "hidden")
    .css("display", "block")
    .css("position", "relative")
    .css("background", "#000")
}

/**
 * Sets the size of one Image (in fields).
 * 
 * @param  {int} id Id of the image
 * @param  {[type]} width Fieldwidth of the image
 * @param  {[type]} height Fieldheight of the image
 */
beGridImageEngine.prototype.setImageSize = function(id, width, height) {
  var image = this.findImageByID(id);
  if (width < 1) width = 1;
  if (height < 1) height = 1;
  image.width = width;
  image.height = height;
}     

/**
 * Increase Imagesize of an image by one field
 * 
 * @param  {int} id Id of the image
 */
beGridImageEngine.prototype.enlargeImage = function(id) {
  var image = this.findImageByID(id);
  if (image != null) {
    this.setImageSize(id, image.width+1, image.height+1);
  }
}

/**
 * Decrease Imagesize of an image by one field
 * 
 * @param  {int} id Id of the image
 */
beGridImageEngine.prototype.reduceImage = function(id) {
  var image = this.findImageByID(id);
  if (image != null) {
    this.setImageSize(id, image.width-1, image.height-1);
  }
}

/**
 * Moves an Image inside the array to a specified position...
 * 
 * @param  {int} id Id of the image
 * @param  {[type]} order index to move the image to
 */
beGridImageEngine.prototype.setImageOrder = function(id, order) {
  var old_index = this.getImageIndexByID(id);
  var new_index = order;
    if (new_index < 0) new_index = 0;

    if (new_index >= this.images.length) {
        var k = new_index - this.images.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.images.splice(new_index, 0, this.images.splice(old_index, 1)[0]);
}

/**
 * Moves the Image up one position
 * 
 * @param  {int} id Id of the image
 */
beGridImageEngine.prototype.moveUpImage = function(id) {
  var curIdx = this.getImageIndexByID(id);
  if (curIdx != null) {
    this.setImageOrder(id, curIdx-1);
  }
}

/**
 * Moves the Image down one position
 * 
 * @param  {int} id Id of the image
 */
beGridImageEngine.prototype.moveDownImage = function(id) {
  var curIdx = this.getImageIndexByID(id);
  if (curIdx != null) {
    this.setImageOrder(id, curIdx+1);
  }
}


/**
 * Returns an image by id
 *
 * @param  {int} id Id of the image
 * @return {object} image
 */
beGridImageEngine.prototype.findImageByID = function(id) {
  var foundImage = null;
  $.each(this.images, function(idx, image) {
    if (image.id == id) {
      foundImage = image;
      return false;
    }
  })
  return foundImage;
}

/**
 * Returns the listposition (index) of an image
 *
 * @param  {int} id Id of the image
 * @return {int} Id of the image
 */
beGridImageEngine.prototype.getImageIndexByID = function(id) {
  var foundImageIDX = null;
  $.each(this.images, function(idx, image) {
    if (image.id == id) {
      foundImageIDX = idx;
      return false;
    }
  })
  return foundImageIDX;
}

/**
 * Updates the Dom of the Grid and reorder the images
 *
 * @param {bool} animate Should the images animate, if there are changes in image positions?
 */
beGridImageEngine.prototype.updateDom = function(animate) {
  var that = this;
  $.each(this.images, function(idx, image) {
    if (image.dom != null) {
      that.setImageDomPos(image, animate);
    }
    else {
      // console.log("IMAGE IS NULL???")
    }
    // console.log(image);
  });
}

/**
 * Returns the Grid Dom
 * If the are Images, which are not created till now - create it!
 * 
 * @return {jQuery} jQuery-Object of the Grid
 */
beGridImageEngine.prototype.getDom = function() {
  var that = this;
  // that.dom.empty();
  $.each(this.images, function(idx, image) {
    if (image.dom == null) {
      image.dom = that.createImageDom(image)
      image.dom.appendTo(that.dom);
    }
    that.setImageDomPos(image);

    // console.log(image.dom);
    
  });
  return that.dom;
}

/**
 * Adds an image to the grid
 * 
 * @param  {string} id ImageID (needs to be unique!)
 * @param  {int} width Width of the image (in fields)
 * @param  {int} height Height of the image (in fields)
 * @param  {string} url src of the image
 */
beGridImageEngine.prototype.addImage = function(id, width, height, url) {
  
  // Todo - check, if imageid already exists, and throw an exception!
  // Todo - check, if width & height is reasonable
  var myImage = {id:id, width:width, height:height, x:null, y:null, visible:null, url:url, dom:null};
  this.images.push(myImage);
}

/**
 * places all image onto the grid to the next free space
 * if no space is available, the image will be skipped
 */
beGridImageEngine.prototype.placeImages = function() {
            
  var that = this;

  that.initGrid();  
  $.each(this.images, function(idx, image) {

    var pos = that.findSpace(image.width, image.height);

    if (pos != null) {
      // Belegung merken...
      for (i = 0; i<image.width; i++) {
        for (j = 0; j<image.height; j++) {
          that.data[pos.x+i][pos.y+j] = 1;
        }
      }
      image.visible = true;
      image.x = pos.x;
      image.y = pos.y;
    }
    else {
      image.visible = false;
    }

    
  })
  
}

/**
 * Sets the dimensions and gridlocation of the image to the dom-reprenter
 * 
 * @param  {object} image imageObject
 * @param  {boolean} animate Should the image be animated to a new position (if position has changed)?
 */
beGridImageEngine.prototype.setImageDomPos = function(image, animate) {

  var isVisible = image.visible;

  if (image.x == null ||
    image.y == null) {
    isVisible = false;
  }

  var cssData = {
    left:image.x*this.gridItemSize + this.imageMargin,
    top:image.y*this.gridItemSize + this.imageMargin,
    width:image.width*this.gridItemSize - this.imageMargin*2,
    height:image.height*this.gridItemSize - this.imageMargin*2,
    opacity:(isVisible ? 1:0),
    zIndex:(isVisible ? 5:0)
  }

  if (animate) {
    image.dom.animate(cssData, {step: function(a, b) {
      if (b.prop == "width") {
        $(this).css("background-size", a+"px "+a+"px");
      }
    }});
  }
  else {
    image.dom.css(cssData);
  }
}

/**
 * Create the dom of an image
 * 
 * @param  {object} image ImageObject
 * @return {jQuery} jQuery jQueryElement of the created image.
 */
beGridImageEngine.prototype.createImageDom = function(image) {
  
  var elementHTML = this.getFieldHTML(image);
  var element = $(elementHTML);
  element.css("background", "rgb("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+")");
  element.css("background-image", "url("+image.url+")");
  element.css("background-size", (image.width*this.gridItemSize)+"px "+(image.height*this.gridItemSize)+"px");
  element.css("position", "absolute");
  element.css("display", "block");
  element.width(image.width*this.gridItemSize);
  element.height(image.height*this.gridItemSize);
  return element;
}

/**
 * Gets the HTML of an Image
 * @param  {object} image Imagedata
 * @return {string} HTML of the ImageElement
 */
beGridImageEngine.prototype.getImageContainerHTMLDefault = function(image) {
  var elementHTML = "<div class='element' >";
  elementHTML+= "IMAGE: "+image.id;
  elementHTML+= "</div>";
  return elementHTML;
}


/**
 * Searches free space in the grid (from left to right, top to center)
 * 
 * @param  {int} width Width (in fields)
 * @param  {int} height Height (in fields)
 *
 * @return {object} Object with top(x),left(y) coordinates of free space - or null (if no proper space was found)
 */
beGridImageEngine.prototype.findSpace = function(width, height) {
  for (var y = 0; y < this.gridHeight-height+1; y++) {
    for (var x = 0; x < this.gridWidth-width+1; x++) {

      var isAllEmpty = true;
      if (this.data[x][y] == 0 &&
        x+width < this.gridWidth+1 &&
        y+height < this.gridHeight+1) {
        // check, if underlying fields are empty too...
        for (i = 0; i<width; i++) {
          for (j = 0; j<height; j++) {
            if (this.data[x+i][y+j] != 0)
            {
              isAllEmpty = false;
            } 
          }
        }

          // Position found!
        if (isAllEmpty) {
          return {x:x, y:y};
        }
      }
      
    }
  }
  return null;
}

/**
 * Initialize the Grid-Memory
 */
beGridImageEngine.prototype.initGrid = function() {
  this.data = [];
  for (var y = 0; y < this.gridHeight; y++) {
    var gridLine = [];
    for (var x = 0; x < this.gridWidth; x++) {
      gridLine.push(0);
    } 
    this.data.push(gridLine);
  }

}




/**
 * JQuery Plugin Wrapper
 * */


$.fn.beGridGalery = function(method) {  

  var element = $(this);


  var methods = {
    init : function( userOptions ) { 

      // default options...
      var options = {
        gridSize: { // Grid Size
          height: 15,
          width: 15
        },
        imageMargin:5, // Space between image and Fieldborder
        gridItemSize: 50, // FieldSize in Pixel
        imageData: null, // Array of Images
        getFieldHTML: null // function(imageData) { return '<div class="element"></div>'; }
      }

      // Extend the default Options with user Options
      $.extend(options, userOptions); 
      
      // create Grid
      var myGrid = new beGridImageEngine(options);

      // Store the grid instance to the node
      // TODO: look into memory leak implications on firefox 
      element.data('beGridGalery', myGrid); 

      // Add images from imagedata array to the grid
      $.each(options.imageData, function(idx, image) {
        myGrid.addImage(idx, image.size, image.size, image.url);
      });

      // get jQuery Object of current domnode 
      // TODO: same as element?
      var gridStage = $(this);

      // Setup Images
      myGrid.placeImages();

      // Append Grid Dom to the stage
      myGrid.getDom().appendTo(gridStage);

      // Returs beGridGalery cause jQuery want that!
      return $(this);   
    },

    /**
     * jQuery Pluginwrapper - Increase fieldsize of an image by 1
     * @param  {object} object
     * object.id {int}: id of the image
     * 
     * @return {jQuery.beGridGalery} Current beGridGalery
     */
    enlargeImage : function(options) {
      var myGrid = element.data('beGridGalery');
      // Todo Check if options is object and property id exists - otherwise: throw exception
      myGrid.enlargeImage(options.id);
      return $(this);   
    },


    /**
     * jQuery Pluginwrapper - Decrease fieldsize of an image by 1
     * @param  {object} object
     * object.id {int}: id of the image
     * 
     * @return {jQuery.beGridGalery} Current beGridGalery
     */
    reduceImage : function(options) {
      var myGrid = element.data('beGridGalery');
      // Todo Check if options is object and property id exists - otherwise: throw exception
      myGrid.reduceImage (options.id);
      return $(this);   
    },


    /**
     * jQuery Pluginwrapper - Moves an image up in the list by 1
     * @param  {object} object
     * object.id {int}: id of the image
     * 
     * @return {jQuery.beGridGalery} Current beGridGalery
     */
    moveUpImage : function(options) {
      var myGrid = element.data('beGridGalery');
      // Todo Check if options is object and property id exists - otherwise: throw exception
      myGrid.moveUpImage (options.id);
      return $(this);   
    },


    /**
     * jQuery Pluginwrapper - Moves an image down in the list by 1
     * @param  {object} object
     * object.id {int}: id of the image
     * 
     * @return {jQuery.beGridGalery} Current beGridGalery
     */
    moveDownImage : function(options) {
      var myGrid = element.data('beGridGalery');
      myGrid.moveDownImage(options.id);
      return $(this);   
    },


    /**
     * jQuery Pluginwrapper - Place Images on Grid
     * 
     * @return {jQuery.beGridGalery} Current beGridGalery
     */
    placeImages: function() {
      var myGrid = element.data('beGridGalery');
      myGrid.placeImages();
      return $(this);   
    },


    /**
     * jQuery Pluginwrapper - Updates the Grid Dom
     * @param  {object} object
     * object.animate {boolean}: id of the image
     * 
     * @return {jQuery.beGridGalery} Current beGridGalery
     */
    updateDom: function(options) {
      var myGrid = element.data('beGridGalery');
      // Todo Check if options is object and property animate exists - otherwise: throw exception
      myGrid.updateDom(options.animate);
      return $(this);   
    }
  };


  // jQuery Method-Wrapper Method calling logic... (gzzz)
  if ( methods[method] ) {
    return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
  } 
  else if ( typeof method === 'object' || ! method ) {
    return methods.init.apply( this, arguments );
  } 
  else {
    $.error( 'Method ' +  method + ' does not exist on jQuery.beGridGalery' );
  } 


  };
})( jQuery );