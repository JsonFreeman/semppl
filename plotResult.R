#!/usr/bin/env Rscript
library(tidyr)
library(ggplot2)
library(jsonlite)
library(data.table)

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
queryPath = paste(basePath, 'query.json', sep = '')
resultPath = paste(basePath, 'results.json', sep = '')
plotFilename = paste(baseFilename, 'plot.pdf', sep = '')

# Read in JSON and make data frame
resultJSON = fromJSON(readLines(resultPath))
queryJSON = fromJSON(readLines(queryPath))
dataFrame = data.frame(
  utterance = resultJSON$support,
  probability = resultJSON$probs
)

ggplot(dataFrame, aes(y=probability, x=utterance)) +
  geom_bar(stat='identity', fill='blue') +
  coord_flip() +
  ggtitle(paste("question:", queryJSON[[1]], "\nworld:", "\nqud:")) +
  ggsave(plotFilename, 
         path=queryDir)
