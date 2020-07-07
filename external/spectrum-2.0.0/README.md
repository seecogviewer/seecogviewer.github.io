# Spectrum

### Basic Usage

Head over to the [docs](http://seballot.github.io/spectrum) for more information.

    <script src='spectrum.js'></script>
    <link rel='stylesheet' href='spectrum.css' />

    <input id='colorpicker' />

    <script>
    $("#colorpicker").spectrum({
        color: "#f00"
    });
    </script>

### npm

Spectrum is registered as package with npm. It can be installed with:

    npm install spectrum-colorpicker2

### Using spectrum with a CDN

CDN provided by [cdnjs](https://cdnjs.com/libraries/spectrum)


    <script src="https://cdn.jsdelivr.net/npm/spectrum-colorpicker2@2.0.0/dist/spectrum.min.js"></script>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/spectrum-colorpicker2@2.0.0/dist/spectrum.min.css">


### Building Spectrum Locally

If you'd like to download and use the plugin, head over to http://bgrins.github.io/spectrum/ and click the 'Download Zip' button.

If you'd like to run the development version, spectrum uses Grunt to automate the testing, linting, and building.  Head over to http://gruntjs.com/getting-started for more information.  First, clone the repository, then run:

    npm install -g grunt-cli
    npm install

    # runs jshint and the unit test suite
    grunt

    # runs jshint, the unit test suite, and builds a minified version of the file.
    grunt build

### Internationalization

If you are able to translate the text in the UI to another language, please do!  You can do so by either [filing a pull request](https://github.com/seballot/spectrum/pulls) or [opening an issue]( https://github.com/seballot/spectrum/issues) with the translation. The existing languages are listed at: https://github.com/seballot/spectrum/tree/master/i18n.

For an example, see the [Dutch translation](i18n/jquery.spectrum-nl.js).
