#!/bin/bash
webppl --require webppl-json --require webppl-fs --require webppl-csv --require webppl-timeit --require . qaExperiments/$1/$1.wppl $2
RScript plotResultDist.R $1 $2
RScript plotNetwork.R $1 $2 and
RScript plotNetwork.R $1 $2 or
RScript plotNetwork.R $1 $2 not