#!/bin/bash

# Run with:
# qsub -N semppl -cwd -M jasonf2@stanford.edu -m besa -v EXP_NAME=,RUN_ID= sempplJob.sh

# Name the job in Grid Engine
#$ -N semppl

#tell grid engine to use current directory
#$ -cwd

#$ -M jasonf2@stanford.edu

# Tell Grid Engine to notify job owner if job 'b'egins, 'e'nds, 's'uspended is 'a'borted, or 'n'o mail
#$ -m besan

# Tel Grid Engine to join normal output and error output into one file
#$ -j y

# WEBPPL=/afs/.ir/users/j/a/jasonf2/bin/webppl

webppl --require webppl-json --require webppl-fs --require webppl-csv --require . qaExperiments/${EXP_NAME}/$EXP_NAME.wppl ${RUN_ID}