var TILE_WIDTH = 16;
var TILE_HEIGHT = 16;

var dropzone = document.getElementById('dropzone'),
    dropTitle = document.getElementById('dropTitle'),
    canvas = document.getElementById('myCanvas');

//  Change dropzone color to black after dropping a file and upload data
dropzone.ondrop = function (e) {
  e.preventDefault();
  dropzone.innerHTML = "";
  if (e.dataTransfer.files.length > 1) {
    alert("Please drop only one image");
    return;
  }
  this.className = 'dropzone';
  loadImage(e.dataTransfer.files[0]);
};

//  Change dropzone color to black on drag over
dropzone.ondragover = function () {
  this.className = 'dropzone dragover';
  return false;
};

//  Change dropzone color to default grey on drag leave
dropzone.ondragleave = function () {
  this.className = 'dropzone';
  return false;
};

function renderImage(src) {
  var image = new Image();
  image.onload = function() {

    var ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;

    //  Count integer-number of canvas width and height compared to tile width and height. ~~ is analog to a Math.floor();
    var intWidth = ~~(canvas.width/TILE_WIDTH),
        intCanvasWidth = intWidth*TILE_WIDTH,
        intHeight = ~~(canvas.height/TILE_HEIGHT),
        intCanvasHeight = intHeight*TILE_HEIGHT;

    // Change size of dropzone according to picture size
    dropzone.style.width = intCanvasWidth + 'px';
    dropzone.style.height = intCanvasHeight+ 'px';
    dropzone.style.lineHeight = '0px';
    dropTitle.style.display = 'none';
    ctx.drawImage(image, 0, 0, image.width, image.height);
    canvas.style.display = 'none';

    //..Getting rgb image data for every tile
    for(var dy = 0; dy < intCanvasHeight; dy += TILE_HEIGHT) {
      for (var dx = 0; dx < intCanvasWidth; dx += TILE_WIDTH){

        var rgb = {
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 0
        },
            avColor = {
                    r: 0,
                    g: 0,
                    b: 0,
                    a: 0
        },
        imageData = ctx.getImageData(dx, dy, TILE_WIDTH, TILE_HEIGHT);
        pix = imageData.data;
        rgbaLength = pix.length;
        colorLength = rgbaLength/4;

        //  Fetch red, green, blue
        for (var i = 0; i < rgbaLength; i += 4) {

          rgb.r += pix[i]; //red
          rgb.g += pix[i+1]; //green
          rgb.b += pix[i+2]; //blue
          // rgb.a += pix[i+3]; //alpha - for transparency
        }

        //  Count average color. ~~ is analog to a Math.floor();
        avColor.r = ~~(rgb.r/colorLength);
        avColor.g = ~~(rgb.g/colorLength);
        avColor.b = ~~(rgb.b/colorLength);
        // avColor.a = ~~(rgb.a/colorLength);

        var hex = rgbToHex(avColor.r, avColor.g, avColor.b);
        getTile(hex);
      }
    }
  };
  image.src = src;
}

//  Upload data
function getTile (hexColor) {
  var formData = new FormData();
  xhr = new XMLHttpRequest();
  xhr.open('get', '/color/' + hexColor);
  xhr.send(formData);
  xhr.onload = function() {
    var data = this.responseText;
    displayUploads(data);
  };
}

function loadImage(src) {

  //  Prevent any non-image file type from being read.
  if(!src.type.match(/image.*/)){
    alert("The dropped file is not an image: " + src.type);
    return;
  }

  //  Create our FileReader and run the results through the render function.
  var reader = new FileReader();
  reader.onload = function(e){
    renderImage(e.target.result);
  };
  reader.readAsDataURL(src);
}

//  Draw image
function displayUploads (img) {
  dropzone.insertAdjacentHTML('beforeend', img);
}

//  These are for converting rgb to HEX
function componentToHex(component) {
  var hex = component.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "" + componentToHex(r) + componentToHex(g) + componentToHex(b);  //e.g. 69573d without #
}
