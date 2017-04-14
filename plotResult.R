#!/usr/bin/env Rscript
library(tidyr)
library(dplyr)
library(ggplot2)
library(jsonlite)
library(data.table)

# args = c('testExperiment', '0', '0')
args = commandArgs(trailingOnly = TRUE)
if (length(args) != 3) {
  stop("Must supply 3 arguments")
}
experimentName = args[1]
runId = args[2]
queryId = args[3]

# Construct paths
queryDir = paste('qaExperiments/', experimentName, '/run', runId,
                 '/query', queryId, '/', sep = '')
baseFilename = paste(experimentName, '-', runId, '-', queryId, '-', sep = '')
basePath = paste(queryDir, baseFilename, sep = '')
queryPath = paste(basePath, 'args.json', sep = '')
resultPath = paste(basePath, 'results.json', sep = '')
plotFilename = paste(baseFilename, 'plot.pdf', sep = '')

# Read in JSON and make data frame
resultJSON = fromJSON(readLines(resultPath))
queryJSON = fromJSON(readLines(queryPath))
dataFrame = bind_rows(
  "Learned result" = data.frame(
    utterance = resultJSON$learnedResult$support,
    probability = resultJSON$learnedResult$probs
  ),
  "True result" = data.frame(
    utterance = resultJSON$trueResult$support,
    probability = resultJSON$trueResult$probs
  ),
  .id = "id"
)

KL = resultJSON$KLDivergence

ggplot(dataFrame, aes(y=probability, x=utterance)) +
  geom_bar(stat='identity', fill='blue') +
  coord_flip() +
  ggtitle(paste(queryJSON, collapse = '\n')) +
  facet_wrap(~id) +
  ggsave(plotFilename, 
         path=queryDir)
