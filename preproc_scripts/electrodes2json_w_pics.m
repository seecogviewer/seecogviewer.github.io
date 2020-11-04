var_names = {'subid' 'elecid' 'ElecType' 'Hem' 'lepto' 'depthpial' 'dist' 'soz' 'spikey' 'anat' 'gridid'};
subid = 'CC001';
%allElecs = new_output.table;
%row_indices = match_str(allElecs.SubID, subid);
%sub_elecs = allElecs(row_indices,:);
output = ielvisImport('CC001',0); sub_elecs = output.table;

[gridNames gridNums] = regexp(sub_elecs.Contact,'[A-Za-z]*[^\d*]','match','split');
ini_gridNames=cell(length(gridNames),1);
for i=1:length(gridNames)
    ini_gridNames(i) = gridNames{i};
end

ini_gridNums=cell(length(gridNums),1);
for i=1:length(gridNums)
    ini_gridNums(i) = gridNums{i}(2);
end

sub_json_table = sub_elecs(:,[1,2,3,4,7,10, 12, 31, 32, 19]);
sub_json_table = [sub_json_table cell2table(ini_gridNames)];
sub_json_table.Properties.VariableNames = var_names;

tmp_json = jsonencode(sub_json_table);
%json_name = 'NS144_02_electrodes.json';
%fid = fopen(json_name,'w');
%fprintf(fid,tmp_json);
%fclose(fid);


%% Get the pictures
global globalFsDir
globalFsDir = '/Volumes/NM01/HBML/derivatives/Freesurfer_Subjects';
fsDir = getFsurfSubDir();

encoder = org.apache.commons.codec.binary.Base64;
subPicDir = fullfile(fsDir, subid, 'elec_recon', 'PICS');

slicePicNames = strcat(subid,'_',sub_json_table.Hem, sub_json_table.ElecType,...
    '_',ini_gridNames,'_',ini_gridNums,'Slices.jpg');

% Loop through and get the image data
%pic_struct = struct;
pic_cell = cell(length(slicePicNames),1);
for eii = 1:length(slicePicNames)
    
    pic_file_path = fullfile(subPicDir, slicePicNames{eii});
    if ~isfile(pic_file_path)
        pic_data = 'NaN';
    else
        fid = fopen(pic_file_path,'rb');
        bytes = fread(fid);
        fclose(fid);
        base64string = char(encoder.encode(bytes))';
        pic_data = sprintf('data:image/jpg;base64,%s', base64string);
    end
    
    %pic_struct = setfield(pic_struct, sub_json_table.elecid{eii}, pic_data);
    pic_cell{eii} = pic_data;
end

% Combine the picture data with the table
%t = struct2table(pic_struct);

sub_json_table.PICS = pic_cell;
%% Other

outDir = fullfile(fsDir, subid, 'elec_recon', 'JellyFish2','data');
mkdir(outDir);

tmp_json = jsonencode(sub_json_table);
json_name = fullfile(outDir,'electrodes.json');
fid = fopen(json_name,'w');
fprintf(fid,tmp_json);
fclose(fid);