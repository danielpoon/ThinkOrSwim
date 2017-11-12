# InSync

# This is index is formed from signals on a variety of different technical indicators, and used
# to determine extreme overbought/oversold values in the market.
# Originally coded by Eric Rasmussen and modified by Drew Griffith
#
# The InSyncLite is used detect extreme levels.
# Values higher or equal to 100 are considered to be high extreme levels. (short entry)
# Values lower or equal than 0 are considered to be low extreme levels. (long entry)

# Optimized for use on daily charts

declare upper;

# Data Smoothing Input
input smooth = 1;

# Study Definitions
def bbCalc = BollingerPercentB();
def rsi2 = RSI(length = 2);
def rsi14 = RSI(length = 14);
def stoch = StochasticFull("k period" = 5);
def mf = MoneyFlowIndex();

# Indicator Scoring
def bb = if (bbCalc > 100 and bbCalc < bbCalc[1]) or (bbCalc between 95 and 100) then 5 else if (bbCalc < 0 and bbCalc > bbCalc[1]) or (bbCalc between 0 and 5) then -5 else 0;
def sto = if stoch > 80 then 5 else if stoch < 20 then -5 else 0;
def rsi_2 = if rsi2 > 95 then 5 else if rsi2 < 5 then -5 else 0;
def rsi_14 = if rsi14 > 70 then 5 else if rsi14 < 30 then -5 else 0;
def mfi = if mf > 70 then 5 else if mf < 30 then -5 else 0;

# Point Sum
def sum = bb + sto + rsi_2 + rsi_14 + mfi;

# Normalize 0-100
def lowest_k = -25;
def highest_k = 25;
def norm = ((sum-lowest_k) / (highest_k-lowest_k))*100 ;

# Plots
plot inSync = norm;
inSync.Hide();
plot bullish = norm ==0;
plot bearish = norm ==100;

BULLISH.SetDefaultColor(CreateColor(0, 255, 0));
BULLISH.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
BULLISH.setLineWeight(5);
BEARISH.SetDefaultColor(CreateColor(255, 0, 0));
BEARISH.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
BEARISH.setLineWeight(5);

# Add label
AddLabel(inSync, inSync, if inSync >= 50 then Color.Red else if inSync < 50 then Color.Green else Color.gray);

# Alerts
Alert((norm == 0), "inSync LE", "alert type" = Alert.BAR, sound = Sound.Ding);
Alert((norm == 100), "inSync SE", "alert type" = Alert.BAR, sound = Sound.Ding);

# Needed for Watchlist box painting
#AssignBackgroundColor(if norm == 100 then Color.RED else if norm == 0 then Color.GREEN else Color.Gray);
