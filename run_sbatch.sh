#!/bin/bash
# Check number of arguments
if [ "$#" -ne 2 ]; then
    echo "Need 2 arguments"
    exit 1
fi

FOLDER=qaExperiments/$1/run$2
FILE=$FOLDER/job.sbatch

mkdir $FOLDER
sed s/experimentName/$1/g jobTemplate.sbatch | sed s/runId/$2/g > $FILE

sbatch $FILE