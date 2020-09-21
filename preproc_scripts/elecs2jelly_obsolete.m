%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Give option to write out directly to json or return the struct
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
fssub = 'NS157';
global globalFsDir
globalFsDir = '/Volumes/NM01/HBML/derivatives/Freesurfer_Subjects';

% Load iElVis' files
fsDir = getFsurfSubDir();
elecNamesFile = fullfile(fsDir, fssub, 'elec_recon', [fssub '.ELECTRODENAMES']);
leptoFile = fullfile(fsDir, fssub, 'elec_recon', [fssub '.LEPTO']);
infFile = fullfile(fsDir, fssub, 'elec_recon', [fssub '.INF']);
fsavgFile = fullfile(fsDir, fssub, 'elec_recon', [fssub '.FSAVERAGE']);
mgridFile = fullfile(fsDir, fssub, 'elec_recon', [fssub '.mgrid']);
coords = struct('LEPTO',leptoFile,'INFLATED',infFile,'FSAVERAGE',fsavgFile);

% Create a table to store the info that will be added
% Purpose of the table rather than struct is so that electrodes
% can have information added by row index
jsonData = table;
%% Read in the standard iElVis files
% Read in ElectrodeNames file
enamesInfo = readiElVisFile(elecNamesFile);

% Read in coordinates files
coordTypes = fieldnames(coords);
coords_struct = [];
for cc = 1:length(coordTypes)
    thisCoordType = coordTypes{cc};
    elecCoords = readiElVisFile( getfield(coords,thisCoordType) );
    coords_struct = setfield(coords_struct, thisCoordType, elecCoords);
end

% Read in the mgrid
[~, elecLabels, elecRgb, ~, ~]=mgrid2matlab(mgridFile);
%mni_filename = fullfile(fsDir, fssub, 'elec_recon', [fssub '.mgrid']);
%[~, elecLabels, elecRgb, ~, ~]=mni2Matlab(fssub, 'FirstChar');
[~,b] = strtok(elecLabels,'_');
mgridLabels = strrep(b,'_','');

% Convert colors [0 1] to rgba [0 255] values for javascript
js_colors = round(elecRgb*255);


%% Read in the anatomical areas and PTD

ptd_idx_file = fullfile(fsDir, fssub, 'elec_recon', 'GreyWhite_classifications.mat');
if isfile(ptd_idx_file)
    load(ptd_idx_file);
else
    PTD_idx = getPtdIndex_ielvisImport(fssub);
end

ptd = PTD_idx.PTD;
anat = PTD_idx.location;

%% Import the correspondence sheet if it's there

xlsheet = dir(fullfile(fsDir, fssub, 'elec_recon', '*correspondence*.xlsx'));
if isempty(xlsheet); xlsheet = dir(fullfile(fsDir, fssub, 'elec_recon', '*correspondence*.xls')); end
if isempty(xlsheet); xlsheet = dir(fullfile(fsDir, fssub, 'elec_recon', '*Natus*.xls')); end

% Make sure no hidden files starting with '_.' are included
if ~isempty(xlsheet)
    for ii = 1:length(xlsheet)
        if startsWith(xlsheet(ii).name,'._')
            xlsheet(ii) = [];
        end
    end
end
%% Function for reading iElVis files
function content = readiElVisFile(fname)

ishdr = 1;
fid = fopen(fname,'r');
content = [];

% Read until the hdr is seen
while ishdr
    txt = fgetl(fid);
    if contains(txt,',') | contains(txt,'/')  | contains(txt,'-') 
        continue
    else
        ishdr = 0;
        thisElecInfo = strsplit(txt, ' ');
        content = [content;thisElecInfo];
    end
end

% Read the rest of the file
while ~feof(fid)
    txtLine = fgetl(fid);
    thisElecInfo = strsplit(txtLine, ' ');
    content = [content;thisElecInfo];
end
fclose(fid);

end

%% Subfunction: getPtdIndex_ielvisImport
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Subfunction: getPtdIndex_ielvisImport
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function PTD_idx = getPtdIndex_ielvisImport(fs_subj)
% An adapted version of the 'getPtdIndex' function from the
% iElVis toolbox
% The primary change is that when reading in .electrodeNames and
% .LEPTOVOX files the row that contains the column names is identified
% rather than being assummed for backwards compatibility

