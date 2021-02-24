fssub = 'NS157';
global globalFsDir
globalFsDir = '/Volumes/NM01/HBML/derivatives/Freesurfer_Subjects';

%% Import the most of the data using ielvisImport
output = ielvisImport(fssub);
t = output.table;

%% Read in the mgrid for colors

fsDir = getFsurfSubDir();
mgridFile = fullfile(fsDir, fssub, 'elec_recon', [fssub '.mgrid']);
[~, elecLabels, elecRgb, ~, ~]=mgrid2matlab(mgridFile);
[~,b] = strtok(elecLabels,'_');
mgridLabels = strrep(b,'_','');

% Convert colors [0 1] to rgba [0 255] values for javascript
color = round(elecRgb*255);

% Combine this with the larger table
mgridTable = table([mgridLabels]',color);
mgridTable.Properties.VariableNames = {'Contact' 'color'};
sub_table = join(t, mgridTable, 'Keys', 'Contact');

% Which variables are wanted from the table
primaryVars = {'SubID' 'Contact' 'ElecType' 'Hem' 'AparcAseg_Atlas' 'PTD' 'soz' 'spikey' 'out' 'color'};
coordinateVars = {'LEPTO' 'INF' 'DepthPial' 'DepthInf' 'FSAverage' 'FSAverageInf' 'FSAverageDPial' 'FSAverageDInf'};

% Extract desired variables from the table
jsonTable = sub_table(:,primaryVars);
coordsTable = sub_table(:,coordinateVars);
jsonTable.soz = double(jsonTable.soz);
jsonTable.spikey = double(jsonTable.spikey);
jsonTable.out = double(jsonTable.out);
jsonTable.Properties.VariableNames = {'SubID' 'Elec' 'ElecType' 'Hem' 'anat' 'PTD' 'soz' 'spikey' 'out' 'color'};

% Convert tables to structs before encoding to json
jsonStruct = table2struct(jsonTable,'ToScalar',true);
coordsStruct = table2struct(coordsTable,'ToScalar',true);
jsonStruct.coords = coordsStruct;

% Encode into json
jsonTxt = jsonencode(jsonStruct);

% Write out to a file
jsonFname = 'electrodes.json';
fid = fopen(jsonFname,'w');
fprintf(fid,jsonTxt);
fclose(fid);