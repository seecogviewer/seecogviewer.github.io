function elecs2seecog(cfg, outfile)
% Script to create an electrodes.json file that can be imported into
% seecog
%
% Arguments
%   cfg - A struct with options for input
%       
%       subid    -  The subject id for each contact as a cell array. If all electrodes are
%                        from the same subject then it can be entered as a char array
%
%       coords  -   Nx3 matrix of coordinates for each electrode
%
%       elecid   -   Nx1 cell array with the name of each electrode
%
%       anat     -   Nx1 cell array with anatomical location (optional)
%
%       soz      -    Nx1 categorical, numeric or logical array if electrodes
%                         is soz channel. If categorical array then 'undefined'
%                         can be passed in (optional)
%
%       spikey  -    Nx1 categorical, numeric or logical array if electrodes
%                         is spikey channel. If categorical array then 'undefined'
%                         can be passed in (optional)
%
%       PICS     -    Nx1 cell array containing the file path to images
%                         wished to be displayed within seecog. (optional)
%
%   outputfile - Where to store and what to name the output file
%
% Examples
%
% # Using the electrodes table stored in HBML_DATA.mat
% load('HBML_DATA.mat')
% subid = 'NS085';
% mysub = HBML_DATA( strcmp(HBML_DATA.SubID, subid), :);
% imgdir = 'VisLocOutput/AvgRef';
% cfg = [];
% cfg.subid = subid;
% cfg.coords = mysub.LEPTO;
% cfg.elecid = mysub.Contact;
% Go through images
% mypics = cell(length(cfg.elecid),1);
% for ii = 1:length(mypics)
%     mypics{ii} = fullfile(imgdir, [cfg.elecid{ii} '_power_bystimtype.jpeg']);
% end
% cfg.PICS = mypics;
% outfile = [subid '_electrodes.json'];
% elecs2seecog(cfg, outfile)

coords = cfg.coords;
elecid = cfg.elecid;
nelecs = size(coords,1);

% Subid field
if ~isfield(cfg,'subid')
    subid = randsample(['a':'z'],7);
    subid = repmat({subid},nelecs,1);
elseif length(cfg.subid) == 1 | ischar(cfg.subid)
    if ischar(cfg.subid); subid = {cfg.subid}; else; subid = cfg.subid; end
    subid = repmat(subid,nelecs,1);
else
    subid = cfg.subid;
end

% soz
if ~isfield(cfg,'soz')
    soz = zeros(nelecs,1);
else
    soz = cfg.soz;
    if iscategorical(soz)
        undefinedcells = isundefined(soz);
        soz(undefinedcells) = 0;
    end
end

% spikey
if ~isfield(cfg,'spikey')
    spikey = zeros(nelecs,1);
else
    spikey = cfg.spikey;
    if iscategorical(spikey)
        undefinedcells = isundefined(spikey);
        spikey(undefinedcells) = 0;
    end
end

% Anat
if ~isfield(cfg,'anat'); anat = repmat('unknown',nelecs,1); else; anat = cfg.anat; end

% Pictures
if isfield(cfg,'PICS')
    encoder = org.apache.commons.codec.binary.Base64;
    PICS = cfg.PICS;
    for ii = 1:nelecs
        picpath = PICS{ii};
        if ~isempty(PICS{ii}) & isfile(picpath)
            [~,~,ext] = fileparts(picpath);
            if strcmp(ext,'jpeg'); ext = 'jpg'; end
            fid = fopen(picpath,'rb');
            bytes = fread(fid);
            fclose(fid);
            base64string = char(encoder.encode(bytes))';
            pic_data = sprintf('data:image/%s;base64,%s', ext,base64string);
        else
                pic_data = '';
        end
        PICS{ii} = pic_data;
    end
end

% Create json table and encode as a json string
json_table = table(subid,elecid,coords,soz,spikey,anat,PICS);
json_table_string = jsonencode(json_table);

% Write out
if ~endsWith(outfile,'.json')
    outfile = [outfile '.json'];
end
fid = fopen(outfile,'w');
fprintf(fid,json_table_string);
fclose(fid);

end