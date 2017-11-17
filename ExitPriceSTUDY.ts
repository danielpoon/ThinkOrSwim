input threshold = 4; #percent
input length = 1;
input offset = 0;
input SHOWONLYLASTPERIOD = Yes;

plot pricetarget;
if SHOWONLYLASTPERIOD AND !ISNAN(High(PERIOD = AggregationPeriod.Day)[-1]) {
    pricetarget = Double.NaN;
} else {
    pricetarget = if Average(100 * (high[offset] / close[offset] - 1), length) >= threshold then ((close[offset] * (Average((high[offset] / close[offset] - 1), length)) / 2) + close[offset]) else if Average(100 * (high[offset] / close[offset] - 1), length) < threshold then ((close[offset] * 0.02) + close[offset]) else Double.NaN;
}
pricetarget.SetDefaultColor(CreateColor(255, 255, 255));
pricetarget.SetPaintingStrategy(PaintingStrategy.DASHES);