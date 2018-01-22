# VRatio
# Drew Griffith
# Version 0.2
#hint: An adaptation of the Volatility Risk Premium strategy. Strategy is effectively observe near/at the close, buy at the close.

input ma_len = 9; # 10
input ma_len2 = 3; # 10
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
input sym3 = "XIV";
input average_type = AverageType.EXPONENTIAL;
input dollars = 10000;

def Shares = AbsValue(Round(dollars / close));

def cl1 = close(sym1);
def cl2 = close(sym2);

def vix_op = open(sym2);
def vix_cl = close(sym2);
def vix_hi = high(sym2);
def vix_lo = low(sym2);

def xiv_cl = close(sym3);
def xiv_hi = high(sym3);
def xiv_lo = low(sym3);

# calc ADX
def hiDiff = xiv_hi - xiv_hi[1];
def loDiff = xiv_lo[1] - xiv_lo;

def plusDM = if hiDiff > loDiff and hiDiff > 0 then hiDiff else 0;
def minusDM =  if loDiff > hiDiff and loDiff > 0 then loDiff else 0;

def ATR = MovingAverage(AverageType.WILDERS, TrueRange(xiv_hi, xiv_cl, xiv_lo), 14);
def "DI+" = 100 * MovingAverage(AverageType.WILDERS, plusDM, 14) / ATR;
def "DI-" = 100 * MovingAverage(AverageType.WILDERS, minusDM, 14) / ATR;

def DX = if ("DI+" + "DI-" > 0) then 100 * AbsValue("DI+" - "DI-") / ("DI+" + "DI-") else 0;
def ADX = MovingAverage(AverageType.WILDERS, DX, 14);

# calc CVR3
def e1 = MovAvgExponential(vix_cl, 1);
def e2 = MovAvgExponential(vix_cl, 10);
def ema = MovAvgExponential(vix_cl, 10);
def p = (e1 - e2) / e2 * 100;
def ppo = -Average(p, 1); # inverse of normal calc

# calc EMA5 and EMA300
def ema5 = MovAvgExponential(length = 5);
def ema300 = MovAvgExponential(length = 300);

# calc vRatio
plot ma_vRatio = Round(MovingAverage(average_type, cl2 / cl1, ma_len), 3);
plot ma_vRatio2 = Round(MovingAverage(average_type, ma_vRatio, ma_len2), 3);

def CVR3enrtry = if ppo < ppo_l_res and vix_lo > ema and vix_cl > vix_op then 1 else 0;

def LE = (ma_vRatio[1] >= res2 and ma_vRatio <= res2)
  or (ma_vRatio[10] > res3
      and ma_vRatio[1] > res3
      and ma_vRatio <= res3)
  or (Highest(ma_vRatio, 10) < res3
      and Lowest(ADX, 10) > ADX_threshold
      and ma_vRatio <= res3
      and ma_vRatio < ma_vRatio2
      and ma_vRatio[1] >= ma_vRatio2[1])
  or (ma_vRatio < res1
      and CVR3enrtry == 1
      and xiv_hi > xiv_lo[1]
      and ((xiv_hi - xiv_cl) / (.001 + xiv_hi - xiv_lo) > 0.5)
      and ADX >= ADX_threshold
      and (open > ema300 and close > ema300 or open < ema300 and close < ema300))
  or (ma_vRatio < res1
      and Highest(CVR3enrtry, 5) > 0
      and (close > ema300) and (close > ema5));

def LX = (ma_vRatio >= res1)
  or (ma_vRatio[1] < res3 and ma_vRatio >= res3 and !LE)
  or (ma_vRatio[1] < res2 and ma_vRatio >= res2 and !LE)
  or (ADX <= ADX_threshold and ma_vRatio > ma_vRatio2 and !LE);

AddOrder(OrderType.BUY_AUTO, LE, tickcolor = GetColor(1), arrowcolor = GetColor(1), name = "VRLE", tradeSize = Shares, price = close);
AddOrder(OrderType.SELL_TO_CLOSE, LX, tickcolor = GetColor(2), arrowcolor = GetColor(2), name = "VRLX", tradeSize = Shares, price = close);
