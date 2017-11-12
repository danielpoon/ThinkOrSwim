# Extremities

declare lower;

input length = 1;
input price = close;

plot PercentChgHi = average(100 * (high / price - 1),length);
plot PercentChgLo = average(100 * (low / price - 1),length);
