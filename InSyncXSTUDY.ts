# InSyncX
# Drew Griffith

#hint: Mean Reversion EXIT Strategy. The default inputs are based on stocks that are more volatile in nature. If you prefer to trade less volatile stocks, you should lower the extremeties input. For good, long term trending stocks (above EMA300), the requirements for entry are not as strict in setting overbought/sold signals. For stocks that signal against the long term trend the entry requirements are more strict. The requirements for shorting signals are much more strict than long signals. Also, there are additional filters in place to ensure a better entry signal. The strategy is based on closing prices of the day of signal, so buy as close to the EOD as possible. The target is sumally the high price of the day of entry. Ideal hold times are less than 3-4 days. On day 3-4, the position moves to breakeven. Optimized for use on daily charts. This script portion that determines entry should be the same as InSync. The code for InSync.LX/SX has been removed so that code in the InSync entry will run faster in watchlist scans.

declare upper;

input extremities = 1.5; #percentage
input rsi2ob = 98;
input rsi2os = 5;

script insync {

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

## Study Definitions
def ema = MovAvgExponential(length = ma_length);
def bbCalc = BollingerPercentB(length = bb_length);
def stoch = StochasticFull("k period" = stoch_length);
def rsi2 = RSI(length = rsi2_length);
def rsi14 = RSI(length = rsi14_length);
def mf = MoneyFlowIndex(length = mfi_length);
def bomp = BalanceOfMarketPower(length = bmp_length);

## Indicator Scoring (shorting is more strict); TOTAL equals for short (100) and long (-100)
def bb = if bbCalc > bbob then 20 else if bbCalc < bbos then -20 else 0;
def sto = if stoch > 80 then 15 else if stoch < 20 then -15 else 0;
def rsi_2 = if rsi2 > rsi2ob then 20 else if rsi2 < rsi2os then -20 else 0;
def rsi_14 = if rsi14 > rsi14ob then 15 else if (rsi14 < rsi14os + 10 and close > ema) then -15 else if (rsi14 < rsi14os and close < ema) then -15 else 0;
def mfi = if mf > mfiob then 15 else if (mf < mfios + 5 and close > ema) then -15 else if (mf < mfios and close < ema) then -15 else 0;
def bop = if bomp > 0 then 15 else if bomp < 0 then -15 else 0;

## Point Sum
def sum = bb + sto + rsi_2 + rsi_14 + mfi + bop;

## close must be near the low/high
def mdv = if ((high - close) / (.001 + high - low) >= mdvl) then -1 else if ((high - close) / (.001 + high - low) <= mdvh) then 1 else 0;
## high/low must be greater than n pct from close
def pc = if ((high / close - 1) * 100) >= extremities then -1 else if ((low / close - 1) * 100) <= -extremities then 1 else 0;
## do NOT trade against a gap
def gap = if close <= close[1] and high > low[1] then -1 else if close >= close[1] and low < high[1] then 1 else 0;

## Plots
plot inSync = sum;
inSync.Hide();
plot long_warning = sum == -100 and (mdv + pc + gap) <> -3;
Long_warning.SetDefaultColor(Color.YELLOW);
Long_warning.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
Long_warning.SetLineWeight(3);
plot long_confirmed = sum == -100 and (mdv + pc + gap) == -3;
long_confirmed.SetDefaultColor(Color.GREEN);
long_confirmed.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
long_confirmed.SetLineWeight(5);

plot short_warning = sum == 100 and (mdv + pc + gap) <> 3;
short_warning.SetDefaultColor(Color.ORANGE);
short_warning.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
short_warning.SetLineWeight(5);
plot short_confirmed = sum == 100 and (mdv + pc + gap) == 3;
short_confirmed.SetDefaultColor(Color.RED);
short_confirmed.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
short_confirmed.SetLineWeight(5);
}

#def bullish = inSync()==-100;
def bullish = inSync().long_confirmed;

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
