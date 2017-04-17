#!/usr/bin/env Rscript
library(tidyr)
library(dplyr)
library(ggplot2)
library(jsonlite)
library(data.table)

# args = c('rsaAndNeg1', '0', 'not')
args = commandArgs(trailingOnly = TRUE)
if (length(args) != 3) {
  stop("Must supply 3 arguments")
}
experimentName = args[1]
runId = args[2]
networkName = args[3]

# Construct paths
runDir = paste('qaExperiments/', experimentName, '/run', runId, '/', sep = '')
baseFilename = paste('nn-', networkName, sep = '')
basePath = paste(runDir, baseFilename, sep = '')
dataPath = paste(basePath, '.csv', sep = '')
plotFilename = paste(baseFilename, '-plot.pdf', sep = '')

# Read in JSON and make data frame
networkQueries = read.csv(dataPath, header = FALSE) %>% setnames(c('input', 'output'))

ggplot(networkQueries, aes(x=input, y=output)) +
  geom_smooth() +
  ylim(0, 1) +
  ggtitle(networkName) +
  ggsave(plotFilename, 
         path=runDir)
