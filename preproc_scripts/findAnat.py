# To get anat loc using leptovox coords
# Swith x and y axes around
# z-coordinate must be flipped (zDimLength - zCoord)

import nibabel as nib
import os
import pandas as pd
from os.path import join

# Files and directories
fsDir = '/Volumes/NM01/HBML/derivatives/Freesurfer_Subjects/NS163'
subid = 'NS163'
elecReconDir = join(fsDir,'elec_recon')
leptovoxFile = elecReconDir + os.sep + subid + '.LEPTOVOX'
elecNamesFile = elecReconDir + os.sep + subid + '.electrodeNames'
aparcAsegFile = join(fsDir,'mri','aparc+aseg.mgz')
fslutFile = 'FreeSurferColorLUTnoFormat.txt'

# Importing the data
apas = nib.load(aparcAsegFile)
zdim = a.shape[2]

#region Import Freesurfer LUT
lutDict = {
    'code': [],
    'anat': [],
    'R': [],
    'G': [],
    'B': [],
    'A': []
}
f = open(fslutFile)
for l in f:
    l = l[:-1].split(' ')
    lutRow = [ii for ii in l if ii != '']
    lutDict['code'].append( float(lutRow[0]) )
    lutDict['anat'].append(lutRow[1])
    lutDict['R'].append(float(lutRow[2]))
    lutDict['G'].append(float(lutRow[3]))
    lutDict['B'].append(float(lutRow[4]))
    lutDict['A'].append(float(lutRow[5]))


f.close()

lut = pd.DataFrame(lutDict,index = lutDict['code'])
#endregion

#region Import the electrode info
elecList = []

# Dictionary for each electrode
elecDict = {
    'contact': '',
    'anat': '',
    'coords': []
}

# Read in electrodeNames starting from correct line
hdrLine = 'Name, Depth/Strip/Grid, Hem\n'
f = open(elecnamesFile,'r')
isHdr = True
for thisLine in f:
    if isHdr:
        isHdrline = thisLine == hdrLine
        if isHdrline:
            isHdr = False

        continue

    else:
        thisElec = elecDict.copy()
        eInfo = thisLine.replace('\n', '').split(' ')
        thisElec['contact'] = eInfo[0]
        elecList.append(thisElec)

f.close()

# Read in the coordinates starting from the appropriate line
thisElec = -1
f = open(leptovoxFile,"r")
isHdr = True
for thisLine in f:
    if isHdr:
        isRASline = thisLine == 'R A S\n'
        if isRASline:
            isHdr = False

        continue

    else:
        thisElec += 1
        thisCoord = [float(ii) for ii in thisLine.replace('\n', '').split(' ')]
        #elecCoords.append(thisCoord)
        elecList[thisElec]['coords'] = thisCoord

f.close()

#endregion

# Go through each electrode and get the anatomical location
for ee in range(len(elecList)):
    c = elecList[ee]['coords']
    c1 = [round(c[0]), round(c[1]), round(zdim-c[2])]
    anatCode = a[c1[0]][c1[1]][c1[2]]
    anatLoc = lut.loc[anatCode,'anat']
    elecList[ee]['anat'] = anatLoc

df = pd.DataFrame(elecList)