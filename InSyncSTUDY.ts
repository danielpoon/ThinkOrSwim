# InSync
# Drew Griffith

#hint: Mean Reversion ENTRY Strategy. The default inputs are based on stocks that are more volatile in nature. If you prefer to trade less volatile stocks, you should lower the extremeties input. This strategy looks for long term trending stocks above EMA300, SMA200 or linearregressionslope; Also, there are additional filters in place to ensure a better entry signal. The strategy is based on closing prices of the day of signal, so buy as close to the EOD as possible. The target is the high price of the day of entry. Ideal hold times are less than 5 days. On day 5, the position moves to breakeven. Optimized for use on daily charts.

declare upper;

input BubbleOn = yes;
input extremities = 2.0; #percentage
def ema_length = 300;
def slope_length = 60;
def bb_length = 20;
def rsi2_length = 2;
input rsi2_oversold = 5;
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
  and rsi2 < rsi2_oversold
  and rsi14 < 40
  and mf < 35
  and bomp < 0 then 1
  else if (!ema and slp)
  and barcomponents == 1
  and bbCalc < 5
  and stoch < 20
  and rsi2 < rsi2_oversold
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

## Alerts
Alert(LE, "inSync Long Entry", "alert type" = Alert.BAR, sound = Sound.Ding);

## Needed for Watchlist box painting
#AssignBackgroundColor(if signal then Color.GREEN else Color.GRAY);
