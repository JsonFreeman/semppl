T1=rsaSpeaker1
T2=rsaSpeaker2
T3=rsaSpeaker3
T4=rsaSpeaker4
T5=rsaSpeaker5
CAT=rsaSpeaker
DIM=samples

echo $DIM, error > qaExperiments/$CAT-$DIM-and.csv
echo $DIM, error > qaExperiments/$CAT-$DIM-or.csv
echo $DIM, error > qaExperiments/$CAT-$DIM-not.csv

for f in qaExperiments/$T1/run*/*-and-correctness-summary.csv; do
    printf 16, >> qaExperiments/$CAT-$DIM-and.csv
    cat $f >> qaExperiments/$CAT-$DIM-and.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-and.csv
done
for f in qaExperiments/$T1/run*/*-or-correctness-summary.csv; do
    printf 16, >> qaExperiments/$CAT-$DIM-or.csv
    cat $f >> qaExperiments/$CAT-$DIM-or.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-or.csv
done
for f in qaExperiments/$T1/run*/*-not-correctness-summary.csv; do
    printf 16, >> qaExperiments/$CAT-$DIM-not.csv
    cat $f >> qaExperiments/$CAT-$DIM-not.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-not.csv
done

for f in qaExperiments/$T2/run*/*-and-correctness-summary.csv; do
    printf 8, >> qaExperiments/$CAT-$DIM-and.csv
    cat $f >> qaExperiments/$CAT-$DIM-and.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-and.csv
done
for f in qaExperiments/$T2/run*/*-or-correctness-summary.csv; do
    printf 8, >> qaExperiments/$CAT-$DIM-or.csv
    cat $f >> qaExperiments/$CAT-$DIM-or.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-or.csv
done
for f in qaExperiments/$T2/run*/*-not-correctness-summary.csv; do
    printf 8, >> qaExperiments/$CAT-$DIM-not.csv
    cat $f >> qaExperiments/$CAT-$DIM-not.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-not.csv
done

for f in qaExperiments/$T3/run*/*-and-correctness-summary.csv; do
    printf 4, >> qaExperiments/$CAT-$DIM-and.csv
    cat $f >> qaExperiments/$CAT-$DIM-and.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-and.csv
done
for f in qaExperiments/$T3/run*/*-or-correctness-summary.csv; do
    printf 4, >> qaExperiments/$CAT-$DIM-or.csv
    cat $f >> qaExperiments/$CAT-$DIM-or.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-or.csv
done
for f in qaExperiments/$T3/run*/*-not-correctness-summary.csv; do
    printf 4, >> qaExperiments/$CAT-$DIM-not.csv
    cat $f >> qaExperiments/$CAT-$DIM-not.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-not.csv
done

for f in qaExperiments/$T4/run*/*-and-correctness-summary.csv; do
    printf 2, >> qaExperiments/$CAT-$DIM-and.csv
    cat $f >> qaExperiments/$CAT-$DIM-and.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-and.csv
done
for f in qaExperiments/$T4/run*/*-or-correctness-summary.csv; do
    printf 2, >> qaExperiments/$CAT-$DIM-or.csv
    cat $f >> qaExperiments/$CAT-$DIM-or.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-or.csv
done
for f in qaExperiments/$T4/run*/*-not-correctness-summary.csv; do
    printf 2, >> qaExperiments/$CAT-$DIM-not.csv
    cat $f >> qaExperiments/$CAT-$DIM-not.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-not.csv
done

for f in qaExperiments/$T5/run*/*-and-correctness-summary.csv; do
    printf 0, >> qaExperiments/$CAT-$DIM-and.csv
    cat $f >> qaExperiments/$CAT-$DIM-and.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-and.csv
done
for f in qaExperiments/$T5/run*/*-or-correctness-summary.csv; do
    printf 0, >> qaExperiments/$CAT-$DIM-or.csv
    cat $f >> qaExperiments/$CAT-$DIM-or.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-or.csv
done
for f in qaExperiments/$T5/run*/*-not-correctness-summary.csv; do
    printf 0, >> qaExperiments/$CAT-$DIM-not.csv
    cat $f >> qaExperiments/$CAT-$DIM-not.csv
    printf "\n" >> qaExperiments/$CAT-$DIM-not.csv
done