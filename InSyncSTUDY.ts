# InSync
# Drew Griffith
#hint: Mean Reversion Strategy. The default inputs are based on stocks that are more volatile in nature. If you prefer to trade less volatile stocks, you should lower the extremeties input. For good, long term trending stocks (above EMA300), the requirements for entry are not as strict in setting overbought/sold signals. For stocks that signal against the long term trend the entry requirements are more strict. The requirements for shorting signals are much more strict than long signals. Also, there are additional filters in place to ensure a better entry signal. The strategy is based on closing prices of the day of signal, so buy as close to the EOD as possible. The study will paint suggested exits during the 1-3 days following the entry. Ideal hold times are less than 3 days. On day 3, the position moves to breakeven. The study will paint suggested exits during the 1-3 days following the entry.

declare upper;

input ma_length = 300;
input bblength = 20;
input bbob = 100;
input bbos = 0;
input rsi2length = 2;
input rsi2ob = 99;
input rsi2os = 5;
input rsi14length = 14;
input rsi14ob = 80;
input rsi14os = 30;
input mfilength = 14;
input mfiob = 80;
input mfios = 30;
input bmplength = 14;
input mdvl = 0.6;
input mdvh = 0.4;
input extremities = 1.5; # percentage

# Study Definitions
def maCalc = MovAvgExponential(length = ma_length);
def bbCalc = BollingerPercentB(length = bblength);
def rsi2Calc = RSI(length = rsi2length);
def rsi14Calc = RSI(length = rsi14length);
def mfiCalc = MoneyFlowIndex(length = mfilength);
def bmpCalc = BalanceOfMarketPower(length = bmplength);

# indicator Scoring/Requirements
def ma = if close >= maCalc then -1 else 1;
def bb = if (bbCalc >= bbob) then 1 else if (bbCalc <= bbos) then -1 else 0;
def rsi2 = if rsi2Calc >= rsi2ob then 1 else if rsi2Calc <= rsi2os then -1 else 0;
def rsi14 = if rsi14Calc >= rsi14ob then 1 else if rsi14Calc <= rsi14os then -1 else 0;
def mfi = if mfiCalc >= mfiob then 1 else if mfiCalc <= mfios then -1 else 0;
def bmp = if bmpCalc >= 0 then 1 else if bmpCalc <= 0 then -1 else 0;

# close must be near the low/high
def mdv = if ((high - close) / (.001 + high - low) >= mdvl) then -1 else if ((high - close) / (.001 + high - low) <= mdvh) then 1 else 0;
# high/low must be greater than n pct from close
def pc = if ((high / close - 1) * 100) >= extremities then -1 else if ((low / close - 1) * 100) <= -extremities then 1 else 0;
# do NOT trade against a gap
def gap = if close <= close[1] and high > low[1] then -1 else if close >= close[1] and low < high[1] then 1 else 0;

plot LE = if (bb + rsi2 + rsi14 + mfi + bmp) <= -5 and mdv == -1 and pc == -1 and gap == -1 then 1 else if ma == -1 and bb == -1 and rsi2 == -1 and mdv == -1 and pc == -1 and gap == -1 then 1 else 0;

plot SE = if (bb + rsi2 + rsi14 + mfi + bmp) >= 5 and mdv == 1 and pc == 1 and gap == 1 then 1 else if ma == 1 and bb == 1 and rsi2 == 1 and mdv == 1 and pc == 1 and gap == 1 then 1 else 0;

LE.SetLineWeight(3);
LE.SetDefaultColor(Color.GREEN);
LE.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
SE.SetLineWeight(3);
SE.SetDefaultColor(Color.RED);
SE.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);

# Show price targets
def pricetarget = if LE and Average(100 * (high[0] / close[0] - 1), 1) >= (extremities * 2) then ((close[0] * (Average((high[0] / close[0] - 1), 1)) / 2) + close[0])
    else if LE and Average(100 * (high[0] / close[0] - 1), 1) < (extremities * 2) then ((close[0] * (extremities / 100)) + close[0])
    else Double.NaN;

def pt = if LE then pricetarget
    else if LE[1] then pricetarget[1]
    else if LE[2] then pricetarget[2]
    else if LE[3] then close[3]
    else Double.NaN;

plot target = pt;
target.SetPaintingStrategy(PaintingStrategy.DASHES);
target.SetLineWeight(3);
target.AssignValueColor(if high < pt then Color.RED else Color.WHITE);

plot sum = bb + rsi2 + rsi14 + mfi + bmp + mdv + pc + gap;
sum.hide();

# Add label
AddLabel(1, "InSync = " + sum , if LE then Color.GREEN else if SE then Color.RED else Color.GRAY);

# Needed for Watchlist box painting
#AssignBackgroundColor(if SE then Color.RED else if LE then Color.GREEN else Color.Gray);
#END
