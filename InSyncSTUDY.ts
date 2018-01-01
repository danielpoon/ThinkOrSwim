# Optimized for use on daily charts

declare upper;

input bblength = 20;
input bbob = 100;
input bbos = 0;
input rsi2length = 2;
input rsi2ob = 95;
input rsi2os = 5;
input rsi14length = 14;
input rsi14ob = 80;
input rsi14os = 30;
input mfilength = 14;
input mfiob = 80;
input mfios = 30;
input bmplength = 14;
input mdvl = 0.7;
input mdvh = 0.3;
input extremities = 0.005; # percentage

# Study Definitions
def bbCalc = BollingerPercentB(length = bblength);
def rsi2Calc = RSI(length = rsi2length);
def rsi14Calc = RSI(length = rsi14length);
def mfiCalc = MoneyFlowIndex(length = mfilength);
def bmpCalc = BalanceOfMarketPower(length = bmplength);

# Indicator Scoring
def bb = if (bbCalc > bbob and bbCalc < bbCalc[1]) or (bbCalc between bbob - 5 and bbob) then 1
  else if (bbCalc < bbos and bbCalc > bbCalc[1]) or (bbCalc between bbos and bbos + 5) then -1 else 0;
def rsi2 = if rsi2Calc > rsi2ob then 1 else if rsi2Calc < rsi2os then -1 else 0;
def rsi14 = if rsi14Calc > rsi14ob then 1 else if rsi14Calc < rsi14os then -1 else 0;
def mfi = if mfiCalc > mfiob then 1 else if mfiCalc < mfios then -1 else 0;
def bmp = if bmpCalc > 0 then 1 else if bmpCalc < 0 then -1 else 0;

# Requirements
def mdv = if ((high - close) / (.001 + high - low) > mdvl) then -1 else if ((high - close) / (.001 + high - low) < mdvh) then 1 else 0; # close must be near the low/high
def pc = if (high / close - 1) >= extremities then -1 else if (low / close - 1) <= -extremities then 1 else 0; # high/low must be greater than n pct from close
def gap = if close <= close[1] AND high > low[1] then -1 else if close >= close[1] AND low < high[1] then 1 else 0; # do NOT trade against a gap

# Must have 4 of 5 Indicators and requirements to signal
def LE = (bb + rsi2 + rsi14 + mfi + bmp) <= -4 and mdv == -1 and pc == -1 and gap == -1;
def SE = (bb + rsi2 + rsi14 + mfi + bmp) >= 4 and mdv == 1 and pc == 1 and gap == 1;

plot longentry = LE;
longentry.SetLineWeight(3);
longentry.SetDefaultColor(Color.GREEN);
longentry.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);

plot shortentry = SE;
shortentry.SetLineWeight(3);
shortentry.SetDefaultColor(Color.RED);
shortentry.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);

# Needed for Watchlist box painting
#AssignBackgroundColor(if SE then Color.RED else if LE then Color.GREEN else Color.Gray);
