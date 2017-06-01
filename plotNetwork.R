#!/usr/bin/env Rscript
library(tidyr)
library(dplyr)
library(ggplot2)
library(jsonlite)
library(data.table)

# args = c('rsaAndNeg1', '1', 'and')
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
networkQueries = read.csv(dataPath, header = FALSE)
networkPlot = NULL
if (ncol(networkQueries) == 2) {
  networkQueries = setnames(networkQueries, c('input', 'output'))
  networkPlot = ggplot(networkQueries, aes(x=input, y=output)) + 
    geom_smooth() + ylim(0, 1)
} else if (ncol(networkQueries) == 3) {
  networkQueries = setnames(networkQueries, c('input1', 'input2', 'output'))
  networkPlot = ggplot(networkQueries, aes(x=input1, y=input2, fill=output)) + 
    geom_tile()
}

networkPlot +
  ggtitle(networkName) +
  theme(plot.title = element_text(hjust = 0.5), text = element_text(size = 20)) +
  ggsave(plotFilename,
         path=runDir)

