# SEECOG
3D visualization tool

Hosted at [seecogviewer.github.io](seecogviewer.github.io)

This tool is developed by Noah Markowitz and Dr. Stephan Bickel of The Human Brain Mapping Laboratory at The Feinstein Institutes for Medical Research at Northwell Health.  

## Creating SEECOG Data and Directory

Before starting, make sure:
* Freesurfer is installed on your computer
* You have a python environment with nibabel installed

To create SEECOG data and a local copy of the program run the following in the terminal:

```
python /home/nmarkowitz/Documents/IEEG.github.io/preproc/seecog.py <freesurfer_subject_id>
```

The `<freesurfer_subject_id>` input is the unique identifier of the freesurfer subject. Alternatively you can give the full path to your freesurfer subject instead of just providing the subject id.

## Future Goals

SEECOG is still in active development with many goals. Here are some.

### Database-like capabilities

Similar to [neurosynth](https://neurosynth.org/) to allow integration of imaging studies and electrode coordinates across studies

### Advanced computations

Integrate with websites and softwares for more advanced computations. Check out [brainlife](https://brainlife.io/)

### Additional file formats
There are a variety of file formats for neuroimaging and electrophysiology data. 
    - BIDS
    - NWB
    - Fieldtrip
    - Gifti
    - Freesurfer annotations, labels, curvature
    - Bioimagesuite mgrid
    - MNE

Please contact if you would like others to be included on this list

## Code Acknowledgements

The following toolboxes contributed to the development of SEECOG:

* [three.js](https://threejs.org/)
* [ami](https://github.com/FNNDSC/ami)
* [Tabulator](http://tabulator.info/)
* [dat.gui](https://github.com/dataarts/dat.gui)
* [jquery](https://jquery.com/)
* [jquery-ui](https://jqueryui.com/)
* [jscolor](https://jscolor.com/)
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/)
* [w3.css](https://www.w3schools.com/w3css/w3css_downloads.asp)
* [w3.js](https://www.w3schools.com/w3js/)

### Contact Us

For questions please reach out to nmarkowitz@northwell.edu or sbickel@northwell.edu
