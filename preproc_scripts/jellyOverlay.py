f = '/Volumes/NM01/HBML/derivatives/Freesurfer_Subjects/NS163/elec_recon/JellyFish2/data/FingerTapping_overlay.mgh'

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

with open('lh_F.overlay','w') as fo:
    fo.write(outputTxt)