% load parcellation file
fs_dir=getFsurfSubDir();
recon_folder=fullfile(fs_dir,fs_subj,'elec_recon');
parc_file=fullfile(fs_dir,fs_subj,'mri','aparc+aseg.mgz');
mri=MRIread(parc_file);

% load electrodes name
files=dir(fullfile(recon_folder,[fs_subj '.electrodeNames']));
n=size(files,1);
if n==1
    label_file=fullfile(recon_folder,files.name);
elseif n==0
    disp('No electrodeNames file found. Please do it manualy.');
    [temp_file,elec_dir]=uigetfile(fullfile(recon_folder,'*.electrodeNames'),'select electrode names file');
    label_file=fullfile(elec_dir,temp_file);
    clear elec_dir temp_file files n
elseif n>1
    disp('More than one electrodeNames file found. Please do it manualy.');
    [temp_file,elec_dir]=uigetfile(fullfile(recon_folder,'*.electrodeNames'),'select electrode names file');
    label_file=fullfile(elec_dir,temp_file);
    clear elec_dir temp_file files n
end
fid=fopen(label_file);
tmp=textscan(fid,'%s %s %s');
fclose(fid);

% Get number of header lines in the text files
nHdrLines = find( strcmp({'Hem'}, tmp{3}), 1 );
datStartLine = nHdrLines + 1;

for i=datStartLine:length(tmp{1})
    idx = i - nHdrLines;
    label{idx,1}=strcat(tmp{1}{i},'_',tmp{2}{i},'_',tmp{3}{i});
end
clear tmp;

% load electrodes coordinate
files=dir(fullfile(recon_folder,[fs_subj '.LEPTOVOX']));
n=size(files,1);
if n==1
    elec_file=fullfile(recon_folder,files.name);
elseif n==0
    disp('No *.LEPTOVOX file found. Please do it manualy');
    [temp_file,elec_dir]=uigetfile(fullfile(recon_folder,'*.LEPTOVOX'),'select electrode coordinate file');
    elec_file=fullfile(elec_dir,temp_file);
    clear elec_dir temp_file files n
elseif n>1
    disp('More than one *.LEPTOVOX file found. Please choose it manualy');
    [temp_file,elec_dir]=uigetfile(fullfile(recon_folder,'*.LEPTOVOX'),'select electrode coordinate file');
    elec_file=fullfile(elec_dir,temp_file);
    clear elec_dir temp_file files n
end
fid=fopen(elec_file);
tmp=textscan(fid,'%s %s %s');
fclose(fid);

% Get number of header lines in the text files
nHdrLines = find( strcmp({'X'}, tmp{1}), 1 );
if isempty(nHdrLines)
    nHdrLines = find( strcmp({'R'}, tmp{1}), 1 );
end
datStartLine = nHdrLines + 1;

elec = zeros(length(tmp{1})-nHdrLines,3);
for i=datStartLine:length(tmp{1})
    idx = i - nHdrLines;
    elec(idx,1)=str2num(tmp{1}{i});
    elec(idx,2)=str2num(tmp{2}{i});
    elec(idx,3)=str2num(tmp{3}{i});
end
clear tmp;
elec=elec+1; % Voxel indexing starts at 0 but MATLAB indexing starts with 1

%%%% load look-up table for the FreeSurfer MRI atlases %%%%
FS_color_file = which('FreeSurferColorLUTnoFormat.txt');
if isempty(FS_color_file)
    disp('The freesurfer color code file, FreeSurferColorLUTnoFormat.txt, was not found. Please select it manualy.');
    [temp_file,elec_dir]=uigetfile(fullfile(recon_folder,'*.txt'),'Select freesurfer color code file');
    FS_color_file=fullfile(elec_dir,temp_file);
    clear elec_dir temp_file
else
    fprintf('Loading file %s\n',FS_color_file);
end

fid=fopen(FS_color_file);
C=textscan(fid,'%d %s %d %d %d %d');
fclose(fid);

region_lookup=C{:,2};
region_codes=C{:,1};
clear fid C p

