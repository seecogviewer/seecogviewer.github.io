# This module is for creating the subcortical structures and putting them in a readable format
from nibabel.freesurfer.io import read_geometry, write_geometry
import os
import json
import shutil
import sys
from os.path import isfile, isdir, join

# Determine if input is full file path to freesurfer subject or just the subject ID
subInput = sys.argv[1]

if not isdir(subInput):
    SUBJECTS_DIR = os.environ['SUBJECTS_DIR']
    fsDir = SUBJECTS_DIR + os.sep + subInput
else:
    fsDir = subInput

if not isdir(fsDir):
    print('Can not find %s' % fsDir)
else:
    print('=========>Using %s' % fsDir)


# Important filepaths
subcortDir = join(fsDir,'subcorts')
subcortDir_tmp = join(subcortDir,'tmp')
jellyfish_dataDir = join(fsDir,'elec_recon','JellyFish','data')
os.makedirs(subcortDir_tmp)
# Dictionary of labels and corresponding values
subcort_dict = {
        'L_Thalamus': {'id': '10', 'color': '#b5ffbe'},
        'L_Caudate': {'id': '11', 'color': '#d7cfff'},
        'L_Putamen': {'id': '12', 'color': '#fa05b9'},
        'L_Pallidum': {'id': '13', 'color': '#a2a3a2'},
        'L_Hippocampus': {'id': '17', 'color': '#f7ffcc'},
        'L_Amygdala': {'id': '18', 'color': '#ffbfc1'},
        'R_Thalamus': {'id': '49', 'color': '#b5ffbe'},
        'R_Caudate': {'id': '50', 'color': '#d7cfff'},
        'R_Putamen': {'id': '51', 'color': '#fa05b9'},
        'R_Pallidum': {'id': '52', 'color': '#a2a3a2'},
        'R_Hippocampus': {'id': '53', 'color': '#f7ffcc'},
        'R_Amygdala': {'id': '54', 'color': '#ffbfc1'}
        }

# Create the meshes using freesurfer commands
for subc in subcort_dict.keys():

    # Set names of files that will be used in this loop
    pretessF = subcortDir_tmp + os.sep + subc + '_pretess.mgz'
    tessF = subcortDir_tmp + os.sep + subc + '_tess.lab'
    smoothF = subcortDir_tmp + os.sep + subc + '_tess.smooth'
    #subcortF = subcortDir + os.sep + subc.lower().replace('_','h.')
    subcortF = jellyfish_dataDir + os.sep + subc.lower().replace('_','h.')

    # Pretess
    pretess_cmd_tmp = ['mri_pretess', join(fsDir,'mri','aseg.mgz'), subcort_dict[subc]['id'], join(fsDir,'mri','norm.mgz'), pretessF]
    pretess_cmd = ' '.join(pretess_cmd_tmp)
    os.system(pretess_cmd)

    # Tessellate
    tess_cmd_tmp = ['mri_tessellate', pretessF, subcort_dict[subc]['id'], tessF]
    tess_cmd = ' '.join(tess_cmd_tmp)
    os.system(tess_cmd)

    # Smooth
    smooth_cmd_tmp = ['mris_smooth','-nw', tessF, smoothF]
    smooth_cmd = ' '.join(smooth_cmd_tmp)
    os.system(smooth_cmd)

    # Now reformat it so it's not in the weird QUAD format
    # By default the above freesurfer commands output the mesh in a funky, hard to read file format
    coords,faces = read_geometry(smoothF)
    write_geometry(subcortF,coords,faces)

shutil.rmtree(subcortDir)
