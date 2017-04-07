library(dplyr)
library(tidyr)
library(ggplot2)
library(jsonlite)
library(data.table)

# filename = 'testOptimize'
json = fromJSON(readLines('qaExperimentsOutput/testOptimize-results.json'))
index = 1
dataFrame = data.frame(
  utterance = json$result$support[index],
  probability = json$result$probs[index]
)
dataFrame = setNames(dataFrame, c('utterance', 'probability'))

ggplot(dataFrame, aes(y=probability, x=utterance)) +
  geom_bar(stat='identity') +
  coord_flip()
