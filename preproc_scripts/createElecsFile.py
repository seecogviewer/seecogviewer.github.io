import os
import sys
import re
import base64
import json
from os.path import isfile, isdir, join, basename

# Determine if input is full file path to freesurfer subject or just the subject ID
subid = sys.argv[1]

if not isdir(subInput):
    SUBJECTS_DIR = os.environ['SUBJECTS_DIR']
    fsDir = SUBJECTS_DIR + os.sep + subid
else:
    fsDir = subInput
    subid = basename(fsDir)

if not isdir(fsDir):
    print('Can not find %s' % fsDir)
else:
    print('=========>Using %s' % fsDir)


fsDir = '/Volumes/NM01/HBML/derivatives/Freesurfer_Subjects/NS163'
subid = 'NS163'

elecReconDir = join(fsDir,'elec_recon')
jellyDir = join(elecReconDir,'JellyFish','data')
leptoFile = join(fsDir,'elec_recon',subid + '.LEPTO')
elecnamesFile = join(fsDir,'elec_recon',subid + '.electrodeNames')
elecList = []

# Dictionary for each electrode
elecDict = {
    'subid': subid,
    'elecid': '',
    'ElecType': '',
    'Hem': '',
    'lepto': '',
    'soz': False,
    'spikey': False,
    'anat': '',
    'PICS': '',
    'gridid': ''
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
        thisElec['elecid'] = eInfo[0]
        thisElec['ElecType'] = eInfo[1]
        thisElec['Hem'] = eInfo[2]

        elecList.append(thisElec)

f.close()

# Read in the coordinates starting from the appropriate line
thisElec = -1
f = open(leptoFile,"r")
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
        elecList[thisElec]['lepto'] = thisCoord

f.close()

# Import the static images
picName = '/Volumes/NM01/HBML/derivatives/Freesurfer_Subjects/NS163/elec_recon/PICS/NS163_LD_LDa_1Slices.jpg'
f = open(picName,'rb')
encoded_img = base64.b64encode(f.read())
f.close()
pic_data ='data:image/jpg;base64,%s' % encoded_img.decode('utf-8')

picDir = join(elecReconDir,'PICS')
expr = '(?P<arrayID>[A-Za-z]*)(?P<arrayNum>\d+)'
# Loop through elecList
for ee in range(len(elecList)):
    thisElec_re = re.match(expr,elecList[ee]['elecid'])
    thisEarray = thisElec_re.group('arrayID')
    thisEnum = thisElec_re.group('arrayNum')
    thisHem = elecList[ee]['Hem']
    thisType = elecList[ee]['ElecType']
    picName = "%s_%s%s_%s_%sSlices.jpg" % (subid,thisHem,thisType,thisEarray,thisEnum)
    picURL = picDir + os.sep + picName
    elecList[ee]['gridid'] = thisEarray

    # Read in image and convert to base64
    if isfile(picURL):
        f = open(picURL, 'rb')
        encoded_img = base64.b64encode(f.read())
        f.close()
        pic_data = 'data:image/jpg;base64,%s' % encoded_img.decode('utf-8')
        elecList[ee]['PICS'] = pic_data


outData = json.dumps(elecList)
outFile = jellyDir + os.sep + 'electrodes_new.json'
f = open(outFile,'w')
f.write(outData)
f.close()

# Add the anatomical location to electrode info