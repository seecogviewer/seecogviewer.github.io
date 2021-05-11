function elecs2seecog(cfg, outfile)
% imgdir = '/Users/sportsnoah14/Documents/Northshore_Hosptial/HBML/PROJECTS/ns171_visloc/B17/AvgRef';
% ns171_all = ielvisImport('NS171');
% ns171 = ns171_all.table;
% 
% 
% cfg = [];
% cfg.subid = 'NS171';
% cfg.coords = ns171.LEPTO;
% cfg.elecid = ns171.Contact;
% Go through images
% mypics = cell(length(cfg.elecid),1);
% for ii = 1:length(mypics)
%     mypics{ii} = fullfile(imgdir, [cfg.elecid{ii} '_power_bystimtype.jpeg']);
% end
% cfg.PICS = mypics;

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

% Spikey and soz
if ~isfield(cfg,'soz'); soz = zeros(nelecs,1); end
if ~isfield(cfg,'spikey'); spikey = zeros(nelecs,1); end

% Anat
if ~isfield(cfg,'anat'); anat = repmat('unknown',nelecs,1); end

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
fid = fopen(outfile,'w');
fprintf(fid,json_table_string);
fclose(fid);

end