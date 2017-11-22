input dollar_amt = 5000;
input price = close;
input bblength = 20;
input bbob = 100;
input bbos = 0;
input rsilength = 14;
input rsiob = 70;
input rsios = 30;
input mflength = 14;
input mfob = 70;
input mfos = 30;
input mdvl = .8;
input mdvh = .2;
input signal = 10;

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
# REQUIRED TO VALIDATE SIGNALS:
def mdv = if ((high - close) / (.001 + high - low) > mdvl) then -5 else if ((high - close) / (.001 + high - low) < mdvh) then 5 else 0; # close must be near the low
def PercentChgHi = Average(100 * (high / close - 1), 1) >= 2; # high must be greater than 2 pct from close
def HeavyVol = VolumeAvg() < VolumeAvg().VolAvg * 2; # volume cannot be greater than 2 times the average

# Point Sum
def sum = bb + rsi_2 + rsi_14 + mfi + mdv;

# Normalize 0-100
def lowest_k = -25; # hard coded values based on Point Sum
def highest_k = 25; # hard coded values based on Point Sum
def norm = ((sum - lowest_k) / (highest_k - lowest_k)) * 100;
def entry = norm <= signal and mdv == -5 and PercentChgHi and HeavyVol;

## EXIT
def entryPrice = EntryPrice();
def pricetarget = if high > (entryPrice*0.02) + entryPrice then (entryPrice*0.02) + entryPrice else Double.NaN; # 2 percent of entry price 
def targetreached = high >= pricetarget;
def Shares = AbsValue(Round(dollar_amt / close));

AddOrder(condition = entry is true, tradeSize = Shares, tickcolor = GetColor(0), arrowcolor = GetColor(0), name = "LE", price = close()[0]);
AddOrder(OrderType.SELL_TO_CLOSE, targetreached is true, tradeSize = Shares, tickcolor = GetColor(1), arrowcolor = GetColor(1), name = "LX", price = pricetarget);