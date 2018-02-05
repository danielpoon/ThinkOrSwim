# ConnorsRSI Indicator

declare upper;

input BubbleOn = yes;
input Price_RSI_Period = 3;
input Streak_RSI_Period = 2;
input Rank_Lookback = 100;
input OVER_BOUGHT = 95;
input OVER_SOLD = 5;
input PRICE = CLOSE;

# Component 1: the RSI of closing price
def priceRSI = RSI("price" = PRICE, "length" = Price_RSI_Period);

# Component 2: the RSI of the streak
def upDay = if PRICE > PRICE[1] then 1 else 0;
def downDay = if PRICE < PRICE[1] then -1 else 0;
def upStreak = if upDay != 0 then upStreak[1] + upDay else 0;
def downStreak = if downDay != 0 then downStreak[1] + downDay else 0;
def streak = upStreak + downStreak;
def streakRSI = reference RSI("price" = streak, "length" = Streak_RSI_Period);

# Componenet 3: The percent rank of the current return
def ROC1 = PRICE / PRICE[1] - 1;

def rank = fold i = 1 to Rank_Lookback + 1 with r = 0 do
r + (GetValue(ROC1, i, Rank_Lookback) < ROC1) ;

def pctRank = (rank / Rank_Lookback) * 100 ;

# The final ConnorsRSI calculation, combining the three components
plot ConnorsRSI = Round((priceRSI + streakRSI + pctRank) / 3, 1);
ConnorsRSI.hide();
ConnorsRSI.AssignValueColor(if ConnorsRSI >= OVER_BOUGHT then Color.RED else if ConnorsRSI <= OVER_SOLD then Color.GREEN else Color.GRAY);
ConnorsRSI.SetLineWeight(2);

plot OVERBOUGHT = OVER_BOUGHT;
OVERBOUGHT.hide();
OVERBOUGHT.SetDefaultColor(Color.DARK_GRAY);

plot OVERSOLD = OVER_SOLD;
OVERSOLD.hide();
OVERSOLD.SetDefaultColor(Color.DARK_GRAY);

# Does stock meet ANY long term trend filters?
def ema = close > MovAvgExponential(length = 300);
def slp = LinearRegressionSlope(length = 60) > -0.03;

# Does stock meet "bar" components?
def barcomponents = if ((high - close) / (.001 + high - low) >= 0.6) ## long candle; close below midbody
  and ((high / close - 1) * 100) >= 2.0 ## high/low must be greater than n pct from close
  and close <= close[1] and high > low[1] then 1 ## do NOT trade against a gap
  else 0;

plot LE = ConnorsRSI < OVER_SOLD and (ema or slp) and barcomponents;
LE.SetDefaultColor(Color.CYAN);
LE.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
LE.SetLineWeight(1);
AddChartBubble("time condition" = BubbleOn and LE, "price location" = low, text = "ConnorsRSI", color = Color.CYAN, up = NO);
