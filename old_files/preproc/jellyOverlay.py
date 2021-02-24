f = '/Volumes/NM01/HBML/derivatives/fMRI-DTI/NS164/ses-preimplant01/FingerTapping.feat/reg_surf-lh-NS164/stats/zstat1.mgh'

import nibabel as nib
import json

fdat = nib.load(f)
dat = fdat.get_fdata().squeeze().tolist()

output = {
    'type': 'overlay',
    'mesh': 'lh.pial',
    'data': dat
}

outputTxt = json.dumps(output)

with open('NS164_lh_FingerTapping.overlay','w') as fo:
    fo.write(outputTxt)

fsDir = '/Volumes/NM01/HBML/derivatives/Freesurfer_Subjects/NS167'
from seecog import seecog
s = seecog(fsDir)
s.create_seecog_dir()
s.copy_seecog_files()

s.findAnat()
s.runAll()

s.import_ielvis()

s.write_elecData()
s.create_subcorts()