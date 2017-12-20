input VR_MA1 = 9;
input VR_MA2 = 3;
input res1 = 1.0;
input res2 = .95;
input res3 = .9;
input ADX_threshold = 16;
input ppo_ema1 = 1;
input ppo_ema2 = 10;
input ppo_price_ema = 10;
input ppo_h_res = 12;
input ppo_l_res = -12;
input sym1 = "VIX3M";
input sym2 = "VIX";
input average_type = AverageType.EXPONENTIAL;
input dollars = 10000;

def Shares = AbsValue(Round(dollars / close));

def cl1 = close(sym1);
def cl2 = close(sym2);

def vix_op = open(sym2);
def vix_cl = close(sym2);
def vix_hi = high(sym2);
def vix_lo = low(sym2);

def adx = ADX();

def e1 = MovAvgExponential(vix_cl, ppo_ema1);
def e2 = MovAvgExponential(vix_cl, ppo_ema2);
def ema = MovAvgExponential(vix_cl, ppo_price_ema);
def p = (e1 - e2) / e2 * 100;
def ppo = -Average(p, 1); # inverse of normal calc

def ma_vRatio = Round(MovingAverage(average_type, cl2 / cl1, VR_MA1), 3);
def ma_vRatio2 = Round(MovingAverage(average_type, ma_vRatio, VR_MA2), 3);

def LE = (ma_vRatio[1] >= res2 and ma_vRatio <= res2)
  or (ma_vRatio[10] > res3 and ma_vRatio[1] > res3 and ma_vRatio <= res3)
  or (highest(ma_vRatio, 10) < res3 and lowest(adx,10) > ADX_threshold and ma_vRatio <= res3 and ma_vRatio < ma_vRatio2 and ma_vRatio[1] >= ma_vRatio2[1])
  or (ma_vRatio < res1 and high > low[1] and ppo < ppo_l_res and vix_lo > ema and vix_cl > vix_op and ((high - close) / (.001 + high - low) > 0.5)); #CVR3; no gaps; long red candlestick

def LX = (ma_vRatio > res1)
  or (ma_vRatio[1] < res3 and ma_vRatio >= res3 and !LE)
  or (ma_vRatio[1] < res2 and ma_vRatio >= res2 and !LE)
  or (adx <= ADX_threshold and ma_vRatio > ma_vRatio2 and !LE);

def signal = CompoundValue(1, if LE then 1
  else if !LE and LX and ma_vRatio >= res3 and ma_vRatio >= ma_vRatio2 then -1
  else if LX then 0
  else if !LX and !LE then signal[1]
  else 0, 0);

def SE = signal == -1;
def SX = signal <> -1; #(ma_vRatio[1] > ma_vRatio2[1] and ma_vRatio <= ma_vRatio2) OR

AddOrder(OrderType.SELL_TO_OPEN, SE, tickcolor = GetColor(1), arrowcolor = GetColor(1), name = "VRSE", tradeSize = Shares, price = close);
AddOrder(OrderType.BUY_TO_CLOSE, SX, tickcolor = GetColor(2), arrowcolor = GetColor(2), name = "VRSX", tradeSize = Shares, price = close);