%%%% find the proportion of neocortical grey and white matter surrounding the electrodes %%%%
sVol=size(mri.vol);
offset = 2;
for e=1:size(elec,1)
    disp(['Finding amount of surrounding grey and white matter for channel ' label{e}]);
    x=round(elec(e,2)); % switches x and y axes to match FreeSurfer
    y=round(elec(e,1)); % switches x and y axes to match FreeSurfer
    z=round(sVol(3)-elec(e,3)); %need to flip direction of last coordinate
    
    % original labelling from parcellation
    ROI(e,1) =region_lookup(region_codes==mri.vol(x,y,z));
    
    % check that the contact is in gray or white matter
    gray_white=[strfind(lower(ROI{e,1}),'ctx') strfind(lower(ROI{e,1}),'cortex') ...
        strfind(lower(ROI{e,1}),'wm') strfind(lower(ROI{e,1}),'white')];
    if ~isempty(gray_white),
        % get the euclidean distances between the electrode and every voxel
        % in the MRI (this could be speed up a lot)
        for i=1:mri.volsize(1)
            for j=1:mri.volsize(2)
                for k=1:mri.volsize(3)
                    distances(i,j,k)=sqrt((i-x)^2+(j-y)^2+(k-z)^2); % could be replaced by ~ norm([i j k] - [x y z])
                end
            end
        end
        
        % do not include the offset
        tmp=mri.vol(distances<offset);
        % find the regions
        tmp_region ={};
        for i = 1:length(tmp)
            tmp_region(i,1) =region_lookup(region_codes==tmp(i));
        end
        % find gray matter voxel in the vicinity
        gm_nb = length(cell2mat(strfind(lower(tmp_region),'ctx')));
        gm_nb = gm_nb + length(cell2mat(strfind(lower(tmp_region),'cortex')));
        gm_w = gm_nb;
        % find white matter voxel in the vicinity
        wm_nb = length(cell2mat(strfind(lower(tmp_region),'wm')));
        wm_nb = wm_nb + length(cell2mat(strfind(lower(tmp_region),'white')));
        wm_w = wm_nb;
        
        ROI{e,2} = gm_w;
        ROI{e,3} = wm_w;
    else
        warning(['channel ' label{e} ' does not have its centroid in Neocortical Gray or White matter >> PTD=NaN']);
        ROI{e,2} = NaN;
        ROI{e,3} = NaN;
    end
end

%%%%% write output file%%%%
for i=1:length(ROI)
    PTD_idx.elec(i,1)     = label(i);
    PTD_idx.location(i,1) = ROI(i,1);
    PTD_idx.nb_Gpix(i,1)  = cell2mat(ROI(i,2));
    PTD_idx.nb_Wpix(i,1)  = cell2mat(ROI(i,3));
    PTD_idx.PTD (i,1)     = (cell2mat(ROI(i,2)) - cell2mat(ROI(i,3))) / (cell2mat(ROI(i,2)) + cell2mat(ROI(i,3)));
    if (cell2mat(ROI(i,2)) + cell2mat(ROI(i,3))) ~= power(offset+1,3)
        warning(['channel ' label{e} ' has in its surrounding voxels that are neither labelled Gray or White matter; ' char(10)...
            'those voxels were not taking into account in PTD computation (see field nb_Gpix and nb_Wpix in the output)']);
    end
    % % otherwise a less strict version of the PTD taking into account the surrounding voxels that do not belong to Gray or White matter
    %     PTD_idx.PTD (i,1)     = (cell2mat(ROI(i,2)) - cell2mat(ROI(i,3))) / power(offset+1,3);
end
PTD_idx.offset = offset;

% Save PTD info as mat file
outfile_mat=fullfile(recon_folder,'GreyWhite_classifications.mat');
fprintf('Writing PTD values to %s\n',outfile_mat);
save(outfile_mat,'PTD_idx');

% Raw output in txt
outfile=fullfile(recon_folder,'GreyWhite_classifications.txt');
fprintf('Writing PTD values to %s\n',outfile);
fid=fopen(outfile,'w');
fprintf(fid,'%s\t %s\t %s\t %s\r\n','Electrode','location','% Grey with offset=2','% White with offset=2');
for i=1:size(ROI,1)
    fprintf(fid,'%s\t %s\t %d\t %d\t \r\n',label{i},ROI{i,:});
end
fclose(fid);
end
