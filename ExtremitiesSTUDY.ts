declare lower;

input length = 1;
input aggregration = AggregationPeriod.DAY;

plot PercentChgHi = Average(100 * (high(PERIOD = aggregration) / close(PERIOD = aggregration) - 1), length);
plot PercentChgLo = Average(100 * (low(PERIOD = aggregration) / close(PERIOD = aggregration) - 1), length);
