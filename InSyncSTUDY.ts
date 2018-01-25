# InSync
# Drew Griffith

#hint: Mean Reversion Strategy. The default inputs are based on stocks that are more volatile in nature. If you prefer to trade less volatile stocks, you should lower the extremeties input. For good, long term trending stocks (above EMA300), the requirements for entry are not as strict in setting overbought/sold signals. For stocks that signal against the long term trend the entry requirements are more strict. The requirements for shorting signals are much more strict than long signals. Also, there are additional filters in place to ensure a better entry signal. The strategy is based on closing prices of the day of signal, so buy as close to the EOD as possible. The target is normally the high price of the day of entry. Ideal hold times are less than 3-4 days. On day 3-4, the position moves to breakeven. Optimized for use on daily charts

declare upper;

input extremities = 1.5; #percentage
def ma_length = 300;
def bb_length = 20;
def bbob = 100;
def bbos = 5;
def rsi2_length = 2;
input rsi2ob = 98;
input rsi2os = 5;
def rsi14_length = 14;
def rsi14ob = 80;
def rsi14os = 30;
def stoch_length = 14;
def mfi_length = 14;
def mfiob = 80;
def mfios = 30;
def bmp_length = 14;
def mdvl = 0.6;
def mdvh = 0.4;

# Study Definitions
def bbCalc = BollingerPercentB(length = bb_length);
def rsi2 = RSI(length = rsi2_length);
def rsi14 = RSI(length = rsi14_length);
def stoch = StochasticFull("k period" = stoch_length);
def mf = MoneyFlowIndex(length = mfi_length);
def bomp = BalanceOfMarketPower(length = bmp_length);
def ema = MovAvgExponential(length = ma_length);

# Indicator Scoring (shorting is more strict)
def bb = if bbCalc > bbob then 5 else if bbCalc < bbos then -5 else 0;
def sto = if stoch > 80 then 5 else if stoch < 20 then -5 else 0;
def rsi_2 = if rsi2 > rsi2ob then 5 else if rsi2 < rsi2os then -5 else 0;
def rsi_14 = if rsi14 > rsi14ob then 5 else if (rsi14 < rsi14os + 5 and close > ema) then -5 else if (rsi14 < rsi14os and close < ema) then -5 else 0;
def mfi = if mf > mfiob then 5 else if mf < mfios then -5 else 0;
def bop = if bomp > 0 then 5 else if bomp < 0 then -5 else 0;

# Point Sum
def sum = bb + sto + rsi_2 + rsi_14 + mfi + bop;

# Normalize 0-100
def lowest_k = -30;
def highest_k = 30;
def norm = ((sum - lowest_k) / (highest_k - lowest_k)) * 100;

# close must be near the low/high
def mdv = if ((high - close) / (.001 + high - low) >= mdvl) then -1 else if ((high - close) / (.001 + high - low) <= mdvh) then 1 else 0;
# high/low must be greater than n pct from close
def pc = if ((high / close - 1) * 100) >= extremities then -1 else if ((low / close - 1) * 100) <= -extremities then 1 else 0;
# do NOT trade against a gap
def gap = if close <= close[1] and high > low[1] then -1 else if close >= close[1] and low < high[1] then 1 else 0;

# Plots
plot inSync = norm;
inSync.Hide();
plot bullish = norm == 0 and mdv == -1 and pc == -1 and gap == -1;
plot bearish = norm == 100 and mdv == 1 and pc == 1 and gap == 1;

bullish.SetDefaultColor(CreateColor(0, 255, 0));
bullish.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
bullish.SetLineWeight(5);
bearish.SetDefaultColor(CreateColor(255, 0, 0));
bearish.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
bearish.SetLineWeight(5);

# Add label
AddLabel(inSync, inSync, if bullish then Color.RED else if bearish then Color.GREEN else Color.GRAY);

# Alerts
Alert((norm == 0), "inSync LE", "alert type" = Alert.BAR, sound = Sound.Ding);
Alert((norm == 100), "inSync SE", "alert type" = Alert.BAR, sound = Sound.Ding);

# Needed for Watchlist box painting
#AssignBackgroundColor(if norm == 100 then Color.RED else if norm == 0 then Color.GREEN else Color.Gray);
