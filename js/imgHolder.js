$(document).ready(function () {

    //#region Handling electrode objects
    // Object for DOMs that can hold static images
    imgHolder = {
        domElement1: document.getElementById('elecSlideShow'),
        domElement2: document.getElementById('elecStatic'),
        //activeDOM: document.getElementById('elecSlideShow'),
        //inactiveDOM: document.getElementById('elecStatic'),
        activeDOM: 'elecSlideShow',
        leftButton: document.getElementById('slideshow-bttn-l'),
        rightButton: document.getElementById('slideshow-bttn-r'),
        _slideShowEnabled: false,
        _slideShowIndex: -1,
        visible: null,
        imgs: [],
        enableSlideShow: function () {
            this.leftButton.classList.remove('w3-disabled');
            this.leftButton.disabled = false;
            /*this.leftButton.addEventListener('click', function() {
                debugger;
                this.nextSlide(-1);
            });*/
            this.rightButton.classList.remove('w3-disabled');
            this.rightButton.disabled = false;
            /*this.rightButton.onclick = addEventListener('click', function() {
                this.nextSlide(1);
            });*/
            this._slideShowEnabled = true;
        },
        disableSlideShow: function () {
            this.leftButton.classList.add('w3-disabled');
            this.leftButton.disabled = true;
            //this.leftButton.onclick = null;
            this.rightButton.classList.add('w3-disabled');
            this.rightButton.disabled = true;
            //this.rightButton.onclick = null;
            this._slideShowEnabled = false;
        },
        createImg: function(src,htmlImgId=null) {
            if (src !== undefined) {
                let elecImg = document.createElement("IMG");
                elecImg.src = src;
                if (htmlImgId !== null) {
                    elecImg.id = htmlImgId;
                }
                elecImg.className = "elecImg";
                elecImg.classList.add('w3-display-center');
                /*elecImg.onclick = function (event) {
                    if (event.shiftKey) {
                        //imgHolder.imgs.splice(this._slideShowIndex,1);
                        elecImg.remove();
                        imgHolder.nextSlide(-1);
                    }
                }*/
                return elecImg;
            }
        },
        appendImg: function (srcData,htmlImgId) {
            htmlImg = this.createImg(srcData,htmlImgId);
            if (!this.imgs.includes(htmlImg)) {
                $(htmlImg).hide();
                //this.imgs.push(htmlImg);
                if (!this._slideShowEnabled && this.activeDOM == 'elecSlideShow') {
                    this.enableSlideShow();
                } else {
                    $(htmlImg).show();
                }
                document.getElementById(this.activeDOM).appendChild(htmlImg);
                this.imgs.push(htmlImg);
                if (this.activeDOM == 'elecSlideShow') {
                    this.nextSlide(1);
                }
                //this.activeDOM.appendChild(htmlImg);
            }
            return htmlImg;
        },
        destroyImg: function(img) {

        },
        destroyImgs: function () {
            forEach(this.imgs, function (ii) {
                ii.remove();
            });
            this.disableSlideShow();
            this._slideShowIndex = -1;
        },
        changeDOM: function () {
            forEach(this.imgs, function (ii) {
                this.inactiveDOM.appendChild(ii);
            });
            let newlyActiveDOM = this.inactiveDOM;
            let newlyInactiveDOM = this.activeDOM;
            this.activeDOM = newlyActiveDOM;
            this.inactiveDOM = newlyInactiveDOM;
            if (this.domElement1 == this.activeDOM) {
                this.enableSlideShow();
            } else {
                this.disableSlideShow();
            }
        },
        nextSlide: function (step) {
            
            let activeImg, nextImg;
            if ($('#elecSlideShow > img').length !== 0) {
                // Find currently active slide
                $('#elecSlideShow > img').each(function(index, el) {
                    if ($(this).css('display') == 'block') {
                        activeImg = $(this);
                        return false;
                    }
                });

                // Determine the next slide
                if (step > 0 && $(activeImg).next().length > 0 ) {
                    nextImg = $(activeImg).next();
                } else if (step > 0 && $(activeImg).next().length === 0 ) {
                    nextImg = $('#elecSlideShow > img:first');
                } else if (step < 0 && $(activeImg).prev().length > 0 ) {
                    nextImg = $(activeImg).prev();
                } else {
                    nextImg = $('#elecSlideShow > img').last();
                }
                $(activeImg).hide();
            } else {
                nextImg = $('#elecSlideShow > img');
            }

            // Show next image
            $(nextImg).css('display','block');
        }
        /*nextSlide: function (step) {
            let currentSlide = this.imgs[this._slideShowIndex];
            let maxSlideIndex = this.imgs.length - 1;
            this._slideShowIndex += step;
            //console.log('Now on slide index' + this._slideShowIndex.toString());
            if (this.imgs.length === 0 && this.activeDOM === this.domElement1) {
                this.disableSlideShow();
                this._slideShowIndex = -1;
                console.log('Now on slide index' + this._slideShowIndex.toString());
                return;
            } else if (this._slideShowIndex > maxSlideIndex) {
                this._slideShowIndex = 0;
                console.log('Now on slide index' + this._slideShowIndex.toString());
            } else if (this._slideShowIndex < 0) {
                this._slideShowIndex = maxSlideIndex;
                console.log('Now on slide index' + this._slideShowIndex.toString());
            }
            let nextSlide = this.imgs[this._slideShowIndex];
            if (currentSlide !== undefined) {
                $(currentSlide).hide();
            }
            $(nextSlide).css('display','block');
        }*/
    };

    $('#slideshow-bttn-l').click( function() {
        imgHolder.nextSlide(-1);
    });

    $('#slideshow-bttn-r').click( function() {
        imgHolder.nextSlide(1);
    });

    //#endregion

});