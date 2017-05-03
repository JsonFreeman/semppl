#!/bin/bash
FOLDER=qaExperiments/$1/run$2
FILE=$FOLDER/job.sbatch

mkdir $FOLDER
sed s/experimentName/$1/g jobTemplate.sbatch | sed s/runId/$2/g > $FILE

sbatch $FILE