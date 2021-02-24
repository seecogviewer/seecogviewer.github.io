f = 'electrodes.json';
fid = fopen(f);
raw_json = fread(fid);
str = char(raw_json');
fclose(fid);
data = jsondecode(str);
t = struct2table(data);
% Columns:
% {'subid'}    {'elecid'}    {'ElecType'}    {'lepto'}
% {'depthpial'}    {'dist'}    {'soz'}    {'spikey'}    {'anat'}    {'gridid'}


allElecs = new_output.table;
row_indices = match_str(allElecs.SubID, 'NS144_02');
ns144_02_elecs = allElecs(row_indices,:);

gridNames = regexp(ns144_02_elecs.Contact,'[A-Za-z]*[^\d*]','match');
ini_gridNames=cell(length(gridNames),1);
for i=1:length(gridNames)
    ini_gridNames(i) = gridNames{i};
end

ns144_02_json_table = ns144_02_elecs(:,[1,2,3,7,10, 12, 31, 32, 19]);
ns144_02_json_table = [ns144_02_json_table cell2table(ini_gridNames)];
ns144_02_json_table.Properties.VariableNames = t.Properties.VariableNames;

tmp_json = jsonencode(ns144_02_json_table);
json_name = 'NS144_02_electrodes.json';
fid = fopen(json_name,'w');
fprintf(fid,tmp_json);
fclose(fid);


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Json file for the entire table

gridNames = regexp(allElecs.Contact,'[A-Za-z]*[^\d*]','match');
ini_gridNames=cell(length(gridNames),1);
for i=1:length(gridNames)
    ini_gridNames(i) = gridNames{i};
end

json_table = allElecs(:,[1,2,3,7,10, 12, 31, 32, 19]);
json_table = [json_table cell2table(ini_gridNames)];
json_table.Properties.VariableNames = t.Properties.VariableNames;

tmp_json = jsonencode(json_table);
json_name = 'electrodes.json';
fid = fopen(json_name,'w');
fprintf(fid,tmp_json);
fclose(fid);