# SEECOG
3D visualization tool

Hosted at [seecogviewer.github.io](seecogviewer.github.io)

## Creating SEECOG Data and Directory

Before starting, make sure:
* Freesurfer is installed on your computer
* You have a python environment with nibabel installed

To create SEECOG data and a local copy of the program run the following in the terminal:

```
python /home/nmarkowitz/Documents/IEEG.github.io/preproc/seecog.py <freesurfer_subject_id>
```

The `<freesurfer_subject_id>` input is the unique identifier of the freesurfer subject. Alternatively you can give the full path to your freesurfer subject instead of just providing the subject id.
