class seecog:
    def __init__(self,subDir):
        import os
        self.subdir = subDir
        self.subid = os.path.basename(subDir)
        self.scriptPath = os.path.dirname(os.path.abspath(__file__))

    def create_seecog_dir(self):
        import os
        elecReconDir = os.path.join(self.subdir, 'elec_recon')
        self.scDir = os.path.join(elecReconDir, 'SEECOG')
        dataDir = self.scDir + os.sep + 'data'
        os.makedirs(dataDir)

    def import_ielvis(self):
        import os
        import re
        import base64
        from os.path import isfile, isdir, join, basename

        subid = self.subid
        fsDir = self.subdir
        elecReconDir = join(fsDir,'elec_recon')
        leptoFile = join(fsDir,'elec_recon',subid + '.LEPTO')
        elecNamesFile = join(fsDir,'elec_recon',subid + '.electrodeNames')
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
        f = open(elecNamesFile,'r')
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
                elecList[thisElec]['lepto'] = thisCoord

        f.close()

        # Import the static images
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


        self.elecData = elecList

    def write_elecData(self):
        import json, os
        outData = json.dumps(self.elecData)
        outFile = self.scDir + os.sep + 'data' + os.sep + 'electrodes.json'
        f = open(outFile,'w')
        f.write(outData)
        f.close()

    # Add the anatomical location to electrode info
    def findAnat(self):
        import nibabel as nib
        import os
        import pandas as pd

        # Files and directories
        subid = self.subid
        fsDir = self.subdir
        elecReconDir = os.path.join(fsDir, 'elec_recon')
        leptovoxFile = elecReconDir + os.sep + subid + '.LEPTOVOX'
        aparcAsegFile = os.path.join(fsDir, 'mri', 'aparc+aseg.mgz')
        fslutFile = self.scriptPath + os.sep + 'FreeSurferColorLUTnoFormat.txt'

        # Importing the data
        apasObj = nib.load(aparcAsegFile)
        apas = apasObj.get_fdata()
        zdim = apas.shape[2]

        # region Import Freesurfer LUT
        lutDict = {
            'code': [],
            'anat': [],
            'R': [],
            'G': [],
            'B': [],
            'A': []
        }

        with open(fslutFile,'r') as f:
            for l in f:
                l = l[:-1].split(' ')
                lutRow = [ii for ii in l if ii != '']
                lutDict['code'].append(float(lutRow[0]))
                lutDict['anat'].append(lutRow[1])
                lutDict['R'].append(float(lutRow[2]))
                lutDict['G'].append(float(lutRow[3]))
                lutDict['B'].append(float(lutRow[4]))
                lutDict['A'].append(float(lutRow[5]))

        lut = pd.DataFrame(lutDict, index=lutDict['code'])
        # endregion

        # region Import the electrode info
        elecList = self.elecData

        # Read in the coordinates starting from the appropriate line
        thisElec = -1
        with open(leptovoxFile, "r") as f:
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
                    elecList[thisElec]['leptovox'] = thisCoord

        # endregion

        # Go through each electrode and get the anatomical location
        for ee in range(len(elecList)):
            c = elecList[ee]['leptovox']
            c1 = [round(c[0]), round(c[1]), round(zdim - c[2])]
            anatCode = apas[c1[0], c1[1], c1[2]]
            anatLoc = lut.loc[anatCode, 'anat']
            elecList[ee]['anat'] = anatLoc
            #elecList[ee].pop(leptovox)

        self.elecData = elecList

    def create_subcorts(self):
        from nibabel.freesurfer.io import read_geometry, write_geometry
        import os, shutil
        # Important filepaths
        fsDir = self.subdir
        dataDir = self.scDir + os.sep + 'data'
        tmpDir = os.path.join(dataDir, 'tmp')
        os.makedirs(tmpDir)
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
            pretessF = tmpDir + os.sep + subc + '_pretess.mgz'
            tessF = tmpDir + os.sep + subc + '_tess.lab'
            smoothF = tmpDir + os.sep + subc + '_tess.smooth'
            subcortF = dataDir + os.sep + subc.lower().replace('_', 'h.')

            # Pretess
            pretess_cmd_tmp = ['mri_pretess', os.path.join(fsDir, 'mri', 'aseg.mgz'), subcort_dict[subc]['id'],
                               os.path.join(fsDir, 'mri', 'norm.mgz'), pretessF]
            pretess_cmd = ' '.join(pretess_cmd_tmp)
            os.system(pretess_cmd)

            # Tessellate
            tess_cmd_tmp = ['mri_tessellate', pretessF, subcort_dict[subc]['id'], tessF]
            tess_cmd = ' '.join(tess_cmd_tmp)
            os.system(tess_cmd)

            # Smooth
            smooth_cmd_tmp = ['mris_smooth', '-nw', tessF, smoothF]
            smooth_cmd = ' '.join(smooth_cmd_tmp)
            os.system(smooth_cmd)

            # Now reformat it so it's not in the weird QUAD format
            # By default the above freesurfer commands output the mesh in a funky, hard to read file format
            coords, faces = read_geometry(smoothF)
            write_geometry(subcortF, coords, faces)

        shutil.rmtree(tmpDir)

    def copy_seecog_files(self):
        import os, shutil
        seecogHome = os.path.dirname(self.scriptPath)
        seecogFiles = ['index.html','js','external']
        for ff in seecogFiles:
            if os.path.isdir(seecogHome + os.sep + ff):
                shutil.copytree(seecogHome + os.sep + ff,self.scDir + os.sep + ff)
            else:
                shutil.copyfile(seecogHome + os.sep + ff, self.scDir + os.sep + ff)

    def runAll(self):
        import shutil, os
        # Run the basic functions
        self.import_ielvis()
        self.findAnat()
        self.create_seecog_dir()
        self.write_elecData()
        self.create_subcorts()
        self.copy_seecog_files()

        # Add the pial and white files to the data folder
        files = ['lh.pial','rh.pial','lh.white','rh.white']
        for f in files:
            srcFile = os.path.join(self.subdir, 'surf', f)
            destFile = os.path.join(self.scDir, 'data', f)
            shutil.copyfile(srcFile,destFile)

        t1src = os.path.join(self.subdir, 'elec_recon','T1.nii.gz')
        t1dest = os.path.join(self.scDir, 'data', 'T1.nii.gz')
        shutil.copyfile(t1src,t1dest)




if __name__ == '__main__':
    import sys, os

    # Determine if input is full file path to freesurfer subject or just the subject ID
    subInput = sys.argv[1]

    if os.path.isdir(subInput):
        fsDir = subInput
    else:
        SUBJECTS_DIR = os.environ['SUBJECTS_DIR']
        fsDir = SUBJECTS_DIR + os.sep + subInput
        #subid = os.path.basename(fsDir)

    if os.path.isdir(fsDir):
        print('=========>Using %s' % fsDir)
        s = seecog(fsDir)
        s.runAll()
    else:
        print('Can not find %s' % fsDir)
