# InSync

# This is index is formed from signals on a variety of different technical indicators, and used
# to determine extreme overbought/oversold values in the market.
# Values higher or equal to 90 are considered to be high extreme levels;
# Values lower or equal than 10 are considered to be low extreme levels;

# Optimized for use on daily charts

declare upper;

input bblength = 20;
input bbob = 100;
input bbos = 0;
input rsilength = 14;
input rsiob = 70;
input rsios = 30;
input mflength = 14;
input mfob = 70;
input mfos = 30;
input mdvl = 0.75;
input mdvh = 0.25;
input OBsignal = 90;
input OSsignal = 10;
input extremities = 0.015; # percentage

# Study Definitions
def bbCalc = BollingerPercentB(length = bblength);
def rsi2 = RSI(length = 2); # hard coded values
def rsi14 = RSI(length = rsilength);
def mf = MoneyFlowIndex(length = mflength);

# Indicator Scoring
def bb = if (bbCalc > bbob and bbCalc < bbCalc[1]) or (bbCalc between bbob - 5 and bbob) then 5 else if (bbCalc < bbos and bbCalc > bbCalc[1]) or (bbCalc between bbos and bbos + 5) then -5 else 0;
def rsi_2 = if rsi2 > 95 then 5 else if rsi2 < 5 then -5 else 0; # hard coded values
def rsi_14 = if rsi14 > rsiob then 5 else if rsi14 < rsios then -5 else 0;
def mfi = if mf > mfob then 5 else if mf < mfos then -5 else 0;
#REQUIRED
def mdv = if ((high - close) / (.001 + high - low) > mdvl) then -5 else if ((high - close) / (.001 + high - low) < mdvh) then 5 else 0; # close must be near the low
#REQUIRED
def pc = if Average((high / close - 1), 1) >= extremities then -5 else if Average((low / close - 1),1) <= -extremities then 5 else 0; # high/low must be greater than n pct from close
#REQUIRED
def gap = if close <= close[1] AND high > low[1] then -5 else if close >= close[1] AND low < high[1] then 5 else 0; # do NOT trade against a gap


# Point Sum
def sum = bb + rsi_2 + rsi_14 + mfi + mdv;

# Normalize 0-100
def lowest_k = -25; # hard coded values based on Point Sum
def highest_k = 25; # hard coded values based on Point Sum
def norm = ((sum - lowest_k) / (highest_k - lowest_k)) * 100;

# Plots
plot inSync = norm;
inSync.Hide();
inSync.AssignValueColor(if inSync >= OBsignal then Color.RED else if inSync <= OSsignal then Color.GREEN else Color.GRAY);
inSync.SetLineWeight(2);

plot bullish = norm <= OSsignal and mdv == -5 and pc == -5 and gap == -5;
bullish.SetLineWeight(5);
bullish.SetDefaultColor(CreateColor(0, 255, 0));
bullish.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);

plot bearish = norm >= OBsignal and mdv == 5 and pc == 5 and gap == 5;
bearish.SetLineWeight(5);
bearish.SetDefaultColor(CreateColor(255, 0, 0));
bearish.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);

plot extremeHigh = OBsignal;
extremeHigh.SetDefaultColor(Color.GRAY);
extremeHigh.Hide();

plot extremeLow = OSsignal;
extremeLow.SetDefaultColor(Color.GRAY);
extremeLow.Hide();

# Add label
AddLabel(inSync, inSync, if inSync == OBsignal then Color.RED else if inSync == OSsignal then Color.GREEN else Color.GRAY);

# Alerts
#Alert((norm == 0), "inSync LE", "alert type" = Alert.BAR, sound = Sound.Ding);
#Alert((norm == 100), "inSync SE", "alert type" = Alert.BAR, sound = Sound.Ding);

# Needed for Watchlist box painting
#AssignBackgroundColor(if norm == 100 then Color.RED else if norm == 0 then Color.GREEN else Color.Gray);
