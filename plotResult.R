#!/usr/bin/env Rscript
library(tidyr)
library(ggplot2)
library(jsonlite)
library(data.table)

resultJSON = fromJSON(readLines('qaExperiments/testExperiment/run0/query0/testExperiment-0-0-results.json'))
queryJSON = fromJSON(readLines('qaExperiments/testExperiment/run0/query0/testExperiment-0-0-query.json'))
dataFrame = data.frame(
  utterance = resultJSON$support,
  probability = resultJSON$probs
)

ggplot(dataFrame, aes(y=probability, x=utterance)) +
  geom_bar(stat='identity', fill='blue') +
  coord_flip() +
  ggtitle(paste("question:", queryJSON[[1]], "\nworld:", "\nqud:")) +
  ggsave('testExperiment-0-0-plot.pdf', 
         path='qaExperiments/testExperiment/run0/query0/')
