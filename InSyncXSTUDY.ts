# InSyncX
# Drew Griffith

#hint: Mean Reversion EXIT Strategy. The default inputs are based on stocks that are more volatile in nature. If you prefer to trade less volatile stocks, you should lower the extremeties input. For good, long term trending stocks (above EMA300), the requirements for entry are not as strict in setting overbought/sold signals. For stocks that signal against the long term trend the entry requirements are more strict. The requirements for shorting signals are much more strict than long signals. Also, there are additional filters in place to ensure a better entry signal. The strategy is based on closing prices of the day of signal, so buy as close to the EOD as possible. The target is sumally the high price of the day of entry. Ideal hold times are less than 3-4 days. On day 3-4, the position moves to breakeven. Optimized for use on daily charts. This script portion that determines entry should be the same as InSync. The code for InSync.LX/SX has been removed so that code in the InSync entry will run faster in watchlist scans.

declare upper;

input BubbleOn = yes;
input extremities = 2.0; #percentage

script insync {

input BubbleOn = yes;
input extremities = 2.0; #percentage
def ema_length = 300;
def slope_length = 60;
def bb_length = 20;
def rsi2_length = 2;
def rsi14_length = 14;
def stoch_length = 14;
def mfi_length = 14;
def bmp_length = 14;
def mdvl = 0.6;

## Does stock meet indicator requirements? (no shorting)
def bbCalc = BollingerPercentB(length = bb_length);
def stoch = StochasticFull("k period" = stoch_length);
def rsi2 = RSI(length = rsi2_length);
def rsi14 = RSI(length = rsi14_length);
def mf = MoneyFlowIndex(length = mfi_length);
def bomp = BalanceOfMarketPower(length = bmp_length);

# Does stock meet ANY long term trend filters?
def ema = close > MovAvgExponential(length = ema_length);
def slp = LinearRegressionSlope(length = slope_length) > -0.03;

# Does stock meet "bar" components?
def barcomponents = if ((high - close) / (.001 + high - low) >= mdvl) ## long candle; close below midbody
  and ((high / close - 1) * 100) >= extremities ## high/low must be greater than n pct from close
  and close <= close[1] and high > low[1] then 1 ## do NOT trade against a gap
  else 0;

def signal = if (ema)
  and barcomponents == 1
  and bbCalc < 5
  and stoch < 20
  and rsi2 < 5
  and rsi14 < 40
  and mf < 35
  and bomp < 0 then 1
  else if (!ema and slp)
  and barcomponents == 1
  and bbCalc < 5
  and stoch < 20
  and rsi2 < 5
  and rsi14 < 30
  and mf < 30
  and bomp < 0 then 1
  else 0;

## Plots
plot inSync = rsi2;
inSync.Hide();
plot LE = signal == 1;
LE.SetDefaultColor(Color.GREEN);
LE.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
LE.SetLineWeight(1);
AddChartBubble(BubbleOn and LE, low, "InSync", Color.GREEN, no);
}

def bullish = inSync().LE;

# Show price targets (if high is greater than 9%, then use midbody value of candle)
def pricetarget = if bullish and Average(100 * (high[0] / close[0] - 1), 1) >= (extremities) AND Average(100 * (high[0] / close[0] - 1), 1) <= 9 then HIGH
    else if bullish and Average(100 * (high[0] / close[0] - 1), 1) >= (extremities) AND Average(100 * (high[0] / close[0] - 1), 1) > 9 then ((close[0] * (Average((high[0] / close[0] - 1), 1)) / 2) + close[0])
    else if bullish and Average(100 * (high[0] / close[0] - 1), 1) < (extremities) then ((close[0] * (extremities / 100)) + close[0])
    else Double.NaN;

def pt = if bullish then pricetarget
    else if bullish[1] then pricetarget[1]
    else if bullish[2] then pricetarget[2]
    else if bullish[3] then pricetarget[3]
    else if bullish[4] then pricetarget[4]
    else if bullish[5] then close[5]
    else Double.NaN;

plot target = pt;

target.SetPaintingStrategy(PaintingStrategy.DASHES);
target.SetLineWeight(3);
target.AssignValueColor(if high < pt then Color.RED else Color.WHITE);
