T1=explicitAnswerer5
T2=explicitAnswerer9
T3=explicitAnswerer10
T4=explicitAnswerer11
CAT=explicitAnswerer
DIM=steps

echo $DIM, error > qaExperiments/$CAT-$DIM-and.csv
echo $DIM, error > qaExperiments/$CAT-$DIM-or.csv
echo $DIM, error > qaExperiments/$CAT-$DIM-not.csv

for f in qaExperiments/$T1/run*/*-and-correctness-summary.csv; do
    printf 1,000, >> qaExperiments/$CAT-$DIM-and.csv
    cat $f >> qaExperiments/$CAT-$DIM-and.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-and.csv
done
for f in qaExperiments/$T1/run*/*-or-correctness-summary.csv; do
    printf 1,000, >> qaExperiments/$CAT-$DIM-or.csv
    cat $f >> qaExperiments/$CAT-$DIM-or.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-or.csv
done
for f in qaExperiments/$T1/run*/*-not-correctness-summary.csv; do
    printf 1,000, >> qaExperiments/$CAT-$DIM-not.csv
    cat $f >> qaExperiments/$CAT-$DIM-not.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-not.csv
done

for f in qaExperiments/$T2/run*/*-and-correctness-summary.csv; do
    printf 500, >> qaExperiments/$CAT-$DIM-and.csv
    cat $f >> qaExperiments/$CAT-$DIM-and.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-and.csv
done
for f in qaExperiments/$T2/run*/*-or-correctness-summary.csv; do
    printf 500, >> qaExperiments/$CAT-$DIM-or.csv
    cat $f >> qaExperiments/$CAT-$DIM-or.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-or.csv
done
for f in qaExperiments/$T2/run*/*-not-correctness-summary.csv; do
    printf 500, >> qaExperiments/$CAT-$DIM-not.csv
    cat $f >> qaExperiments/$CAT-$DIM-not.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-not.csv
done

for f in qaExperiments/$T3/run*/*-and-correctness-summary.csv; do
    printf 250, >> qaExperiments/$CAT-$DIM-and.csv
    cat $f >> qaExperiments/$CAT-$DIM-and.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-and.csv
done
for f in qaExperiments/$T3/run*/*-or-correctness-summary.csv; do
    printf 250, >> qaExperiments/$CAT-$DIM-or.csv
    cat $f >> qaExperiments/$CAT-$DIM-or.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-or.csv
done
for f in qaExperiments/$T3/run*/*-not-correctness-summary.csv; do
    printf 250, >> qaExperiments/$CAT-$DIM-not.csv
    cat $f >> qaExperiments/$CAT-$DIM-not.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-not.csv
done

for f in qaExperiments/$T4/run*/*-and-correctness-summary.csv; do
    printf 125, >> qaExperiments/$CAT-$DIM-and.csv
    cat $f >> qaExperiments/$CAT-$DIM-and.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-and.csv
done
for f in qaExperiments/$T4/run*/*-or-correctness-summary.csv; do
    printf 125, >> qaExperiments/$CAT-$DIM-or.csv
    cat $f >> qaExperiments/$CAT-$DIM-or.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-or.csv
done
for f in qaExperiments/$T4/run*/*-not-correctness-summary.csv; do
    printf 125, >> qaExperiments/$CAT-$DIM-not.csv
    cat $f >> qaExperiments/$CAT-$DIM-not.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-not.csv
done