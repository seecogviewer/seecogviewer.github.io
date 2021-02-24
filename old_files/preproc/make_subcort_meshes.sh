# Actually exist in aparc+aseg file
my_lab_list="10 11 12 13 17 18 49 50 51 52 53 54"
label_names="L_Thalamus L_Caudate L_Putamen L_Pallidum L_Hippocampus L_Amygdala R_Thalamus R_Caudate R_Putamen R_Pallidum R_Hippocampus R_Amygdala"
sub=NS159
tmp_dir=${SUBJECTS_DIR}/${sub}/elec_recon/tmp_subcorts
mkdir $tmp_dir

for label_num in ${my_lab_list}; do

label_str=$(printf %02d ${label_num})

${FREESURFER_HOME}/bin/mri_pretess \
  ${SUBJECTS_DIR}/${sub}/mri/aparc+aseg.mgz $label_num \
  ${SUBJECTS_DIR}/${sub}/mri/norm.mgz \
  ${tmp_dir}/subcort_label_${label_str}_pretess.mgz

${FREESURFER_HOME}/bin/mri_tessellate \
  ${tmp_dir}/subcort_label_${label_str}_pretess.mgz \
  ${label_num} ${tmp_dir}/subcort_label_${label_str}_tess.lab

${FREESURFER_HOME}/bin/mris_smooth -nw \
  ${tmp_dir}/subcort_label_${label_str}_tess.lab \
  ${tmp_dir}/subcort_label_${label_str}_tess.smooth

done
