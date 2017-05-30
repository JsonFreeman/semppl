#!/usr/bin/env Rscript
library(tidyr)
library(dplyr)
library(ggplot2)
library(jsonlite)
library(data.table)

# args = c('qaExperiments/explicitAnswerer', 'qaExperiments/rsaSpeaker', 'samples', 'and')
args = commandArgs(trailingOnly = TRUE)
if (length(args) != 4) {
  stop("Must supply 4 arguments")
}
data1PathPrefix = args[1]
data2PathPrefix = args[2]
kind = factor(args[3])
word = factor(args[4])

data1Path = paste(data1PathPrefix, '-', kind, '-', word, '.csv', sep = '')
data2Path = paste(data2PathPrefix, '-', kind, '-', word, '.csv', sep = '')

plotFilename = sub('.csv', '.pdf', data1Path)

data = bind_rows(read.csv(data1Path) %>% mutate(source=factor('with questioner')),
                  read.csv(data2Path) %>% mutate(source=factor('without questioner'))) %>%
  group_by(steps, source) %>% summarise(meanError=mean(error), sdError=sd(error))

ggplot(data, aes(x=factor(steps), y=meanError, fill=source)) +
  geom_bar(stat='identity', position = 'dodge') +
  geom_errorbar(aes(ymin=meanError-sdError, ymax=meanError+sdError),
                width=.5, position = position_dodge(.9)) +
  xlab(kind) +
  ylab('error') +
  ggtitle(paste("Network Error:", word)) +
  ggsave(plotFilename)
